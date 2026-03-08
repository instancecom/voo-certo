import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Config missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find verifications older than 7 days that still have proof files
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: expiredVerifications, error: fetchError } = await supabase
      .from("badge_verifications")
      .select("id, user_id, proof_url, anac_code, status, reviewed_at, admin_notes")
      .eq("proof_type", "file")
      .not("proof_url", "is", null)
      .lt("submitted_at", sevenDaysAgo);

    if (fetchError) throw fetchError;

    if (!expiredVerifications || expiredVerifications.length === 0) {
      return new Response(JSON.stringify({ success: true, deleted: 0, message: "No expired proofs found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let deletedCount = 0;
    const errors: string[] = [];

    for (const verification of expiredVerifications) {
      try {
        // Delete file from storage
        const { error: storageError } = await supabase.storage
          .from("badge-proofs")
          .remove([verification.proof_url]);

        if (storageError) {
          console.error(`Failed to delete file ${verification.proof_url}:`, storageError);
          errors.push(`File ${verification.proof_url}: ${storageError.message}`);
          continue; // Skip to next, will retry on next cron run
        }

        // Log the cleanup
        await supabase.from("badge_proof_cleanup_log").insert({
          verification_id: verification.id,
          file_path: verification.proof_url,
          file_deleted_at: new Date().toISOString(),
          doc_accepted: verification.status === "approved",
          acceptance_date: verification.reviewed_at,
          user_name: verification.user_id.slice(0, 8),
          codigo_id: verification.anac_code,
          historico_resumido: verification.admin_notes || `Status: ${verification.status}`,
        });

        // Clear the proof_url from the verification record (keep all other data)
        await supabase
          .from("badge_verifications")
          .update({ proof_url: null })
          .eq("id", verification.id);

        deletedCount++;
      } catch (err) {
        console.error(`Error processing verification ${verification.id}:`, err);
        errors.push(`Verification ${verification.id}: ${String(err)}`);
      }
    }

    console.log(`Badge proof cleanup: ${deletedCount} files deleted, ${errors.length} errors`);

    return new Response(JSON.stringify({
      success: true,
      deleted: deletedCount,
      total_found: expiredVerifications.length,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Badge proof cleanup error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
