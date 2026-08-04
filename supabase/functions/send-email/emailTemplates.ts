// emailTemplates.ts — Voe Certo Transactional Email Templates System

const COLORS = {
  primary: '#1D3A63',       // Deep aviation blue
  primaryHover: '#294f84',
  accent: '#F9A91F',        // Amber gold accent
  background: '#f1f5f9',
  cardBg: '#ffffff',
  textMain: '#1c2430',
  textMuted: '#4b5563',
  success: '#10b981',
};

const LOGO_URL = "https://voe-certo.vercel.app/logo.png";
const APP_URL = "https://voe-certo.vercel.app";

const BaseLayout = (contentHtml: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voe Certo — Aviação Civil</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    table { border-collapse: collapse; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${COLORS.background}; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: ${COLORS.cardBg}; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%); padding: 36px 30px; text-align: center;">
              <h2 style="color: #ffffff; font-size: 26px; font-weight: 900; margin: 0 0 8px 0; letter-spacing: -0.5px; text-transform: uppercase;">
                ✈️ VOE CERTO
              </h2>
              <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 0; font-weight: 500; letter-spacing: 1px; text-transform: uppercase;">
                Plataforma de Alta Performance em Aviação
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 35px 30px; color: ${COLORS.textMain};">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center; color: ${COLORS.textMuted}; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: ${COLORS.primary};">
                Voe Certo — Preparatório para a Aviação Civil
              </p>
              <p style="margin: 0 0 12px 0;">
                Se você não solicitou este e-mail, pode ignorá-lo com segurança.
              </p>
              <p style="margin: 0; opacity: 0.7;">
                &copy; ${new Date().getFullYear()} Voe Certo. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * EMAIL 1: BOAS-VINDAS (Welcome)
 */
export function getWelcomeEmailHtml(name: string): string {
  const content = `
    <h1 style="font-size: 22px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 16px 0;">
      Olá, ${name}! Seja bem-vindo(a) a bordo! 🚀
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: ${COLORS.textMuted}; margin: 0 0 20px 0;">
      Estamos muito felizes em ter você conosco! Sua conta na <strong>Voe Certo</strong> está pronta para te ajudar a conquistar sua licença e decolar na sua carreira aeronáutica.
    </p>

    <!-- Personas Card -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
      <h3 style="font-size: 14px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
        👥 Seus Especialistas de Apoio 24/7:
      </h3>
      
      <div style="margin-bottom: 12px;">
        <strong style="color: ${COLORS.primary}; font-size: 14px;">👨‍✈️ Prof. Hugo</strong> 
        <span style="font-size: 13px; color: ${COLORS.textMuted};"> — Professor de Aviação Civil (Tira-dúvidas de cada questão dos simulados)</span>
      </div>

      <div style="margin-bottom: 12px;">
        <strong style="color: ${COLORS.primary}; font-size: 14px;">👩‍💼 Sofia</strong> 
        <span style="font-size: 13px; color: ${COLORS.textMuted};"> — Mentora de Desempenho (Análise contínua do seu progresso de estudos)</span>
      </div>

      <div>
        <strong style="color: ${COLORS.primary}; font-size: 14px;">👔 Lucas</strong> 
        <span style="font-size: 13px; color: ${COLORS.textMuted};"> — Analista de Carreiras (Construção e formatação do seu currículo)</span>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/simulados" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(29, 58, 99, 0.2);">
        Começar Meus Simulados Agora ➔
      </a>
    </div>
  `;
  return BaseLayout(content);
}

/**
 * EMAIL 2: CONFIRMAÇÃO DE ASSINATURA / PLANO ATIVADO
 */
export function getPlanActivatedEmailHtml(name: string, planName: string): string {
  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="background-color: #d1fae5; color: ${COLORS.success}; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 20px; text-transform: uppercase;">
        Plano Confirmado
      </span>
    </div>

    <h1 style="font-size: 22px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 16px 0; text-align: center;">
      Decolagem Autorizada, ${name}! 🚀
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: ${COLORS.textMuted}; margin: 0 0 24px 0; text-align: center;">
      Seu pagamento foi confirmado com sucesso e seu acesso ao <strong>Plano ${planName}</strong> já está 100% liberado!
    </p>

    <!-- Details Box -->
    <div style="background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%); border: 1px solid #cbd5e1; border-radius: 10px; padding: 22px; margin-bottom: 25px;">
      <h3 style="font-size: 14px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 10px 0;">
        Recursos Liberados na sua Conta:
      </h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${COLORS.textMuted}; line-height: 1.8;">
        <li>Simulados ilimitados para a ANAC com gabarito comentado</li>
        <li>Consultas diretas com o <strong>Prof. Hugo</strong> nas questões</li>
        <li>Relatórios periódicos de evolução com a <strong>Sofia</strong></li>
        <li>Gerador de Currículos aeronáuticos com o <strong>Lucas</strong></li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/simulados" style="display: inline-block; background-color: ${COLORS.accent}; color: #0f172a; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 8px;">
        Acessar Minha Plataforma ➔
      </a>
    </div>
  `;
  return BaseLayout(content);
}

/**
 * EMAIL 3: RELATÓRIO DE DIAGNÓSTICO DA SOFIA
 */
export function getDiagnosticEmailHtml(name: string, criticalTitle: string, positiveTitle: string): string {
  const content = `
    <h1 style="font-size: 22px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 16px 0;">
      📊 Olá ${name}, seu Diagnóstico de Desempenho está pronto!
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: ${COLORS.textMuted}; margin: 0 0 20px 0;">
      A <strong>Sofia (Mentora de Desempenho)</strong> analisou seu histórico recente de simulados e identificou pontos decisivos para o seu estudo:
    </p>

    <!-- Point 1: Critical -->
    <div style="background-color: #fff1f2; border-left: 4px solid #f43f5e; border-radius: 6px; padding: 16px; margin-bottom: 15px;">
      <strong style="color: #9f1239; font-size: 13px; uppercase; display: block; margin-bottom: 4px;">🎯 Ponto de Atenção Crítico:</strong>
      <span style="font-size: 14px; font-weight: 700; color: #1e293b;">${criticalTitle}</span>
    </div>

    <!-- Point 2: Positive -->
    <div style="background-color: #ecfdf5; border-left: 4px solid ${COLORS.success}; border-radius: 6px; padding: 16px; margin-bottom: 25px;">
      <strong style="color: #065f46; font-size: 13px; uppercase; display: block; margin-bottom: 4px;">⭐ Seu Maior Destaque:</strong>
      <span style="font-size: 14px; font-weight: 700; color: #1e293b;">${positiveTitle}</span>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/meu-progresso" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px;">
        Ver Diagnóstico Completo da Sofia ➔
      </a>
    </div>
  `;
  return BaseLayout(content);
}

/**
 * EMAIL 4: RECUPERAÇÃO DE SENHA (Password Reset)
 */
export function getPasswordResetEmailHtml(name: string, resetUrl: string): string {
  const content = `
    <h1 style="font-size: 22px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 16px 0;">
      🔑 Redefinição de Senha
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: ${COLORS.textMuted}; margin: 0 0 20px 0;">
      Olá ${name}, recebemos uma solicitação para redefinir a senha da sua conta na <strong>Voe Certo</strong>.
    </p>
    <p style="font-size: 14px; color: ${COLORS.textMuted}; margin: 0 0 25px 0;">
      Clique no botão abaixo para cadastrar sua nova senha com segurança:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px;">
        Redefinir Minha Senha ➔
      </a>
    </div>

    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 25px;">
      Este link expira em 1 hora. Se você não solicitou a alteração, ignore este e-mail.
    </p>
  `;
  return BaseLayout(content);
}
