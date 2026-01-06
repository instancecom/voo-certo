import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
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
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao início
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <Plane className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold text-foreground">Voo Certo</span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {isLogin
              ? 'Entre para continuar sua preparação'
              : 'Comece sua jornada para a aprovação'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                'Entrar'
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-accent font-medium hover:underline"
              >
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Image/Branding */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center p-8"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-primary-foreground max-w-md"
        >
          <motion.div
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 2, 0],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Plane className="w-24 h-24 mx-auto mb-8 text-accent" />
          </motion.div>
          
          <h2 className="text-3xl font-bold mb-4">
            Sua aprovação começa aqui
          </h2>
          <p className="text-primary-foreground/80">
            Milhares de candidatos já estão se preparando com simulados realistas 
            e cronometrados. Junte-se a eles e decole na sua carreira.
          </p>

          <div className="flex justify-center gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">500+</div>
              <div className="text-sm text-primary-foreground/60">Questões</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">95%</div>
              <div className="text-sm text-primary-foreground/60">Aprovação</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm text-primary-foreground/60">Acesso</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
