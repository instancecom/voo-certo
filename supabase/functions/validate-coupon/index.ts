import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { code, plan_id } = await req.json();
    if (!code) throw new Error("Code is required");

    const { data: coupon, error } = await supabaseClient
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return new Response(JSON.stringify({ valid: false, message: "Cupom não encontrado ou inativo" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check expiration
    if (coupon.ends_at && new Date(coupon.ends_at) < new Date()) {
      return new Response(JSON.stringify({ valid: false, message: "Cupom expirado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check start date
    if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
      return new Response(JSON.stringify({ valid: false, message: "Cupom ainda não está ativo" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check max uses
    if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
      return new Response(JSON.stringify({ valid: false, message: "Cupom atingiu o limite de usos" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check per-user usage
    if (coupon.max_uses_per_user) {
      const { count } = await supabaseClient
        .from("coupon_uses")
        .select("id", { count: "exact" })
        .eq("coupon_id", coupon.id)
        .eq("user_id", user.id);

      if ((count || 0) >= coupon.max_uses_per_user) {
        return new Response(JSON.stringify({ valid: false, message: "Você já usou este cupom" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Check plan restriction
    if (coupon.plan_id && plan_id && coupon.plan_id !== plan_id) {
      return new Response(JSON.stringify({ valid: false, message: "Cupom não aplicável a este plano" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        stripe_promotion_code_id: coupon.stripe_promotion_code_id,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("validate-coupon error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
