// emailTemplates.ts

// Configuração de Cores Baseada no Padrão da Plataforma (index.css)
const COLORS = {
  primary: '#1D3A63',       // Deep aviation blue
  primaryHover: '#294f84',
  accent: '#F9A91F',        // Amber accent
  background: '#eef3f8',
  cardBg: '#ffffff',
  textMain: '#1c2430',
  textMuted: '#4b5563',
};

// --- Componentes Reutilizáveis (Template Literals) ---

const EmailHeader = () => `
  <tr>
    <td
      style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%);
      padding:40px 40px 60px 40px;
      text-align:center;">
      
      <!-- Logo da Voe Certo -->
      <img
        src="https://voecerto.com.br/logo.png" 
        alt="Voe Certo"
        width="180"
        style="max-width:180px; display:block; margin:0 auto 30px auto;"
      />

      <!-- Badge -->
      <div style="
        display:inline-block;
        background: rgba(255,255,255,0.12);
        border:1px solid rgba(255,255,255,0.18);
        padding:10px 18px;
        border-radius:999px;
        color:#ffffff;
        font-size:14px;
        font-weight:500;
      ">
        ✈️ Sua jornada começa agora
      </div>

      <!-- Title -->
      <h1 style="
        color:#ffffff;
        margin:28px 0 14px 0;
        font-size:36px;
        line-height:1.2;
        font-weight:700;
      ">
        Bem-vindo(a) à Voe Certo
      </h1>

      <p style="
        color:#d9e5f5;
        margin:0;
        font-size:18px;
        line-height:1.7;
        max-width:480px;
        margin-left:auto;
        margin-right:auto;
      ">
        Mais do que simulados.
        Uma jornada de aprendizado para sua carreira na aviação.
      </p>
    </td>
  </tr>
`;

const HighlightCard = (text: string, highlightText: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="
      margin:35px 0;
      background:#f8fbff;
      border-left:5px solid ${COLORS.accent};
      border-radius:18px;
    ">
    <tr>
      <td style="padding:28px;">
        <p style="
          margin:0;
          color:${COLORS.primary};
          font-size:20px;
          line-height:1.7;
          font-weight:600;
        ">
          ${text}
          <br/>
          <span style="color:${COLORS.accent};">
            ${highlightText}
          </span>
        </p>
      </td>
    </tr>
  </table>
`;

const ButtonCTA = (url: string, text: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:42px;">
    <tr>
      <td align="center">
        <a
          href="${url}"
          target="_blank"
          style="
            background:${COLORS.accent};
            color:${COLORS.primary};
            text-decoration:none;
            font-size:18px;
            font-weight:700;
            padding:18px 34px;
            border-radius:14px;
            display:inline-block;
            box-shadow: 0 4px 14px rgba(249, 169, 31, 0.4);
          "
        >
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

const EmailFooter = () => `
  <tr>
    <td style="
      background:#f8fafc;
      padding:35px 30px;
      text-align:center;
      border-top:1px solid #e7edf4;
    ">
      <p style="
        margin:0;
        font-size:15px;
        color:#64748b;
        line-height:1.8;
      ">
        <strong style="color:${COLORS.primary};">Equipe Voe Certo</strong>
      </p>
      <p style="
        margin:12px 0 0 0;
        font-size:14px;
        color:#94a3b8;
      ">
        Seu sonho merece uma chance.
      </p>
    </td>
  </tr>
`;

// --- Template Principal ---

export const getWelcomeEmailHtml = (userName: string = "Aeronauta") => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Bem-vindo à Voe Certo</title>
    </head>
    <body style="margin:0; padding:0; background-color:${COLORS.background}; font-family: 'Plus Jakarta Sans', Arial, Helvetica, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${COLORS.background}">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <!-- Container Principal -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
              style="max-width:640px; background:${COLORS.cardBg}; border-radius:24px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.08);">
              
              ${EmailHeader()}

              <!-- Conteúdo -->
              <tr>
                <td style="padding:50px 42px;">
                  <p style="font-size:18px; color:${COLORS.textMain}; line-height:1.8; margin-top:0;">
                    Olá, ${userName}!
                  </p>
                  
                  <p style="font-size:17px; color:${COLORS.textMuted}; line-height:1.9;">
                    Antes de qualquer coisa:
                    <strong style="color:${COLORS.primary};">parabéns pela sua iniciativa.</strong>
                  </p>
                  
                  <p style="font-size:17px; color:${COLORS.textMuted}; line-height:1.9;">
                    Independentemente da etapa em que você esteja na aviação —
                    começando do zero, estudando para a ANAC ou buscando sua
                    primeira oportunidade — o mais importante é que você começou.
                  </p>
                  
                  <p style="font-size:17px; color:${COLORS.textMuted}; line-height:1.9;">
                    Sabemos que a caminhada nem sempre é fácil. Em alguns momentos
                    podem surgir dúvidas, insegurança ou até aquela sensação de que
                    o objetivo ainda está distante.
                  </p>

                  ${HighlightCard(
                    "Toda grande jornada começa exatamente assim:",
                    "dando o primeiro passo."
                  )}

                  <p style="font-size:17px; color:${COLORS.textMuted}; line-height:1.9;">
                    A <strong>Voe Certo</strong> não foi criada apenas para ser mais
                    uma plataforma de simulados. Nosso objetivo é ajudar você a aprender, 
                    evoluir e se sentir mais preparado(a) em cada etapa da sua trajetória na aviação.
                  </p>

                  ${ButtonCTA("https://voecerto.com.br/guias", "Começar minha jornada ✈️")}

                </td>
              </tr>

              ${EmailFooter()}

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
