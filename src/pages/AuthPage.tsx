import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Mail, Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBranding } from '@/contexts/BrandingContext';

const getDriveImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  if (url.includes('lh3.googleusercontent.com')) return url;
  const ucMatch = url.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/);
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  return url;
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { settings: branding } = useBranding();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: 'Bem-vindo de volta!',
          description: 'Login realizado com sucesso.',
        });
        navigate('/');
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          toast({
            title: 'Verifique seu email',
            description: 'Enviamos um link de confirmação para o seu email. Confirme para acessar sua conta.',
          });
          setIsLogin(true);
        } else {
          toast({
            title: 'Conta criada!',
            description: 'Sua conta foi criada com sucesso. Você já pode começar!',
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = 'Ocorreu um erro. Tente novamente.';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Faça login.';
      } else if (error.message?.includes('Password should be')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.message?.includes('rate limit') || error.status === 429) {
        errorMessage = 'Muitas tentativas de cadastro. O limite de envio de emails foi atingido, aguarde cerca de uma hora ou use outro provedor de email (SMTP) no Supabase.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-6 md:px-8 lg:px-12 bg-card/10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[420px] my-auto p-6 sm:p-8 bg-card border border-border rounded-[8px] shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors text-[11px] uppercase font-bold tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao início
            </Link>

            <div className="flex items-center gap-2">
              {branding.logo_url ? (
                <img
                  src={getDriveImageUrl(branding.logo_url) || ''}
                  alt={branding.site_name}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <div className="p-1.5 bg-primary/5 rounded-[5px]">
                  <Plane className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-1.5 tracking-tight">
              {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              {isLogin
                ? 'Entre para continuar seu treinamento técnico'
                : 'Comece sua jornada para a aprovação padrão ANAC'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nome e Sobrenome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 h-10 sm:h-11 rounded-[6px] border-border/60 font-medium text-sm"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Endereço de Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@profissional.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 sm:h-11 rounded-[6px] border-border/60 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Senha de Acesso</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-10 sm:h-11 rounded-[6px] border-border/60 font-medium text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full h-11 sm:h-12 rounded-[6px] font-bold text-sm hover-yellow shadow-md mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLogin ? (
                'Fazer Login'
              ) : (
                'Criar Conta Profissional'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border/60 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {isLogin ? 'Novo por aqui?' : 'Já possui registro?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary font-bold hover:underline"
              >
                {isLogin ? 'Cadastrar-se agora' : 'Acesse sua conta'}
              </button>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
             <ShieldCheck className="w-3.5 h-3.5" />
             Proteção SSL 256 bits
          </div>
        </motion.div>
      </div>

      {/* Right Side - Image/Branding */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center p-12 overflow-hidden relative"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="absolute inset-0 opacity-10 blur-3xl pointer-events-none">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-primary-foreground max-w-lg relative z-10"
        >
          <motion.div
            animate={{
              y: [-15, 15, -15],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-10"
          >
            {branding.logo_url ? (
              <img
                src={getDriveImageUrl(branding.logo_url) || ''}
                alt={branding.site_name}
                className="h-36 w-auto object-contain mx-auto drop-shadow-2xl"
              />
            ) : (
              <Plane className="w-32 h-32 mx-auto text-accent opacity-50" />
            )}
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Metodologia que gera Aprovação
          </h2>
          <p className="text-primary-foreground/70 text-lg font-medium leading-relaxed mb-12">
            Nossos algoritmos analisam sua performance em tempo real, 
            garantindo que você estude o que realmente importa para a banca ANAC.
          </p>

          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 rounded-[5px] bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-black text-accent mb-1">500+</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/40">Questões</div>
            </div>
            <div className="p-6 rounded-[5px] bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-black text-accent mb-1">95%</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/40">Aprovação</div>
            </div>
            <div className="p-6 rounded-[5px] bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-black text-accent mb-1">24/7</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/40">Acesso</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
