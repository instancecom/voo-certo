import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, Menu, X, User, Crown, LogOut, Settings, 
  BookOpen, Award, TrendingUp, GraduationCap, 
  FileText, LayoutDashboard, Sparkles, ChevronRight,
  ShieldCheck, HelpCircle
} from 'lucide-react';
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

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { to: '/simulados', label: 'Simulados', icon: BookOpen, prefetch: prefetchCategories },
    { to: '/guia-carreira', label: 'Guia de Carreira', icon: GraduationCap, prefetch: prefetchCareerGuides },
    { to: '/microcursos', label: 'Microcursos', icon: Sparkles, prefetch: prefetchMicrocourses },
    { to: '/conquistas', label: 'Minhas Conquistas', icon: Award, authOnly: true },
    { to: '/meu-progresso', label: 'Meu Progresso', icon: TrendingUp, authOnly: true },
    { to: '/curriculo', label: 'Meu Currículo', icon: FileText, authOnly: true },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHome && !isScrolled 
          ? 'bg-transparent py-6 border-transparent' 
          : 'bg-white/80 dark:bg-card/80 backdrop-blur-xl border-b border-border shadow-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group relative z-[60]">
            <div className={`p-2 rounded-xl transition-all duration-300 ${isHome && !isScrolled ? 'bg-primary/20 bg-accent/20' : 'bg-primary/10'}`}>
              <Plane className="w-6 h-6 text-accent transition-transform group-hover:rotate-12 group-hover:scale-110" />
            </div>
            <span className={`text-xl font-black tracking-tight transition-colors duration-300 ${
              isHome && !isScrolled ? 'text-white' : 'text-foreground'
            }`}>
              Voo Certo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {menuItems.filter(item => !item.authOnly || user).map(item => (
              <Button
                key={item.to}
                variant="ghost"
                asChild
                className={`text-sm font-semibold transition-all duration-200 px-4 rounded-full ${
                  location.pathname === item.to 
                    ? 'bg-primary/10 text-primary' 
                    : isHome && !isScrolled 
                      ? 'text-white/80 hover:bg-white/10 hover:text-white' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onMouseEnter={item.prefetch}
              >
                <Link to={item.to}>{item.label}</Link>
              </Button>
            ))}
          </nav>

          {/* Desktop CTA & User */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <Button
                    variant={isHome && !isScrolled ? 'glass' : 'outline'}
                    size="sm"
                    asChild
                    className="rounded-full border-accent/20"
                  >
                    <Link to="/admin" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4 text-accent" />
                      <span className="font-bold">Admin</span>
                    </Link>
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isHome && !isScrolled ? 'glass' : 'outline'}
                      size="sm"
                      className="flex items-center gap-2.5 rounded-full pr-1 px-1"
                    >
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-xs ring-2 ring-background">
                        {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[100px] truncate font-bold text-xs pr-2">
                        {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-2">
                    <div className="px-2 py-3 mb-2 bg-muted/30 rounded-xl">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Logado como</p>
                      <p className="text-sm font-black truncate">{profile?.full_name || user.email}</p>
                      {profile?.is_premium ? (
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-accent uppercase tracking-tighter">
                          <Crown className="w-3 h-3 fill-accent" /> Premium
                        </div>
                      ) : (
                        <p className="text-[10px] font-medium text-muted-foreground mt-1">Plano Gratuito</p>
                      )}
                    </div>
                    <DropdownMenuItem asChild className="rounded-lg h-10">
                      <Link to="/meu-progresso" className="flex items-center gap-2.5">
                        <TrendingUp className="w-4 h-4 text-primary" /> Meu Progresso
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg h-10">
                      <Link to="/curriculo" className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-primary" /> Meu Currículo
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    {!profile?.is_premium && (
                      <DropdownMenuItem asChild className="rounded-lg h-10 bg-accent/10 focus:bg-accent/20 text-accent">
                        <Link to="/premium" className="flex items-center gap-2.5 font-bold">
                          <Crown className="w-4 h-4" /> Assinar Premium
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="rounded-lg h-10 text-destructive focus:bg-destructive/5 font-semibold">
                      <LogOut className="w-4 h-4 mr-2.5" /> Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant={isHome && !isScrolled ? 'glass' : 'ghost'}
                  size="sm"
                  asChild
                  className="rounded-full px-5 font-bold"
                >
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button variant="hero" size="sm" asChild className="rounded-full shadow-lg h-10 px-6 font-black uppercase tracking-wider text-xs">
                  <Link to="/auth">Começar Grátis</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden relative z-[60] p-2 rounded-full transition-all duration-300 ${
              isMenuOpen 
                ? 'bg-primary text-white scale-110 shadow-lg' 
                : isHome && !isScrolled 
                  ? 'bg-white/10 text-white' 
                  : 'bg-primary/10 text-primary'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[50] md:hidden"
            />
            
            {/* Premium Mobile Menu Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220, mass: 0.8 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[360px] bg-background z-[55] md:hidden shadow-[-20px_0_50px_-15px_rgba(0,0,0,0.3)] flex flex-col pt-24 overflow-hidden rounded-l-[40px] border-l-2 border-primary/10"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6 pb-28 scrollbar-none custom-scrollbar">
                {/* Profile Header (Mobile) */}
                {user ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-10 p-5 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 flex items-center gap-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                      <Plane className="w-20 h-20 -rotate-12" />
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20 ring-4 ring-background">
                      {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Bem-vindo(a) comandante</p>
                      <h3 className="font-black text-lg text-foreground truncate leading-tight">
                        {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                      </h3>
                      {profile?.is_premium && (
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] font-extrabold text-accent uppercase truncate">
                          <Crown className="w-3.5 h-3.5 fill-accent animate-pulse" /> Explorer Premium
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                   <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                   >
                     <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border-4 border-background shadow-lg">
                       <User className="w-10 h-10 text-primary" />
                     </div>
                     <h3 className="font-black text-xl mb-1">Pronto para decolar?</h3>
                     <p className="text-sm text-muted-foreground">Acesse sua conta ou cadastre-se para começar.</p>
                   </motion.div>
                )}

                {/* Primary Navigation */}
                <div className="space-y-1.5 px-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 ml-2">Navegação Principal</p>
                  {menuItems.map((item, i) => {
                    if (item.authOnly && !user) return null;
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
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
                          className={`flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98] ${
                            isActive 
                              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isActive ? 'bg-white/20' : 'bg-primary/10 text-primary'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-black text-sm uppercase tracking-wide">{item.label}</span>
                          {isActive && <motion.div layoutId="mobile-active-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                          {!isActive && <ChevronRight className="ml-auto w-4 h-4 opacity-30" />}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Bottom Actions Area */}
                <div className="mt-12 space-y-4 px-1">
                  {user ? (
                    <>
                      {isAdmin && (
                        <Button variant="outline" className="w-full h-14 justify-start px-5 gap-4 rounded-2xl border-2 border-primary/10 text-primary hover:bg-primary/5 transition-all" asChild>
                          <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <span className="font-black text-xs uppercase tracking-widest">Painel Admin</span>
                          </Link>
                        </Button>
                      )}
                      
                      {!profile?.is_premium && (
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-[22px] blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                          <Button variant="hero" className="w-full h-14 justify-start px-5 gap-4 rounded-2xl relative shadow-xl overflow-hidden" asChild>
                            <Link to="/premium" onClick={() => setIsMenuOpen(false)}>
                              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                                <Crown className="w-5 h-5 text-accent fill-accent" />
                              </div>
                              <span className="font-black text-xs uppercase tracking-widest">Upgrade Premium</span>
                            </Link>
                          </Button>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <Button variant="ghost" className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 bg-muted/50" asChild>
                           <Link to="/ajuda" onClick={() => setIsMenuOpen(false)}>
                             <HelpCircle className="w-4 h-4" /> Ajuda
                           </Link>
                        </Button>
                        <Button variant="ghost" className="h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2 text-destructive bg-destructive/5 hover:bg-destructive/10" onClick={handleSignOut}>
                          <LogOut className="w-4 h-4" /> Sair
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-xs" asChild>
                        <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Fazer Login</Link>
                      </Button>
                      <Button variant="hero" className="w-full h-14 rounded-2xl shadow-xl font-black uppercase tracking-widest text-xs" asChild>
                        <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                          Começar Agora
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Menu Bottom Decoration */}
              <div className="p-6 bg-muted/30 border-t border-primary/5 flex items-center justify-center">
                 <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all">
                    <Plane className="w-4 h-4" />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase">Voo Certo v2.0</span>
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
