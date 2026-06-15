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
        🧪 Convite Exclusivo: Tester Estratégico
      </div>

      <!-- Title -->
      <h1 style="
        color:#ffffff;
        margin:28px 0 14px 0;
        font-size:36px;
        line-height:1.2;
        font-weight:700;
      ">
        Você é nosso convidado de elite!
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
        Ajude-nos a validar a plataforma com
        sua experiência real na aviação.
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

const StepItem = (number: string, text: string) => `
  <tr>
    <td style="padding: 8px 0; vertical-align: top;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="width:36px; vertical-align:top; padding-top:2px;">
            <div style="
              width:28px;
              height:28px;
              background:${COLORS.accent};
              border-radius:50%;
              text-align:center;
              line-height:28px;
              font-size:13px;
              font-weight:700;
              color:${COLORS.primary};
            ">${number}</div>
          </td>
          <td style="vertical-align:top; padding-left:12px;">
            <p style="margin:0; font-size:16px; color:${COLORS.textMuted}; line-height:1.7;">${text}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
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
        Construindo a melhor plataforma de aviação do Brasil.
      </p>
    </td>
  </tr>
`;

// --- Template Principal ---

export const getTesterInviteHtml = (name: string, durationLabel: string, signUpUrl: string) => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Convite de Tester Estratégico - Voe Certo</title>
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
                    Olá, ${name}!
                  </p>
                  
                  <p style="font-size:17px; color:${COLORS.textMuted}; line-height:1.9;">
                    Você foi selecionado(a) como um
                    <strong style="color:${COLORS.primary};">Tester Estratégico exclusivo</strong>
                    da plataforma <strong style="color:${COLORS.primary};">Voe Certo</strong>
                    antes do nosso lançamento oficial.
                  </p>
                  
                  <p style="font-size:17px; color:${COLORS.textMuted}; line-height:1.9;">
                    Acreditamos que profissionais e entusiastas influentes na aviação são a chave
                    para moldar uma ferramenta perfeita de estudos. Por isso, preparamos uma
                    liberação especial para você:
                  </p>

                  ${HighlightCard(
                    "Seu perfil receberá acesso Premium 100% Gratuito por",
                    `${durationLabel}.`
                  )}

                  <p style="font-size:17px; color:${COLORS.textMain}; line-height:1.7; font-weight:600; margin-bottom:16px;">
                    Como funciona?
                  </p>

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:10px;">
                    ${StepItem("1", "Clique no botão abaixo para ir para a tela de registro.")}
                    ${StepItem("2", `Crie sua conta normalmente usando <strong>este endereço de e-mail</strong> e defina sua senha.`)}
                    ${StepItem("3", "Ao fazer o login, o plano <strong>Premium será ativado automaticamente</strong>, sem qualquer cobrança.")}
                    ${StepItem("4", "Durante seu uso, você verá um card discreto para nos enviar feedbacks rápidos sobre bugs, sugestões ou dúvidas.")}
                  </table>

                  ${ButtonCTA(signUpUrl, "Cadastrar-se & Iniciar Teste ✈️")}

                  <p style="font-size:14px; color:#94a3b8; line-height:1.7; text-align:center; margin-top:28px;">
                    Certifique-se de registrar-se usando o mesmo e-mail para o qual este convite
                    foi enviado. Caso já possua conta, basta logar nela que o Premium já estará ativo.
                  </p>
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
