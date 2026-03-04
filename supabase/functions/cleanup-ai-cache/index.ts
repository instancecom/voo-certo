import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Config missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Delete expired cache entries
    const { error, count } = await supabase
      .from("ai_question_cache")
      .delete()
      .lt("expires_at", new Date().toISOString());

    if (error) throw error;

    // Reset daily AI question counters
    const { error: resetError } = await supabase
      .from("profiles")
      .update({ ai_questions_count: 0 })
      .gt("ai_questions_count", 0);

    if (resetError) console.error("Reset counter error:", resetError);

    return new Response(JSON.stringify({ success: true, deleted: count }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
