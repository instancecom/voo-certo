import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Mail, Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        
        const { error } = await supabase.auth.signUp({
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

        toast({
          title: 'Conta criada!',
          description: 'Sua conta foi criada com sucesso. Você já pode começar!',
        });
        navigate('/');
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
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-card/10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md p-8 bg-card border border-border rounded-[5px] shadow-sm"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-10 text-[10px] uppercase font-bold tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>

          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 bg-primary/5 rounded-[5px]">
               <Plane className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-black text-foreground tracking-tight">Voo Certo</span>
          </div>

          <h1 className="text-3xl font-black text-foreground mb-2 tracking-tight">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta de elite'}
          </h1>
          <p className="text-muted-foreground mb-10 font-medium">
            {isLogin
              ? 'Entre para continuar seu treinamento técnico'
              : 'Comece sua jornada para a aprovação padrão ANAC'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nome e Sobrenome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-11 rounded-[5px] border-border/50 font-medium"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Endereço de Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@profissional.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-[5px] border-border/50 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Senha de Acesso</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-[5px] border-border/50 font-medium"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
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
              className="w-full h-12 rounded-[5px] font-bold text-sm hover-yellow"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                'Fazer Login'
              ) : (
                'Criar Conta Profissional'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              {isLogin ? 'Novo por aqui?' : 'Já possui registro?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary font-bold hover:underline"
              >
                {isLogin ? 'Cadastrar-se agora' : 'Acesse sua conta'}
              </button>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-30">
             <ShieldCheck className="w-4 h-4" />
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
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Plane className="w-32 h-32 mx-auto mb-10 text-accent opacity-50" />
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
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/40">Acessos</div>
            </div>
            <div className="p-6 rounded-[5px] bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl font-black text-accent mb-1">24/7</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/40">Suporte</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
