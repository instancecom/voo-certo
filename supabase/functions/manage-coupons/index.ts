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

    // Ação 0: Buscar preços ao vivo dos planos no checkout da Cakto
    if (action === "get_plans") {
      const planLinks = [
        { id: "solo", name: "Solo", url: "https://pay.cakto.com.br/659x89z_1012189", defaultPrice: "R$ 19,90/mês" },
        { id: "tripulante", name: "Tripulante", url: "https://pay.cakto.com.br/o2twp3f_1012195", defaultPrice: "R$ 39,90/mês" },
        { id: "comandante", name: "Comandante", url: "https://pay.cakto.com.br/4wat335_1012197", defaultPrice: "R$ 79,90/mês" }
      ];

      const livePlans = await Promise.all(planLinks.map(async (plan) => {
        try {
          const res = await fetch(plan.url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
          });
          if (res.ok) {
            const html = await res.text();
            // Procurar padrões de preço no HTML do checkout da Cakto (ex: "R$ 19,90" ou "19.90")
            const priceMatch = html.match(/R\$\s?[\d.,]+/i) || html.match(/"price"\s*:\s*"?([\d.,]+)"?/i);
            if (priceMatch) {
              const matchedPrice = priceMatch[0].includes('R$') ? priceMatch[0] : `R$ ${priceMatch[1]}`;
              return { ...plan, price: `${matchedPrice}/mês`, checkoutUrl: plan.url };
            }
          }
        } catch (e) {
          console.warn(`Erro ao buscar preço Cakto para ${plan.name}:`, e);
        }
        return { ...plan, price: plan.defaultPrice, checkoutUrl: plan.url };
      }));

      return new Response(JSON.stringify({ plans: livePlans }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
