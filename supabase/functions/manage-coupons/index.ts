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
    // Autenticação do Administrador
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const { data: isAdminData } = await supabaseClient.rpc("is_admin", { _user_id: user.id });
    if (!isAdminData) throw new Error("Admin access required");

    const body = await req.json();
    const { action } = body;

    // Ação 1: Criar Cupom de Desconto no Banco de Dados do Voe Certo
    if (action === "create") {
      const { code, type, value, plan_id, starts_at, ends_at, max_uses, max_uses_per_user, min_amount, duration, duration_in_months } = body;

      if (!code || !value) {
        throw new Error("Código do cupom e valor são obrigatórios.");
      }

      // Salva o cupom no Supabase
      const { data: couponData, error: couponError } = await supabaseClient
        .from("coupons")
        .insert({
          code: code.toUpperCase().trim(),
          type,
          value,
          plan_id: plan_id || null,
          starts_at: starts_at || new Date().toISOString(),
          ends_at: ends_at || null,
          max_uses: max_uses || null,
          max_uses_per_user: max_uses_per_user || 1,
          min_amount: min_amount || null,
          created_by: user.id,
          is_active: true,
          duration: duration || 'once',
          duration_in_months: duration === 'repeating' ? duration_in_months : null,
        })
        .select()
        .single();

      if (couponError) throw new Error(`DB error: ${couponError.message}`);

      return new Response(JSON.stringify({ success: true, coupon: couponData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ação 2: Listar Cupons
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

    // Ação 3: Ativar / Desativar Cupom
    if (action === "toggle") {
      const { coupon_id, is_active } = body;

      const { error } = await supabaseClient
        .from("coupons")
        .update({ is_active })
        .eq("id", coupon_id);

      if (error) throw new Error(`DB error: ${error.message}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ação 4: Excluir Cupom
    if (action === "delete") {
      const { coupon_id } = body;

      const { error } = await supabaseClient
        .from("coupons")
        .delete()
        .eq("id", coupon_id);

      if (error) throw new Error(`DB error: ${error.message}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Ação inválida");
  } catch (error: any) {
    console.error("manage-coupons error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
