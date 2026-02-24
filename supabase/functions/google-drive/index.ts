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

const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/google-drive?action=callback`;
const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
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
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  return await res.json();
}

async function getValidAccessToken(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data: tokenData, error } = await supabase
    .from("admin_drive_tokens")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !tokenData) {
    throw new Error("Google Drive não conectado. Conecte sua conta primeiro.");
  }

  const expiresAt = new Date(tokenData.token_expires_at);
  if (expiresAt > new Date(Date.now() + 60000)) {
    return { accessToken: tokenData.access_token, folderId: tokenData.folder_id };
  }

  const refreshed = await refreshAccessToken(tokenData.refresh_token);
  const newExpires = new Date(Date.now() + refreshed.expires_in * 1000);

  await supabase
    .from("admin_drive_tokens")
    .update({
      access_token: refreshed.access_token,
      token_expires_at: newExpires.toISOString(),
    })
    .eq("user_id", userId);

  return { accessToken: refreshed.access_token, folderId: tokenData.folder_id };
}

// Create or find the "Insignias VooCerto" folder in Drive
async function getOrCreateFolder(accessToken: string): Promise<string> {
  const folderName = "Insignias VooCerto";

  // Search for existing folder
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  const folder = await createRes.json();
  return folder.id;
}

// Make a file publicly viewable
async function makeFilePublic(accessToken: string, fileId: string) {
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // ─── AUTH URL ───
    if (action === "auth_url") {
      const user = await getUserFromRequest(req);
      if (!user) {
        return new Response(JSON.stringify({ error: "Não autenticado" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!(await isUserAdmin(user.id))) {
        return new Response(JSON.stringify({ error: "Acesso negado" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    // ─── CALLBACK ───
    if (action === "callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) {
        return new Response(
          `<html><body><h2>Erro: ${error}</h2><script>window.close();</script></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }
      if (!code || !state) {
        return new Response(
          `<html><body><h2>Parâmetros inválidos</h2><script>window.close();</script></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

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
          { headers: { "Content-Type": "text/html" } }
        );
      }

      const tokens = await tokenRes.json();
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      // Create/find the badge folder
      const folderId = await getOrCreateFolder(tokens.access_token);

      const supabase = getSupabaseAdmin();
      await supabase
        .from("admin_drive_tokens")
        .upsert({
          user_id: state,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expires_at: expiresAt.toISOString(),
          folder_id: folderId,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      return new Response(
        `<html><body><h2>✅ Google Drive conectado!</h2><p>Pasta "Insignias VooCerto" pronta.</p><script>setTimeout(()=>window.close(),2000);</script></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // ─── CHECK STATUS ───
    if (action === "status") {
      const user = await getUserFromRequest(req);
      if (!user) {
        return new Response(JSON.stringify({ connected: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from("admin_drive_tokens")
        .select("folder_id")
        .eq("user_id", user.id)
        .maybeSingle();

      return new Response(JSON.stringify({ connected: !!data, folderId: data?.folder_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── UPLOAD FILE ───
    if (action === "upload") {
      const user = await getUserFromRequest(req);
      if (!user) {
        return new Response(JSON.stringify({ error: "Não autenticado" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!(await isUserAdmin(user.id))) {
        return new Response(JSON.stringify({ error: "Acesso negado" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const formData = await req.formData();
      const file = formData.get("file") as File;
      const fileName = formData.get("fileName") as string || file.name;

      if (!file) {
        return new Response(JSON.stringify({ error: "Nenhum arquivo enviado" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { accessToken, folderId } = await getValidAccessToken(user.id);
      const targetFolder = folderId || await getOrCreateFolder(accessToken);

      // Upload using multipart
      const metadata = JSON.stringify({
        name: fileName,
        parents: [targetFolder],
      });

      const fileBytes = new Uint8Array(await file.arrayBuffer());
      const boundary = "-----boundary" + Date.now();

      const body = new Uint8Array(await new Blob([
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
        `--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`,
        fileBytes,
        `\r\n--${boundary}--`,
      ]).arrayBuffer());

      const uploadRes = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webContentLink,webViewLink",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Upload falhou: ${errText}`);
      }

      const uploadData = await uploadRes.json();

      // Make public so we can display directly
      await makeFilePublic(accessToken, uploadData.id);

      const directUrl = `https://drive.google.com/uc?export=view&id=${uploadData.id}`;

      return new Response(JSON.stringify({
        fileId: uploadData.id,
        directUrl,
        webViewLink: uploadData.webViewLink,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── LIST FILES ───
    if (action === "list") {
      const user = await getUserFromRequest(req);
      if (!user) {
        return new Response(JSON.stringify({ error: "Não autenticado" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { accessToken, folderId } = await getValidAccessToken(user.id);
      if (!folderId) {
        return new Response(JSON.stringify({ files: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const listRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&fields=files(id,name,thumbnailLink,webContentLink)&orderBy=name`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const listData = await listRes.json();

      return new Response(JSON.stringify({ files: listData.files || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
