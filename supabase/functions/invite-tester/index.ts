import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { getTesterInviteHtml } from "./emailTemplates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured in Supabase secrets");
    }

    // Verify authentication and admin role
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

    // ACTION: INVITE
    if (action === "invite") {
      const { email, name, tags, notes, duration_days } = body;
      const formattedEmail = email.trim().toLowerCase();

      // Calculate expiration interval
      let expiresAt: string | null = null;
      let durationLabel = "30 dias (Acesso padrão)";
      
      if (duration_days) {
        const days = parseInt(duration_days);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        expiresAt = expiryDate.toISOString();
        durationLabel = `${days} dias`;
      } else if (duration_days === null || duration_days === "unlimited") {
        durationLabel = "Tempo Ilimitado";
      }

      // Check if tester profile already exists in public.profiles
      const { data: profile, error: profileFetchError } = await supabaseClient
        .from("profiles")
        .select("id, user_id")
        .eq("email", formattedEmail)
        .maybeSingle();

      let isRegistered = false;
      if (profile) {
        isRegistered = true;
        // Upgrade existing user directly to premium and tester status
        const { error: profileUpdateError } = await supabaseClient
          .from("profiles")
          .update({
            is_premium: true,
            premium_expires_at: expiresAt,
            plan_type: "tripulante",
            is_tester: true
          })
          .eq("email", formattedEmail);

        if (profileUpdateError) throw new Error(`Error upgrading existing profile: ${profileUpdateError.message}`);
      }

      // Insert or update in strategic_testers
      const { data: testerData, error: testerError } = await supabaseClient
        .from("strategic_testers")
        .upsert(
          {
            email: formattedEmail,
            name,
            tags: tags || [],
            notes,
            duration_days: duration_days === "unlimited" ? null : (duration_days ? parseInt(duration_days) : 30),
            status: isRegistered ? "registered" : "invited",
            invited_at: new Date().toISOString(),
            registered_at: isRegistered ? new Date().toISOString() : null,
            expires_at: expiresAt
          },
          { onConflict: "email" }
        )
        .select()
        .single();

      if (testerError) throw new Error(`DB error inserting tester: ${testerError.message}`);

      // Send Email invitation via Resend API
      const signUpUrl = `${new URL(req.url).origin}/auth?mode=signup&email=${encodeURIComponent(formattedEmail)}`;
      const htmlContent = getTesterInviteHtml(name, durationLabel, signUpUrl);

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: "Voo Certo <onboarding@resend.dev>",
          to: [formattedEmail],
          subject: "🧪 Convite Especial: Seja Tester da Voo Certo e ganhe Premium! ✈️",
          html: htmlContent
        })
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("Resend API error:", errorText);
        // We still return success for the database registration even if the email fails,
        // but we flag it so the admin knows.
        return new Response(JSON.stringify({ 
          success: true, 
          tester: testerData,
          warning: "Tester cadastrado, mas houve um erro no envio de e-mail." 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ success: true, tester: testerData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ACTION: LIST ALL TESTERS
    if (action === "list") {
      const { data, error } = await supabaseClient
        .from("strategic_testers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(`DB error: ${error.message}`);

      return new Response(JSON.stringify({ testers: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ACTION: DELETE/REVOKE TESTER
    if (action === "delete") {
      const { tester_id } = body;

      // Get email first to know who to revoke in profiles
      const { data: tester } = await supabaseClient
        .from("strategic_testers")
        .select("email")
        .eq("id", tester_id)
        .single();

      if (tester?.email) {
        // Demote in profiles (revoke premium and tester privileges)
        await supabaseClient
          .from("profiles")
          .update({
            is_premium: false,
            premium_expires_at: null,
            is_tester: false
          })
          .eq("email", tester.email);
      }

      const { error } = await supabaseClient
        .from("strategic_testers")
        .delete()
        .eq("id", tester_id);

      if (error) throw new Error(`DB error deleting tester: ${error.message}`);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ACTION: RENEW/EXTEND ACCESS
    if (action === "renew") {
      const { tester_id, duration_days } = body;
      const days = parseInt(duration_days);

      // Get tester info
      const { data: tester } = await supabaseClient
        .from("strategic_testers")
        .select("email, status")
        .eq("id", tester_id)
        .single();

      if (!tester) throw new Error("Tester not found");

      let expiresAt: string | null = null;
      if (duration_days !== "unlimited" && days) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        expiresAt = expiryDate.toISOString();
      }

      // Update tester record
      const { error: testerUpdateError } = await supabaseClient
        .from("strategic_testers")
        .update({
          duration_days: duration_days === "unlimited" ? null : days,
          expires_at: expiresAt,
          status: tester.status === "expired" ? "registered" : tester.status,
          updated_at: new Date().toISOString()
        })
        .eq("id", tester_id);

      if (testerUpdateError) throw new Error(`DB error renewing tester: ${testerUpdateError.message}`);

      // Update profile if registered
      if (tester.email) {
        await supabaseClient
          .from("profiles")
          .update({
            is_premium: true,
            premium_expires_at: expiresAt,
            is_tester: true
          })
          .eq("email", tester.email);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ACTION: LIST FEEDBACKS
    if (action === "feedback_list") {
      // Get all feedback, sorted by created_at desc
      const { data, error } = await supabaseClient
        .from("strategic_tester_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(`DB error fetching feedback: ${error.message}`);

      return new Response(JSON.stringify({ feedbacks: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    throw new Error("Invalid action provided");
  } catch (error) {
    console.error("invite-tester error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
