import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, Menu, X, User, Crown, LogOut, Settings, 
  BookOpen, Award, TrendingUp, GraduationCap, 
  FileText, LayoutDashboard, Sparkles
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
import { NotificationBell } from './notifications/NotificationBell';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, isLoading } = useAuth();
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

  const menuItems = [
    { to: '/simulados', label: 'Simulados', icon: BookOpen, prefetch: prefetchCategories },
    { to: '/guia-carreira', label: 'Guia de Carreira', icon: GraduationCap, prefetch: prefetchCareerGuides },
    { to: '/microcursos', label: 'Microcursos', icon: Sparkles, prefetch: prefetchMicrocourses },
    { to: '/conquistas', label: 'Conquistas', icon: Award, authOnly: true },
    { to: '/meu-progresso', label: 'Progresso', icon: TrendingUp, authOnly: true },
    { to: '/curriculo', label: 'Currículo', icon: FileText, authOnly: true },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isHome && !isScrolled 
          ? 'bg-transparent py-4' 
          : 'bg-white border-b border-border py-4 shadow-sm'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Plane className="w-8 h-8 text-accent" />
            <span className={`text-xl font-bold tracking-tight ${
              isHome && !isScrolled ? 'text-white' : 'text-foreground'
            }`}>
              Voo Certo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.filter(item => !item.authOnly || user).map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === item.to 
                    ? 'text-accent' 
                    : isHome && !isScrolled 
                      ? 'text-white/90' 
                      : 'text-muted-foreground'
                }`}
                onMouseEnter={item.prefetch}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 min-w-[124px] justify-end">
              {user ? (
                /* Session found - show user UI immediately (profile data may fill in later) */
                <>
                  {/* Admin button area with stabilizer to prevent flicker */}
                  {user && isLoading ? (
                    <div className="w-20 h-8 mr-2 bg-muted/20 animate-pulse rounded-[5px]" />
                  ) : isAdmin ? (
                    <Button variant="ghost" size="sm" asChild className={isHome && !isScrolled ? 'text-white hover:bg-white/10' : ''}>
                      <Link to="/admin" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Admin
                      </Link>
                    </Button>
                  ) : null}
                  
                  <NotificationBell className={isHome && !isScrolled ? 'text-white hover:bg-white/10' : ''} />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`flex items-center gap-2 rounded-[5px] ${isHome && !isScrolled ? 'bg-white/10 text-white border-white/20 hover-yellow hover:text-foreground' : 'hover-yellow'}`}
                      >
                        <User className="w-4 h-4" />
                        <span className="max-w-[100px] truncate">
                          {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-[5px]">
                      <div className="px-2 py-1.5">
                        <p className="text-xs text-muted-foreground leading-none mb-1">Logado como</p>
                        <p className="text-sm font-medium truncate">{profile?.full_name || user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/meu-progresso" className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Progresso
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/conquistas" className="flex items-center gap-2">
                          <Award className="w-4 h-4" /> Conquistas
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                        <LogOut className="w-4 h-4 mr-2" /> Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : isLoading ? (
                /* Still checking auth state - show pulse to avoid flickering guest buttons */
                <div className="w-24 h-8 bg-muted/20 animate-pulse rounded-[5px]" />
              ) : (
                /* Confirmed guest - show login/register */
                <>
                  <Button variant="ghost" size="sm" asChild className={isHome && !isScrolled ? 'text-white hover:bg-white/10' : ''}>
                    <Link to="/auth">Entrar</Link>
                  </Button>
                  <Button size="sm" asChild className="rounded-[5px] shadow-sm font-semibold hover-yellow hover:text-foreground">
                    <Link to="/auth">Começar Agora</Link>
                  </Button>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              {user ? (
                <>
                  <NotificationBell className={isHome && !isScrolled ? 'text-white hover:bg-white/10' : ''} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={isHome && !isScrolled ? 'text-white hover:bg-white/10' : ''}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    {isMenuOpen ? <X /> : < Menu />}
                  </Button>
                </>
              ) : isLoading ? (
                <div className="w-8 h-8 rounded-full bg-muted/20 animate-pulse" />
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className={isHome && !isScrolled ? 'text-white hover:bg-white/10' : ''}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </Button>
              )}
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
            <div className="container mx-auto px-4 py-4 space-y-1">
              {menuItems.map((item) => {
                if (item.authOnly && !user) return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.to 
                        ? 'bg-accent/10 text-accent' 
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
              
              <DropdownMenuSeparator className="my-2" />
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                      <Settings className="w-5 h-5" />
                      Painel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 p-3 w-full rounded-lg text-sm font-medium text-destructive hover:bg-destructive/5"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link to="/auth">Entrar</Link>
                  </Button>
                  <Button size="sm" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link to="/auth">Cadastrar</Link>
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
