import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield, Lock, FileText, UserCheck, Server, Eye, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          
          {/* Header da Página */}
          <div className="space-y-4 text-center md:text-left border-b border-border pb-6">
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
              </Link>
            </Button>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-3 bg-primary/10 rounded-[10px] text-accent">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Política de Privacidade & LGPD</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-mono pt-1">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Conteúdo da Política */}
          <div className="space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
            
            {/* Seção 1 */}
            <section className="bg-card rounded-[10px] border border-border p-6 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                <FileText className="w-5 h-5 text-accent" />
                <h2>1. Compromisso com a sua Privacidade</h2>
              </div>
              <p>
                O <strong>Voe Certo</strong> assume o compromisso público de tratar os dados pessoais de seus usuários de forma segura, ética e transparente. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações de acordo com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)</strong>.
              </p>
            </section>

            {/* Seção 2 */}
            <section className="bg-card rounded-[10px] border border-border p-6 space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                <Eye className="w-5 h-5 text-accent" />
                <h2>2. Dados Pessoais Coletados</h2>
              </div>
              <p>Coletamos apenas as informações estritamente necessárias para a prestação dos nossos serviços de simulados e guias de carreira na aviação:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Dados de Cadastro:</strong> Nome completo, endereço de e-mail e foto de perfil (via Google OAuth ou cadastro de conta).</li>
                <li><strong>Dados de Desempenho nos Simulados:</strong> Respostas marcadas, pontuações, tempo de prova, blocos concluídos e estatísticas de estudos para exibir no seu painel de progresso.</li>
                <li><strong>Dados de Interação com a IA (Mike):</strong> Dúvidas e mensagens enviadas ao assistente virtual para gerar respostas explicativas sobre as questões.</li>
                <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador e preferências de consentimento armazenadas localmente no seu dispositivo.</li>
              </ul>
            </section>

            {/* Seção 3 */}
            <section className="bg-card rounded-[10px] border border-border p-6 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                <Server className="w-5 h-5 text-accent" />
                <h2>3. Finalidade do Tratamento dos Dados</h2>
              </div>
              <p>Os seus dados são tratados exclusivamente para as seguintes finalidades legítimas:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Permitir o seu acesso seguro e autenticação na plataforma.</li>
                <li>Calcular seu histórico de desempenho e recomendações personalizadas de estudo.</li>
                <li>Processar assinaturas de planos (quando contratados) por meio de plataformas de pagamento homologadas.</li>
                <li>Garantir a segurança da plataforma e prevenir usos indevidos ou fraudes.</li>
              </ul>
            </section>

            {/* Seção 4 */}
            <section className="bg-card rounded-[10px] border border-border p-6 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                <UserCheck className="w-5 h-5 text-accent" />
                <h2>4. Direitos do Titular dos Dados (Art. 18 da LGPD)</h2>
              </div>
              <p>Você, na condição de Titular dos Dados Pessoais, possui os seguintes direitos garantidos por lei:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-muted/40 rounded-[6px] border border-border/50 text-xs sm:text-sm">
                  <strong>Confirmar & Acessar:</strong> Saber quais dados temos sobre você a qualquer momento.
                </div>
                <div className="p-3 bg-muted/40 rounded-[6px] border border-border/50 text-xs sm:text-sm">
                  <strong>Corrigir & Atualizar:</strong> Solicitar a correção de dados incompletos ou inexatos.
                </div>
                <div className="p-3 bg-muted/40 rounded-[6px] border border-border/50 text-xs sm:text-sm">
                  <strong>Eliminação:</strong> Requerer a exclusão definitiva da sua conta e histórico de dados.
                </div>
                <div className="p-3 bg-muted/40 rounded-[6px] border border-border/50 text-xs sm:text-sm">
                  <strong>Revogação do Consentimento:</strong> Retirar autorizações anteriormente concedidas.
                </div>
              </div>
            </section>

            {/* Seção 5 */}
            <section className="bg-card rounded-[10px] border border-border p-6 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                <Lock className="w-5 h-5 text-accent" />
                <h2>5. Segurança e Armazenamento</h2>
              </div>
              <p>
                Utilizamos infraestrutura de nuvem segura via <strong>Supabase</strong>, com criptografia de ponta a ponta (SSL/TLS em trânsito e AES-256 em repouso), controle estrito de acesso e monitoramento contínuo. Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros sob qualquer hipótese.
              </p>
            </section>

            {/* Seção 6 - Contato DPO */}
            <section className="bg-primary/5 border border-primary/20 rounded-[10px] p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <Mail className="w-5 h-5 text-accent" />
                <h2>6. Contato do Encarregado de Dados (DPO)</h2>
              </div>
              <p className="text-foreground">
                Para exercer seus direitos de privacidade ou esclarecer dúvidas sobre o tratamento de dados pessoais, entre em contato diretamente com o nosso Encarregado de Proteção de Dados (DPO):
              </p>
              <div className="pt-1">
                <a
                  href="mailto:privacidade@voecerto.com.br"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-[6px] hover:bg-primary/90 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  privacidade@voecerto.com.br
                </a>
              </div>
            </section>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
