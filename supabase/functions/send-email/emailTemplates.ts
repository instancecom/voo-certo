// emailTemplates.ts — Sistema de Templates de E-mail HTML+CSS da Voe Certo

const COLORS = {
  primary: '#1D3A63',       // Azul Marinho Aviação
  primaryHover: '#294f84',
  accent: '#F9A91F',        // Dourado Âmbar
  background: '#f1f5f9',
  cardBg: '#ffffff',
  textMain: '#0f172a',
  textMuted: '#475569',
  success: '#10b981',
  warning: '#f59e0b',
};

const APP_URL = "https://voe-certo.vercel.app";

const BaseLayout = (titleHeader: string, subtitleHeader: string, contentHtml: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Voe Certo — Preparatório para Aviação Civil</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { max-width: 100%; height: auto; }
    a { color: ${COLORS.primary}; text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${COLORS.background}; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: ${COLORS.cardBg}; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
          
          <!-- Header Banner Voe Certo -->
          <tr>
            <td style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryHover} 100%); padding: 40px 30px; text-align: center;">
              <h2 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0 0 6px 0; letter-spacing: -0.5px; text-transform: uppercase;">
                ✈️ VOE CERTO
              </h2>
              <p style="color: ${COLORS.accent}; font-size: 12px; margin: 0 0 16px 0; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                ${subtitleHeader}
              </p>
              <div style="display: inline-block; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); padding: 8px 18px; border-radius: 20px; color: #ffffff; font-size: 14px; font-weight: 600;">
                ${titleHeader}
              </div>
            </td>
          </tr>

          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding: 35px 30px; color: ${COLORS.textMain};">
              ${contentHtml}
            </td>
          </tr>

          <!-- Rodapé do E-mail -->
          <tr>
            <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center; color: ${COLORS.textMuted}; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-weight: 800; color: ${COLORS.primary};">
                Voe Certo — Plataforma de Aviação Civil
              </p>
              <p style="margin: 0 0 10px 0;">
                Simulados para a ANAC • Mentoria Pedagógica • Análise de Carreira
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
 * MODELO 1: BEM-VINDO (Welcome Email)
 */
export function getWelcomeEmailHtml(name: string): string {
  const title = "Sua jornada na aviação começa agora 🚀";
  const subtitle = "BEM-VINDO(A) A BORDO";

  const content = `
    <h1 style="font-size: 22px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 16px 0;">
      Olá, ${name}! Seja muito bem-vindo(a)! ✈️
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: ${COLORS.textMuted}; margin: 0 0 20px 0;">
      Estamos muito felizes em ter você conosco na <strong>Voe Certo</strong>. Sua conta está 100% pronta para te conduzir até a aprovação na Banca da ANAC e na sua carreira aeronáutica!
    </p>

    <!-- Card dos Especialistas -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
      <h3 style="font-size: 13px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px;">
        👥 Seus Especialistas de Apoio 24/7 na Plataforma:
      </h3>
      
      <div style="margin-bottom: 12px;">
        <strong style="color: ${COLORS.primary}; font-size: 14px;">👨‍✈️ Prof. Hugo</strong>
        <span style="font-size: 13px; color: ${COLORS.textMuted}; margin-left: 6px;"> — Professor de Aviação Civil (Tira-dúvidas de cada questão)</span>
      </div>

      <div style="margin-bottom: 12px;">
        <strong style="color: ${COLORS.primary}; font-size: 14px;">👩‍💼 Sofia</strong>
        <span style="font-size: 13px; color: ${COLORS.textMuted}; margin-left: 6px;"> — Mentora de Desempenho (Análise pedagógica contínua)</span>
      </div>

      <div>
        <strong style="color: ${COLORS.primary}; font-size: 14px;">👔 Lucas</strong>
        <span style="font-size: 13px; color: ${COLORS.textMuted}; margin-left: 6px;"> — Analista de Carreiras (Criação e otimização do seu currículo)</span>
      </div>
    </div>

    <!-- Botão CTA -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/simulados" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(29, 58, 99, 0.25);">
        Iniciar Meus Simulados Agora ➔
      </a>
    </div>
  `;

  return BaseLayout(title, subtitle, content);
}

/**
 * MODELO 2: CONFIRMAÇÃO DE ASSINATURA DO PLANO (Plan Activated Confirmation)
 */
