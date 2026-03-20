import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Menu, X, User, Crown, LogOut, Settings, BookOpen, Award, TrendingUp, GraduationCap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const queryClient = useQueryClient();
  const isHome = location.pathname === '/';

  const prefetchCategories = () => {
    queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: async () => {
        const { data, error } = await supabase.from('categories').select('*').eq('is_active', true);
        if (error) throw error;
        return data;
      },
    });
  };

  const prefetchMicrocourses = () => {
    queryClient.prefetchQuery({
      queryKey: ['microcourses'],
      queryFn: async () => {
        const { data, error } = await supabase.from('microcourses').select('*').eq('is_active', true).order('display_order');
        if (error) throw error;
        return data;
      },
    });
  };

  const prefetchCareerGuides = () => {
    queryClient.prefetchQuery({
      queryKey: ['career-guides'],
      queryFn: async () => {
        const { data, error } = await supabase.from('career_guides').select('*').eq('is_active', true).order('display_order');
        if (error) throw error;
        return data;
      },
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isHome && !isScrolled 
          ? 'bg-transparent py-4 border-transparent shadow-none' 
          : 'bg-white/80 dark:bg-card/80 backdrop-blur-lg border-border shadow-sm py-0'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Plane className="w-8 h-8 text-accent transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              isHome && !isScrolled ? 'text-primary-foreground' : 'text-foreground'
            }`}>
              Voo Certo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/simulados"
              onMouseEnter={prefetchCategories}
              className={`text-sm font-medium transition-all duration-300 hover:text-accent ${
                isHome && !isScrolled ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}
            >
              Simulados
            </Link>
            <Link
              to="/guia-carreira"
              onMouseEnter={prefetchCareerGuides}
              className={`text-sm font-medium transition-all duration-300 hover:text-accent ${
                isHome && !isScrolled ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}
            >
              Guia de Carreira
            </Link>
            <Link
              to="/microcursos"
              onMouseEnter={prefetchMicrocourses}
              className={`text-sm font-medium transition-all duration-300 hover:text-accent ${
                isHome && !isScrolled ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}
            >
              Microcursos
            </Link>
            {user && (
              <>
                <Link
                  to="/conquistas"
                  className={`text-sm font-medium transition-all duration-300 hover:text-accent ${
                    isHome && !isScrolled ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  Conquistas
                </Link>
                <Link
                  to="/meu-progresso"
                  className={`text-sm font-medium transition-all duration-300 hover:text-accent ${
                    isHome && !isScrolled ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  Progresso
                </Link>
                <Link
                  to="/curriculo"
                  className={`text-sm font-medium transition-all duration-300 hover:text-accent ${
                    isHome && !isScrolled ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}
                >
                  Currículo
                </Link>
              </>
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <Button
                    variant={isHome && !isScrolled ? 'glass' : 'ghost'}
                    size="sm"
                    asChild
                  >
                    <Link to="/admin" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Admin
                    </Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isHome && !isScrolled ? 'glass' : 'outline'}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      {profile?.full_name || user.email?.split('@')[0]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/meu-progresso" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Meu Progresso
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/curriculo" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Meu Currículo
                      </Link>
                    </DropdownMenuItem>
                    {!profile?.is_premium && (
                      <DropdownMenuItem asChild>
                        <Link to="/premium" className="flex items-center gap-2 text-accent">
                          <Crown className="w-4 h-4" />
                          Seja Premium
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
                      <LogOut className="w-4 h-4" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant={isHome && !isScrolled ? 'glass' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/auth" className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Começar Grátis
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 transition-colors"
          >
            {isMenuOpen ? (
              <X className={`w-6 h-6 ${isHome && !isScrolled ? 'text-primary-foreground' : 'text-foreground'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isHome && !isScrolled ? 'text-primary-foreground' : 'text-foreground'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] md:hidden"
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-background z-[50] md:hidden shadow-2xl flex flex-col pt-20"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
                {/* Profile Header (if logged in) */}
                {user && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 p-4 rounded-2xl bg-muted/40 border border-border/50 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-foreground truncate">
                        {profile?.full_name || user.email?.split('@')[0]}
                      </h3>
                      {profile?.is_premium ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-accent uppercase tracking-wider">
                          <Crown className="w-3 h-3 saturate-[1.5]" />
                          Assinante Premium
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground truncate opacity-70">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Navigation Links */}
                <div className="space-y-2">
                  {[
                    { to: '/simulados', label: 'Simulados', icon: BookOpen },
                    { to: '/guia-carreira', label: 'Guia de Carreira', icon: Settings },
                    { to: '/microcursos', label: 'Microcursos', icon: Crown },
                    { to: '/conquistas', label: 'Minhas Conquistas', icon: Award, authOnly: true },
                    { to: '/meu-progresso', label: 'Meu Progresso', icon: User, authOnly: true },
                    { to: '/curriculo', label: 'Meu Currículo', icon: LogOut, authOnly: true },
                  ].map((item, i) => {
                    if (item.authOnly && !user) return null;
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.to}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + (i * 0.05) }}
                      >
                        <Link
                          to={item.to}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all active:scale-[0.98] ${
                            location.pathname === item.to 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            location.pathname === item.to ? 'bg-primary/20' : 'bg-muted'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-base">{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Bottom Actions */}
                <div className="mt-10 pt-6 border-t border-border space-y-3">
                  {user ? (
                    <>
                      {isAdmin && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Button variant="outline" className="w-full h-12 justify-start px-4 gap-3 rounded-xl border-accent/30 text-accent" asChild>
                            <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                              <Settings className="w-5 h-5" />
                              <span className="font-bold">Painel de Administração</span>
                            </Link>
                          </Button>
                        </motion.div>
                      )}
                      
                      {!profile?.is_premium && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.55 }}
                        >
                          <Button variant="hero" className="w-full h-12 justify-start px-4 gap-3 rounded-xl shadow-lg" asChild>
                            <Link to="/premium" onClick={() => setIsMenuOpen(false)}>
                              <Crown className="w-5 h-5" />
                              <span className="font-bold">Seja Premium Agora</span>
                            </Link>
                          </Button>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Button variant="ghost" className="w-full h-12 justify-start px-4 gap-3 rounded-xl text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
                          <LogOut className="w-5 h-5" />
                          <span className="font-bold">Encerrar Sessão</span>
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Button variant="outline" className="w-full h-12 rounded-xl" asChild>
                          <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Entrar na Conta</Link>
                        </Button>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Button variant="hero" className="w-full h-12 rounded-xl shadow-lg" asChild>
                          <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                            Começar Agora Gratuitamente
                          </Link>
                        </Button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
