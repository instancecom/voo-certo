import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FileText, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          
          {/* Header */}
          <div className="space-y-4 text-center md:text-left border-b border-border pb-6">
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início
              </Link>
            </Button>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-3 bg-primary/10 rounded-[10px] text-accent">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Termos e Condições de Uso</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Regras e diretrizes para utilização da plataforma Voe Certo
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-mono pt-1">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Conteúdo */}
          <div className="space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground">
            
            <section className="bg-card rounded-[10px] border border-border p-6 space-y-3">
              <h2 className="text-foreground font-bold text-lg">1. Aceitação dos Termos</h2>
              <p>
                Ao criar uma conta ou navegar no <strong>Voe Certo</strong>, você concorda expressamente com os presentes Termos de Uso e com nossa Política de Privacidade. Caso não concorde com qualquer uma das disposições, você não deverá utilizar os serviços oferecidos.
              </p>
            </section>

            <section className="bg-card rounded-[10px] border border-border p-6 space-y-3">
              <h2 className="text-foreground font-bold text-lg">2. Descrição dos Serviços</h2>
              <p>
                O Voe Certo é uma plataforma tecnológica e educacional independente que oferece simulados de bancas, guias de carreira na aviação e assistência de inteligência artificial (Mike).
              </p>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-[8px] flex items-start gap-3 text-amber-600 dark:text-amber-400 text-xs sm:text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  <strong>Aviso Importante:</strong> O Voe Certo não é afiliado, associado ou patrocinado pela Agência Nacional de Aviação Civil (ANAC). Nossas questões são elaboradas com base em padrões públicos do setor para fins de treino e preparação.
                </p>
              </div>
            </section>

            <section className="bg-card rounded-[10px] border border-border p-6 space-y-3">
              <h2 className="text-foreground font-bold text-lg">3. Contas e Uso de Planos</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Você é responsável por manter a confidencialidade da sua senha e conta.</li>
                <li>O acesso às funcionalidades de simulados avançados e assistente de IA depende do plano contratado (Tripulante ou Comandante).</li>
                <li>É vedado o compartilhamento de credenciais de acesso com terceiros.</li>
              </ul>
            </section>

            <section className="bg-card rounded-[10px] border border-border p-6 space-y-3">
              <h2 className="text-foreground font-bold text-lg">4. Propriedade Intelectual</h2>
              <p>
                Todo o conteúdo da plataforma, incluindo código-fonte, marcas, logotipos, layout visual e inteligência das questões, é de propriedade exclusiva do Voe Certo, protegido pela legislação brasileira de propriedade intelectual.
              </p>
            </section>

            <section className="bg-card rounded-[10px] border border-border p-6 space-y-3">
              <h2 className="text-foreground font-bold text-lg">5. Contato</h2>
              <p>
                Em caso de dúvidas sobre estes termos, entre em contato através do e-mail: <strong className="text-foreground">contato@voecerto.com.br</strong>.
              </p>
            </section>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
