import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { data: isAdminData } = await supabaseClient.rpc("is_admin", { _user_id: user.id });
    if (!isAdminData) throw new Error("Admin access required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { code, type, value, plan_id, starts_at, ends_at, max_uses, max_uses_per_user, min_amount } = body;

      // Create Stripe coupon
      const couponParams: any = {
        name: code,
      };
      if (type === "percent") {
        couponParams.percent_off = value;
      } else {
        couponParams.amount_off = Math.round(value * 100); // cents
        couponParams.currency = "brl";
      }
      if (max_uses) couponParams.max_redemptions = max_uses;
      if (ends_at) couponParams.redeem_by = Math.floor(new Date(ends_at).getTime() / 1000);

      const stripeCoupon = await stripe.coupons.create(couponParams);

      // Create promotion code in Stripe
      const promoCode = await stripe.promotionCodes.create({
        coupon: stripeCoupon.id,
        code: code.toUpperCase(),
        active: true,
      });

      // Save to Supabase
      const { data: couponData, error: couponError } = await supabaseClient
        .from("coupons")
        .insert({
          code: code.toUpperCase(),
          type,
          value,
          plan_id: plan_id || null,
          starts_at: starts_at || new Date().toISOString(),
          ends_at: ends_at || null,
          max_uses: max_uses || null,
          max_uses_per_user: max_uses_per_user || 1,
          min_amount: min_amount || null,
          stripe_coupon_id: stripeCoupon.id,
          stripe_promotion_code_id: promoCode.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (couponError) throw new Error(`DB error: ${couponError.message}`);

      return new Response(JSON.stringify({ success: true, coupon: couponData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data, error } = await supabaseClient
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(`DB error: ${error.message}`);

      return new Response(JSON.stringify({ coupons: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "toggle") {
      const { coupon_id, is_active } = body;

      // Update Stripe promotion code
      const { data: coupon } = await supabaseClient
        .from("coupons")
        .select("stripe_promotion_code_id")
        .eq("id", coupon_id)
        .single();

      if (coupon?.stripe_promotion_code_id) {
        await stripe.promotionCodes.update(coupon.stripe_promotion_code_id, { active: is_active });
      }

      const { error } = await supabaseClient
        .from("coupons")
        .update({ is_active })
        .eq("id", coupon_id);

      if (error) throw new Error(`DB error: ${error.message}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { coupon_id } = body;

      const { data: coupon } = await supabaseClient
        .from("coupons")
        .select("stripe_coupon_id")
        .eq("id", coupon_id)
        .single();

      if (coupon?.stripe_coupon_id) {
        try { await stripe.coupons.del(coupon.stripe_coupon_id); } catch { /* ignore */ }
      }

      const { error } = await supabaseClient
        .from("coupons")
        .delete()
        .eq("id", coupon_id);

      if (error) throw new Error(`DB error: ${error.message}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("manage-coupons error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
