import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user?.email) {
      console.error("Auth error:", authError);
      throw new Error("Usuário não autenticado no Supabase");
    }

    const body = await req.json().catch(() => ({}));
    const { priceId, promotionCodeId } = body;
    
    if (!priceId) {
      console.error("Missing priceId in body:", body);
      throw new Error("ID do preço é obrigatório (priceId)");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY is not set in environment");
      throw new Error("Configuração do servidor incompleta (STRIPE_SECRET_KEY ausente)");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
    
    console.log(`Checking for existing Stripe customer for email: ${user.email}`);
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`Found existing customer: ${customerId}`);
    }

    const origin = req.headers.get("origin") || "https://voocerto.app";
    console.log(`Creating session for price ${priceId} with origin ${origin}`);

    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: { trial_period_days: 7 },
      success_url: `${origin}/?subscription=success`,
      cancel_url: `${origin}/premium?canceled=true`,
    };

    if (promotionCodeId) {
      sessionParams.discounts = [{ promotion_code: promotionCodeId }];
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log("Checkout session created successfully:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Critical Checkout error:", error);
    
    // Distinguish between Stripe errors and others
    const errorMessage = error?.message || "Erro desconhecido no servidor";
    const stripeError = error?.raw?.message || error?.type || null;

    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: stripeError,
      hint: "Verifique se a STRIPE_SECRET_KEY e os IDs dos produtos estão corretos."
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

