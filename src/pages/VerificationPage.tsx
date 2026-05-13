import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShieldCheck, Award, Calendar, User, CheckCircle2, ArrowLeft, ExternalLink, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageTransition } from '@/components/PageTransition';

const getDriveImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.includes('lh3.googleusercontent.com')) return url;
  const ucMatch = url.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/);
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  return url;
};

export default function VerificationPage() {
  const { approvalId } = useParams();

  const { data: verification, isLoading, error } = useQuery({
    queryKey: ['verification', approvalId],
    queryFn: async () => {
      if (!approvalId) return null;

      const { data: verifyData, error: verifyError } = await supabase
        .from('badge_verifications')
        .select(`
          *,
          insignia:insignias(*)
        `)
        .eq('approval_id', approvalId)
        .maybeSingle();

      if (verifyError) {
        console.error("Erro na verificação:", verifyError);
        throw verifyError;
      }
      
      if (!verifyData) return null;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', verifyData.user_id)
        .maybeSingle();

      return {
        ...verifyData,
        profile: profileData || { full_name: 'Piloto Voo Certo' }
      };
    },
    enabled: !!approvalId,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Plane className="w-8 h-8 text-primary opacity-20" />
        </motion.div>
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Verificando credencial...</p>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <ShieldCheck className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Credencial não encontrada</h1>
        <p className="text-muted-foreground max-w-xs mb-8">
          Não foi possível localizar uma credencial válida com o ID informado. Verifique o link e tente novamente.
        </p>
        <Button asChild variant="outline">
          <Link to="/"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Início</Link>
        </Button>
      </div>
    );
  }

  const insignia = verification.insignia;
  const profile = verification.profile;
  const imageUrl = getDriveImageUrl(insignia.model_url);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1 pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Verification Header */}
            <div className="flex flex-col items-center text-center mb-12">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success border border-success/20 mb-6"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Credencial Verificada</span>
              </motion.div>
              
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                Certificação de Preparação Técnica
              </h1>
              <p className="text-muted-foreground max-w-xl font-medium">
                Esta página confirma que o profissional utilizou a plataforma Voo Certo como suporte estratégico de estudo, atingindo a proficiência necessária para aprovação nos exames oficiais da ANAC.
              </p>
            </div>

            {/* Credential Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Badge Preview Area */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="relative group perspective-1000"
              >
                <div className="h-full rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-white/10 p-6 md:p-10 flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                  {/* Decorative backgrounds */}
                  <div className="absolute inset-0 bg-checkerboard opacity-5 pointer-events-none" />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
                  
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative z-10 w-full aspect-square max-w-[400px]"
                  >
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={insignia.name} 
                        className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                        <Award className="w-24 h-24 text-yellow-500" />
                      </div>
                    )}
                  </motion.div>

                  <div className="mt-8 text-center relative z-10">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{insignia.name}</h2>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">{insignia.rarity} Badge</p>
                  </div>
                </div>
              </motion.div>

              {/* Details Area */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-6"
              >
                <div className="bg-card rounded-2xl border border-border p-8 shadow-sm flex-1">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-8 border-b border-border pb-4">
                    Detalhes da Emissão
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-[5px] bg-muted flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Emitido para</p>
                        <p className="font-bold text-lg text-foreground">{profile?.full_name || 'Piloto Voo Certo'}</p>
                        <p className="text-xs text-muted-foreground italic">{profile?.email?.replace(/(.{3}).*(@.*)/, '$1...$2')}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-[5px] bg-muted flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Data de Conquista</p>
                        <p className="font-bold text-lg text-foreground">
                          {new Date(verification.reviewed_at || verification.submitted_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-[5px] bg-muted flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">ID de Verificação</p>
                        <p className="font-mono font-bold text-sm text-primary uppercase">{verification.approval_id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-10 border-t border-border">
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      "Esta credencial certifica que o profissional demonstrou domínio técnico através da metodologia de simulados de alta performance do Voo Certo, garantindo o preparo exigido para as bancas examinadoras da ANAC."
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="flex-1 bg-primary text-white hover:bg-primary/90 h-12 rounded-[5px] font-bold uppercase text-xs tracking-widest shadow-xl shadow-primary/20">
                    <Link to="/">Conhecer o Voo Certo <ExternalLink className="w-3 h-3 ml-2" /></Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1 h-12 rounded-[5px] font-bold uppercase text-xs tracking-widest border-border/60">
                    <Link to="/simulados">Treinar Agora</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
