import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Menu, X, User, Crown, LogOut, Settings } from 'lucide-react';
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-card border-t border-border"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link
              to="/simulados"
              onClick={() => setIsMenuOpen(false)}
              className="text-foreground font-medium py-2"
            >
              Simulados
            </Link>
            <Link
              to="/guia-carreira"
              onClick={() => setIsMenuOpen(false)}
              className="text-foreground font-medium py-2"
            >
              Guia de Carreira
            </Link>
            {user && (
              <>
                <Link to="/conquistas" onClick={() => setIsMenuOpen(false)} className="text-foreground font-medium py-2">
                  Conquistas
                </Link>
                <Link to="/meu-progresso" onClick={() => setIsMenuOpen(false)} className="text-foreground font-medium py-2">
                  Meu Progresso
                </Link>
                <Link to="/microcursos" onClick={() => setIsMenuOpen(false)} className="text-foreground font-medium py-2">
                  Microcursos
                </Link>
                <Link to="/curriculo" onClick={() => setIsMenuOpen(false)} className="text-foreground font-medium py-2">
                  Meu Currículo
                </Link>
              </>
            )}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              {user ? (
                <>
                  {isAdmin && (
                    <Button variant="outline" asChild>
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Admin
                      </Link>
                    </Button>
                  )}
                  <Button variant="destructive" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      Entrar
                    </Link>
                  </Button>
                  <Button variant="hero" asChild>
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Crown className="w-4 h-4 mr-2" />
                      Começar Grátis
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
