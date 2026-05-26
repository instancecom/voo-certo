// emailTemplates.ts

const COLORS = {
  primary: '#1D3A63',       // Deep aviation blue
  primaryHover: '#294f84',
  accent: '#F9A91F',        // Amber accent
  background: '#eef3f8',
  cardBg: '#ffffff',
  textMain: '#1c2430',
  textMuted: '#4b5563',
};

const EmailHeader = (title: string, subtitle: string) => `
  <tr>
    <td
      style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%);
      padding:40px 40px 50px 40px;
      text-align:center;">
      
      <!-- Logo da Voo Certo -->
      <img
        src="https://voocerto.com.br/logo.png" 
        alt="Voo Certo"
        width="180"
        style="max-width:180px; display:block; margin:0 auto 25px auto;"
      />

      <!-- Badge -->
      <div style="
        display:inline-block;
        background: rgba(255,255,255,0.12);
        border:1px solid rgba(255,255,255,0.18);
        padding:8px 18px;
        border-radius:999px;
        color:#ffffff;
        font-size:13px;
        font-weight:600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      ">
        🧪 Convite Exclusivo: Tester Estratégico
      </div>

      <!-- Title -->
      <h1 style="
        color:#ffffff;
        margin:24px 0 12px 0;
        font-size:32px;
        line-height:1.2;
        font-weight:800;
        letter-spacing:-0.02em;
      ">
        ${title}
      </h1>

      <p style="
        color:#d9e5f5;
        margin:0;
        font-size:16px;
        line-height:1.6;
        max-width:480px;
        margin-left:auto;
        margin-right:auto;
      ">
        ${subtitle}
      </p>
    </td>
  </tr>
`;

const HighlightCard = (text: string, highlightText: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
    style="
      margin:30px 0;
      background:#f8fbff;
      border-left:5px solid ${COLORS.accent};
      border-radius:12px;
    ">
    <tr>
      <td style="padding:20px 24px;">
        <p style="
          margin:0;
          color:${COLORS.primary};
          font-size:17px;
          line-height:1.6;
          font-weight:600;
        ">
          ${text}
          <span style="color:${COLORS.accent};">
            ${highlightText}
          </span>
        </p>
      </td>
    </tr>
  </table>
`;

const ButtonCTA = (url: string, text: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:35px; margin-bottom:20px;">
    <tr>
      <td align="center">
        <a
          href="${url}"
          target="_blank"
          style="
            background:${COLORS.accent};
            color:${COLORS.primary};
            text-decoration:none;
            font-size:17px;
            font-weight:800;
            padding:16px 36px;
            border-radius:8px;
            display:inline-block;
            box-shadow: 0 4px 12px rgba(249, 169, 31, 0.35);
            text-transform: uppercase;
            letter-spacing: 0.05em;
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
      padding:30px;
      text-align:center;
      border-top:1px solid #e7edf4;
    ">
      <p style="
        margin:0;
        font-size:14px;
        color:#64748b;
        line-height:1.8;
      ">
        <strong style="color:${COLORS.primary};">Equipe Voo Certo</strong>
      </p>
      <p style="
        margin:8px 0 0 0;
        font-size:13px;
        color:#94a3b8;
      ">
        Construindo a melhor plataforma de aviação do Brasil.
      </p>
    </td>
  </tr>
`;

export const getTesterInviteHtml = (name: string, durationLabel: string, signUpUrl: string) => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Convite de Tester Estratégico - Voo Certo</title>
    </head>
    <body style="margin:0; padding:0; background-color:${COLORS.background}; font-family: Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${COLORS.background}">
        <tr>
          <td align="center" style="padding:30px 15px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
              style="max-width:600px; background:${COLORS.cardBg}; border-radius:16px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.06);">
              
              ${EmailHeader("Você é nosso convidado de elite!", "Ajude-nos a validar a plataforma com sua experiência real na aviação.")}

              <!-- Conteúdo -->
              <tr>
                <td style="padding:40px 35px;">
                  <p style="font-size:17px; color:${COLORS.textMain}; line-height:1.7; margin-top:0; font-weight: bold;">
                    Olá, ${name}!
                  </p>
                  
                  <p style="font-size:16px; color:${COLORS.textMuted}; line-height:1.7;">
                    Você foi selecionado(a) como um **Tester Estratégico** exclusivo da plataforma **Voo Certo** antes do nosso lançamento oficial.
                  </p>
                  
                  <p style="font-size:16px; color:${COLORS.textMuted}; line-height:1.7;">
                    Acreditamos que profissionais e entusiastas influentes na aviação são a chave para moldar uma ferramenta perfeita de estudos. Por isso, preparamos uma liberação especial para você:
                  </p>

                  ${HighlightCard(
                    `Seu perfil receberá acesso **Premium 100% Gratuito** por `,
                    `**${durationLabel}**.`
                  )}

                  <p style="font-size:16px; color:${COLORS.textMuted}; line-height:1.7; margin-bottom: 25px;">
                    **Como funciona?**
                    <ol style="padding-left: 20px; color:${COLORS.textMuted}; font-size:15px; line-height:1.8;">
                      <li style="margin-bottom: 8px;">Clique no botão abaixo para ir para a tela de registro.</li>
                      <li style="margin-bottom: 8px;">Crie sua conta normalmente usando **este endereço de e-mail** e defina sua senha.</li>
                      <li style="margin-bottom: 8px;">Ao fazer o login, o plano **Premium será ativado automaticamente**, sem qualquer cobrança.</li>
                      <li style="margin-bottom: 8px;">Durante seu uso, você verá um card discreto para nos enviar feedbacks rápidos sobre bugs, sugestões ou dúvidas.</li>
                    </ol>
                  </p>

                  ${ButtonCTA(signUpUrl, "Cadastrar-se & Iniciar Teste ✈️")}

                  <p style="font-size:13px; color:#94a3b8; line-height:1.6; text-align: center; margin-top: 25px;">
                    *Obs: Certifique-se de registrar-se usando o mesmo e-mail para o qual este convite foi enviado. Caso já possua conta, basta logar nela que o Premium já estará ativo.*
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
