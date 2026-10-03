import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, Menu, X, User, Crown, LogOut, Settings, 
  BookOpen, Award, TrendingUp, GraduationCap, 
  FileText, Sparkles, ChevronDown, LayoutDashboard
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
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { NotificationBell } from './notifications/NotificationBell';
import { useBranding } from '@/contexts/BrandingContext';
import { usePlan } from '@/hooks/usePlan';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const { currentPlan } = usePlan();
  const { settings: branding, isLoading: brandingLoading } = useBranding();
  const isLoading = authLoading || brandingLoading;
  const queryClient = useQueryClient();
  const isHome = location.pathname === '/';

  const getDriveImageUrl = (url: string | null): string | null => {
    if (!url) return null;
    if (url.includes('lh3.googleusercontent.com')) return url;
    const ucMatch = url.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/);
    if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
    return url;
  };

  // Iniciais do avatar
  const getInitials = () => {
    const name = profile?.full_name || user?.email || '';
    const parts = name.split(/[\s@]/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

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
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    await signOut();
    navigate('/');
  };

  // Itens de navegação principal — visíveis na barra superior e no topo do mobile
  const primaryNavItems = [
    { to: '/simulados', label: 'Simulados', icon: BookOpen, prefetch: prefetchCategories },
    { to: '/guia-carreira', label: 'Guia de Carreira', icon: GraduationCap, prefetch: prefetchCareerGuides, feature: 'career_guide' as const },
    { to: '/curriculo', label: 'Currículo IA', badge: 'IA', icon: FileText, feature: 'curriculum' as const },
    { to: '/meu-progresso', label: 'Desempenho', icon: TrendingUp, authOnly: true, feature: 'progress' as const },
    { to: '/microcursos', label: 'Microcursos', icon: Sparkles, prefetch: prefetchMicrocourses, feature: 'microcourses' as const },
  ];

  const filteredPrimaryItems = primaryNavItems.filter(item => {
    if (item.authOnly && !user) return false;
    if (item.feature && branding.features && branding.features[item.feature] === false) return false;
    return true;
  });

  const isTransparent = isHome && !isScrolled;

  const planName = currentPlan === 'comandante' 
    ? 'Comandante' 
    : currentPlan === 'tripulante' 
      ? 'Tripulante' 
      : currentPlan === 'solo' 
        ? 'Solo' 
        : 'Gratuito';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
        isTransparent
          ? 'bg-transparent border-transparent'
          : 'bg-white/95 backdrop-blur-md border-border/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 md:h-16">

          {/* Logo */}
          <div className="flex-1 flex items-center justify-start">
            <Link to="/" className="flex items-center gap-2 group">
              {branding.logo_url ? (
                <img
                  src={getDriveImageUrl(branding.logo_url) || ''}
                  alt={branding.site_name}
                  loading="eager"
                  decoding="async"
                  className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <>
                  <Plane className="w-8 h-8 md:w-9 md:h-9 text-accent" />
                  <span className={`text-xl md:text-2xl font-bold tracking-tight ${
                    isTransparent ? 'text-white' : 'text-foreground'
                  }`}>
                    {branding.site_name}
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-none items-center justify-center gap-6">
            {filteredPrimaryItems.map(item => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium transition-colors hover:text-accent flex items-center gap-1.5 ${
                    isActive
                      ? 'text-accent font-semibold'
                      : isTransparent
                        ? 'text-white/95'
                        : 'text-muted-foreground'
                  }`}
                  onMouseEnter={item.prefetch}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-[4px] bg-amber-400/20 text-amber-500 border border-amber-400/30 tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Ações do usuário */}
          <div className="flex-1 flex items-center justify-end gap-3">

            {/* Desktop */}
            <div className="hidden md:flex items-center gap-3 justify-end">
              {user ? (
                <>
                  <NotificationBell className={isTransparent ? 'text-white hover:bg-white/10' : ''} />

                  {/* Dropdown de perfil — Focado em Conta, Assinatura e Gestão */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-9 flex items-center gap-2 rounded-[5px] font-semibold pr-2.5 pl-1.5 ${
                          isTransparent
                            ? 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white'
                            : 'hover-yellow border-border'
                        }`}
                      >
                        {/* Avatar com iniciais */}
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isTransparent ? 'bg-white/20 text-white' : 'bg-primary text-white'
                        }`}>
                          {getInitials()}
                        </span>
                        <span className="max-w-[100px] truncate text-sm">
                          {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-64 rounded-[5px] p-0 overflow-hidden shadow-xl border-border">
                      {/* Cabeçalho do perfil */}
                      <div className="px-4 py-3 bg-muted/40 border-b border-border">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-black text-white shrink-0">
                            {getInitials()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate text-foreground">
                              {profile?.full_name || user.email?.split('@')[0]}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Conta, Assinatura e Conquistas */}
                      <div className="py-1">
                        <DropdownMenuItem asChild>
                          <Link
                            to="/perfil"
                            className={`flex items-center gap-2.5 px-4 py-2 cursor-pointer font-medium ${
                              location.pathname === '/perfil' ? 'text-accent font-semibold' : ''
                            }`}
                          >
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>Meu Perfil</span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            to="/premium"
                            className={`flex items-center justify-between px-4 py-2 cursor-pointer font-medium ${
                              location.pathname === '/premium' ? 'text-accent font-semibold' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Crown className="w-4 h-4 text-amber-500" />
                              <span>Minha Assinatura</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] bg-primary/10 text-primary">
                              {planName}
                            </span>
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <Link
                            to="/conquistas"
                            className={`flex items-center gap-2.5 px-4 py-2 cursor-pointer font-medium ${
                              location.pathname === '/conquistas' ? 'text-accent font-semibold' : ''
                            }`}
                          >
                            <Award className="w-4 h-4 text-muted-foreground" />
                            <span>Conquistas & Insígnias</span>
                          </Link>
                        </DropdownMenuItem>
                      </div>

                      {/* Admin — só visível para admins */}
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <div className="py-1">
                            <DropdownMenuItem asChild>
                              <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2 cursor-pointer font-medium">
                                <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                                <span>Painel Admin</span>
                              </Link>
                            </DropdownMenuItem>
                          </div>
                        </>
                      )}

                      <DropdownMenuSeparator />

                      {/* Sair */}
                      <div className="py-1">
                        <DropdownMenuItem
                          onClick={handleSignOut}
                          className="flex items-center gap-2.5 px-4 py-2 text-destructive focus:text-destructive cursor-pointer font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sair da conta</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className={isTransparent ? 'text-white hover:bg-white/10' : ''}>
                    <Link to="/auth?mode=login">Entrar</Link>
                  </Button>
                  <Button size="sm" asChild className="rounded-[5px] shadow-sm font-semibold hover-yellow">
                    <Link to="/auth?mode=signup">Começar Agora</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile — sino + hamburguer */}
            <div className="flex items-center gap-2 md:hidden">
              {user && <NotificationBell className={isTransparent ? 'text-white hover:bg-white/10' : ''} />}
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 p-0 ${isTransparent ? 'text-white hover:bg-white/10' : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">

              {/* Perfil do usuário no topo do menu mobile */}
              {user && (
                <div className="p-3 bg-muted/40 rounded-[8px] border border-border/60">
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-black text-white shrink-0">
                        {getInitials()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">
                          {profile?.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-primary/10 text-primary shrink-0">
                      {planName}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                    <Link
                      to="/perfil"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[5px] bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      Meu Perfil
                    </Link>
                    <Link
                      to="/premium"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[5px] bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      Assinatura
                    </Link>
                  </div>
                </div>
              )}

              {/* Itens de navegação principais no mobile */}
              <div className="space-y-1">
                {filteredPrimaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-[6px] text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-bold'
                          : 'text-foreground/80 hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-[4px] bg-amber-400/20 text-amber-500 border border-amber-400/30 tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {/* Conquistas no mobile */}
                {user && (
                  <Link
                    to="/conquistas"
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-[6px] text-sm font-medium transition-colors ${
                      location.pathname === '/conquistas'
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-foreground/80 hover:bg-muted'
                    }`}
                  >
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span>Conquistas & Insígnias</span>
                  </Link>
                )}
              </div>

              {/* Ações inferiores no mobile */}
              {user ? (
                <div className="pt-2 border-t border-border space-y-1">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-[6px] text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Painel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 p-3 w-full rounded-[6px] text-sm font-medium text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da conta
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link to="/auth?mode=login">Entrar</Link>
                  </Button>
                  <Button size="sm" asChild onClick={() => setIsMenuOpen(false)} className="hover-yellow font-bold">
                    <Link to="/auth?mode=signup">Cadastrar</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