export function getPlanConfirmationEmailHtml(name: string, planName: string = 'Tripulante'): string {
  const title = `Decolagem Autorizada! 🚀`;
  const subtitle = "CONFIRMAÇÃO DE ASSINATURA";

  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="background-color: #d1fae5; color: ${COLORS.success}; font-size: 12px; font-weight: 800; padding: 6px 16px; border-radius: 20px; text-transform: uppercase;">
        ✓ Plano Ativado com Sucesso
      </span>
    </div>

    <h1 style="font-size: 22px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 16px 0; text-align: center;">
      Parabéns, ${name}! Seu Plano ${planName} está Ativo! 🎉
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: ${COLORS.textMuted}; margin: 0 0 24px 0; text-align: center;">
      Confirmamos o pagamento da sua assinatura. Todos os benefícios e recursos do <strong>Plano ${planName}</strong> já foram liberados na sua conta!
    </p>

    <!-- Caixinha de Benefícios -->
    <div style="background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%); border: 1px solid #cbd5e1; border-radius: 10px; padding: 22px; margin-bottom: 25px;">
      <h3 style="font-size: 14px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 12px 0; text-transform: uppercase;">
        ✨ Recursos Liberados na sua Conta:
      </h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: ${COLORS.textMuted}; line-height: 1.8;">
        <li>Simulados ilimitados para a Banca ANAC com gabaritos detalhados</li>
        <li>Tira-dúvidas de cada questão com o <strong>Prof. Hugo</strong></li>
        <li>Diagnóstico contínuo de evolução pedagógica com a <strong>Sofia</strong></li>
        <li>Montador e otimizador de currículos aeronáuticos com o <strong>Lucas</strong></li>
      </ul>
    </div>

    <!-- Botão CTA -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/simulados" style="display: inline-block; background-color: ${COLORS.accent}; color: #0f172a; font-size: 15px; font-weight: 900; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(249, 169, 31, 0.3);">
        Acessar Minha Plataforma ➔
      </a>
    </div>
  `;

  return BaseLayout(title, subtitle, content);
}

/**
 * MODELO 3: X DIAS QUE NÃO ENTRA (Reengajamento por Inatividade)
 */
export function getInactiveEmailHtml(name: string, daysInactive: number = 3): string {
  const title = `Sentimos sua falta na torre de controle! 📡`;
  const subtitle = "REENGANJAMENTO DE ESTUDOS";

  const content = `
    <h1 style="font-size: 22px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 16px 0;">
      Olá, ${name}! Fazem ${daysInactive} dias que você não treina...
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: ${COLORS.textMuted}; margin: 0 0 20px 0;">
      Na aviação, a <strong>constância é o segredo do voo seguro</strong>. Quando pausamos os treinos, o conteúdo da ANAC começa a esfriar na memória.
    </p>

    <!-- Caixinha Motivacional -->
    <div style="background-color: #fffbe0; border-left: 4px solid ${COLORS.accent}; border-radius: 8px; padding: 18px; margin-bottom: 25px;">
      <strong style="color: #92400e; font-size: 14px; display: block; margin-bottom: 6px;">
        💡 Dica do Prof. Hugo:
      </strong>
      <span style="font-size: 14px; color: #78350f; line-height: 1.5;">
        "Apenas 15 minutos por dia resolvendo 1 simulado rápido mantêm a sua mente afiada e evitam que você precise revisar tudo do zero antes da prova."
      </span>
    </div>

    <!-- Botão CTA -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/simulados" style="display: inline-block; background-color: ${COLORS.accent}; color: #0f172a; font-size: 15px; font-weight: 900; text-decoration: none; padding: 14px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(249, 169, 31, 0.3);">
        Retomar Meus Estudos Hoje ➔
      </a>
    </div>
  `;

  return BaseLayout(title, subtitle, content);
}

/**
 * MODELO 4: RECUPERAÇÃO DE SENHA (Password Reset)
 */
export function getPasswordResetEmailHtml(name: string, resetUrl: string): string {
  const title = "Solicitação de Redefinição de Senha 🔑";
  const subtitle = "SEGURANÇA DA CONTA";

  const content = `
    <h1 style="font-size: 22px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 16px 0;">
      Olá, ${name}!
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: ${COLORS.textMuted}; margin: 0 0 20px 0;">
      Recebemos uma solicitação para redefinir a senha da sua conta na <strong>Voe Certo</strong>.
    </p>
    <p style="font-size: 14px; color: ${COLORS.textMuted}; margin: 0 0 25px 0;">
      Para cadastrar uma nova senha com segurança, clique no botão abaixo:
    </p>

    <!-- Botão CTA -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(29, 58, 99, 0.25);">
        Redefinir Minha Senha ➔
      </a>
    </div>

    <!-- Aviso de Segurança -->
    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 14px; text-align: center; font-size: 12px; color: ${COLORS.textMuted};">
      Este link expira em 1 hora. Se você não solicitou esta alteração, fique tranquilo, sua conta continua segura.
    </div>
  `;

  return BaseLayout(title, subtitle, content);
}

/**
 * MODELO 5: LEMBRETE PARA ESTUDAR (Lembrete de Constância)
 */
export function getStudyReminderEmailHtml(name: string, streakDays: number = 1): string {
  const title = "Hora do seu treino diário de voo! 🛫";
  const subtitle = "PLANO DE ESTUDOS DIÁRIO";

  const content = `
    <h1 style="font-size: 22px; font-weight: 800; color: ${COLORS.primary}; margin: 0 0 16px 0;">
      Olá, ${name}! Pronto(a) para mais um simulado hoje?
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: ${COLORS.textMuted}; margin: 0 0 20px 0;">
      Seu plano de estudos está ativo e a <strong>Sofia (Mentora de Desempenho)</strong> separou os melhores blocos de questões para você treinar agora.
    </p>

    <!-- Box da Meta -->
    <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin-bottom: 25px; text-align: center;">
      <span style="font-size: 12px; font-weight: 800; color: ${COLORS.primary}; uppercase; tracking-wider;">META DO DIA</span>
      <h3 style="font-size: 18px; font-weight: 900; color: ${COLORS.textMain}; margin: 6px 0 4px 0;">
        Fazer 1 Simulado em Modo Banca ou Livre
      </h3>
      <p style="font-size: 13px; color: ${COLORS.textMuted}; margin: 0;">
        Manter o ritmo hoje garante maior retenção no dia da prova da ANAC.
      </p>
    </div>

    <!-- Botão CTA -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/simulados" style="display: inline-block; background-color: ${COLORS.primary}; color: #ffffff; font-size: 15px; font-weight: 800; text-decoration: none; padding: 14px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(29, 58, 99, 0.25);">
        Fazer 1 Simulado Agora ➔
      </a>
    </div>
  `;

  return BaseLayout(title, subtitle, content);
}
