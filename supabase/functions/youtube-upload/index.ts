// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/youtube-upload?action=callback`;
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
].join(" ");

function getSupabaseAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const supabase = getSupabaseAdmin();
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

// Exchange refresh token for a new access token
async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${err}`);
  }
  return await res.json();
}

// Get valid access token (refresh if expired)
async function getValidAccessToken(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data: tokenData, error } = await supabase
    .from("admin_youtube_tokens")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !tokenData) {
    throw new Error("YouTube não conectado. Conecte sua conta primeiro.");
  }

  const expiresAt = new Date(tokenData.token_expires_at);
  if (expiresAt > new Date(Date.now() + 60000)) {
    return tokenData.access_token;
  }

  // Refresh
  const refreshed = await refreshAccessToken(tokenData.refresh_token);
  const newExpires = new Date(Date.now() + refreshed.expires_in * 1000);

  await supabase
    .from("admin_youtube_tokens")
    .update({
      access_token: refreshed.access_token,
      token_expires_at: newExpires.toISOString(),
    })
    .eq("user_id", userId);

  return refreshed.access_token;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // ACTION: Generate OAuth URL for admin
    if (action === "auth_url") {
      const user = await getUserFromRequest(req);
      if (!user) {
        return new Response(JSON.stringify({ error: "Não autenticado" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!(await isUserAdmin(user.id))) {
        return new Response(JSON.stringify({ error: "Acesso negado" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", SCOPES);
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
      authUrl.searchParams.set("state", user.id);

      return new Response(JSON.stringify({ url: authUrl.toString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: OAuth callback from Google
    if (action === "callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state"); // user_id
      const error = url.searchParams.get("error");

      if (error) {
        return new Response(
          `<html><body><h2>Erro: ${error}</h2><script>window.close();</script></body></html>`,
          { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } },
        );
      }

      if (!code || !state) {
        return new Response(
          `<html><body><h2>Parâmetros inválidos</h2><script>window.close();</script></body></html>`,
          { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } },
        );
      }

      // Exchange code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: REDIRECT_URI,
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        return new Response(
          `<html><body><h2>Erro ao trocar token</h2><p>${errText}</p><script>setTimeout(()=>window.close(),3000);</script></body></html>`,
          { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } },
        );
      }

      const tokens = await tokenRes.json();
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      // Get channel info
      let channelId = null;
      let channelTitle = null;
      try {
        const channelRes = await fetch(
          "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
          { headers: { Authorization: `Bearer ${tokens.access_token}` } },
        );
        const channelData = await channelRes.json();
        if (channelData.items?.length > 0) {
          channelId = channelData.items[0].id;
          channelTitle = channelData.items[0].snippet.title;
        }
      } catch (_) { /* ignore */ }

      // Store tokens
      const supabase = getSupabaseAdmin();
      await supabase.from("admin_youtube_tokens").upsert({
        user_id: state,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        channel_id: channelId,
        channel_title: channelTitle,
      }, { onConflict: "user_id" });

      return new Response(
`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conexão bem sucedida</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        background-color: #0f172a;
        color: #f8fafc;
      }
      .container {
        text-align: center;
        padding: 2rem;
        background: rgba(30, 41, 59, 0.5);
        border-radius: 1rem;
        border: 1px solid rgba(212, 168, 67, 0.2);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(8px);
        max-width: 400px;
        width: 90%;
      }
      h2 { color: #facc15; margin-bottom: 0.5rem; }
      p { color: #94a3b8; font-size: 0.9375rem; }
      .status { color: #4ade80; font-weight: 500; margin: 1rem 0; }
      .loader {
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-top: 2px solid #facc15;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
        display: inline-block;
        margin-top: 1rem;
      }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>✅ YouTube Conectado!</h2>
      <p>Sua conta foi vinculada com sucesso ao Voe Certo.</p>
      <div class="status">Canal: ${channelTitle || "Conectado"}</div>
      <p>Esta janela fechará automaticamente...</p>
      <div class="loader"></div>
    </div>
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'youtube_connected', channel: '${channelTitle || ""}' }, '*');
      }
      setTimeout(() => {
        window.close();
      }, 2500);
    </script>
  </body>
</html>`,
        { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } },
      );
    }

    // ACTION: Check connection status
    if (action === "status") {
      const user = await getUserFromRequest(req);
      if (!user) {
        return new Response(JSON.stringify({ connected: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = getSupabaseAdmin();
      const { data: tokenData } = await supabase
        .from("admin_youtube_tokens")
        .select("channel_id, channel_title, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!tokenData) {
        return new Response(JSON.stringify({ connected: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Buscar e-mail do usuário no Google
      let email = null;
      try {
        const accessToken = await getValidAccessToken(user.id);
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          email = userData.email;
        }
      } catch (err) {
        console.error("Erro ao buscar email do YouTube:", err);
      }

      return new Response(
        JSON.stringify({
          connected: true,
          channel_id: tokenData.channel_id,
          channel_title: tokenData.channel_title,
          email: email,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ACTION: Disconnect YouTube
    if (action === "disconnect") {
      const user = await getUserFromRequest(req);
      if (!user || !(await isUserAdmin(user.id))) {
        return new Response(JSON.stringify({ error: "Acesso negado" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = getSupabaseAdmin();
      await supabase.from("admin_youtube_tokens").delete().eq("user_id", user.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: Upload video to YouTube (POST)
    if (req.method === "POST" && (!action || action === "upload")) {
      const user = await getUserFromRequest(req);
      if (!user) {
        return new Response(JSON.stringify({ error: "Não autenticado" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!(await isUserAdmin(user.id))) {
        return new Response(JSON.stringify({ error: "Acesso negado" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const accessToken = await getValidAccessToken(user.id);

      const formData = await req.formData();
      const videoFile = formData.get("video") as File | null;
      const title = formData.get("title") as string || "Microcurso Voe Certo";
      const description = formData.get("description") as string || "";
      const privacy = formData.get("privacy") as string || "unlisted";

      if (!videoFile) {
        return new Response(JSON.stringify({ error: "Nenhum arquivo de vídeo enviado" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check file size (500MB limit)
      if (videoFile.size > 500 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ error: "Arquivo excede o limite de 500MB" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Initiate resumable upload
      const metadata = {
        snippet: { title, description, categoryId: "27" /* Education */ },
        status: { privacyStatus: privacy },
      };

      const initRes = await fetch(
        "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
            "X-Upload-Content-Length": videoFile.size.toString(),
            "X-Upload-Content-Type": videoFile.type || "video/mp4",
          },
          body: JSON.stringify(metadata),
        },
      );

      if (!initRes.ok) {
        const errText = await initRes.text();
        return new Response(
          JSON.stringify({ error: `Falha ao iniciar upload: ${errText}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const uploadUrl = initRes.headers.get("location");
      if (!uploadUrl) {
        return new Response(
          JSON.stringify({ error: "URL de upload não recebida" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // Upload the video
      const videoBuffer = await videoFile.arrayBuffer();
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": videoFile.type || "video/mp4",
          "Content-Length": videoFile.size.toString(),
        },
        body: videoBuffer,
      });

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        return new Response(
          JSON.stringify({ error: `Falha no upload: ${errText}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const videoData = await uploadRes.json();

      return new Response(
        JSON.stringify({
          success: true,
          video_id: videoData.id,
          title: videoData.snippet?.title,
          thumbnail_url: videoData.snippet?.thumbnails?.high?.url ||
            `https://img.youtube.com/vi/${videoData.id}/hqdefault.jpg`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "Ação não reconhecida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("YouTube upload error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
