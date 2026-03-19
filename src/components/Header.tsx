import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Menu, X, User, Crown, LogOut, Settings, LayoutDashboard, FileText, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { label: 'Simulados', href: '/simulados' },
    { label: 'Guia de Carreira', href: '/guia-carreira' },
    { label: 'Microcursos', href: '/microcursos' },
  ];

  const authLinks = user ? [
    { label: 'Conquistas', href: '/conquistas', icon: Trophy },
    { label: 'Progresso', href: '/meu-progresso', icon: LayoutDashboard },
    { label: 'Currículo', href: '/curriculo', icon: FileText },
  ] : [];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isHome && !isScrolled 
          ? 'bg-transparent py-4' 
          : 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/5 py-2'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-10">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-accent flex items-center justify-center transform group-hover:rotate-[15deg] transition-transform duration-500 shadow-lg shadow-accent/30">
                <Plane className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="absolute inset-0 bg-accent/40 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span className={`text-xl md:text-2xl font-black tracking-tighter transition-colors duration-500 ${
              isHome && !isScrolled ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}>
              Voo Certo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {[...navLinks, ...authLinks].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 relative group overflow-hidden ${
                  isHome && !isScrolled 
                    ? 'text-white/70 hover:text-white' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-accent'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4 relative z-10">
            {user ? (
              <>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className={`rounded-xl font-bold ${isHome && !isScrolled ? 'text-white/70 hover:text-white hover:bg-white/10' : ''}`}
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
                      className="flex items-center gap-2 rounded-xl border-2 font-bold px-4 h-11 transition-all hover:scale-105 active:scale-95"
                    >
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <span className="max-w-[120px] truncate">
                        {profile?.full_name || user.email?.split('@')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-white/20 backdrop-blur-3xl">
                    <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-accent focus:text-white cursor-pointer transition-colors">
                      <Link to="/meu-progresso" className="flex items-center gap-3 font-bold">
                        <LayoutDashboard className="w-4 h-4" />
                        Meu Progresso
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-accent focus:text-white cursor-pointer transition-colors">
                      <Link to="/curriculo" className="flex items-center gap-3 font-bold">
                        <FileText className="w-4 h-4" />
                        Meu Currículo
                      </Link>
                    </DropdownMenuItem>
                    {!profile?.is_premium && (
                      <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-accent focus:text-white cursor-pointer transition-colors text-accent font-black">
                        <Link to="/premium" className="flex items-center gap-3">
                          <Crown className="w-4 h-4" />
                          Seja Premium
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-2 bg-slate-200 dark:bg-slate-800" />
                    <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 focus:bg-destructive focus:text-white cursor-pointer transition-colors text-destructive font-bold">
                      <LogOut className="w-4 h-4 mr-3" />
                      Sair da Conta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={`rounded-xl font-bold h-11 px-6 ${isHome && !isScrolled ? 'text-white hover:bg-white/10' : 'text-slate-600'}`}
                >
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button variant="hero" size="sm" asChild className="rounded-xl h-11 px-6 shadow-xl shadow-accent/20">
                  <Link to="/auth" className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    <span>Começar Grátis</span>
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-3 rounded-2xl transition-all relative z-10 ${
              isHome && !isScrolled ? 'text-white hover:bg-white/10' : 'text-slate-900 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-0 top-[80px] bg-white dark:bg-slate-950 z-40 overflow-y-auto"
          >
            <div className="container mx-auto px-6 py-10 flex flex-col gap-6">
              {[...navLinks, ...authLinks].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between group py-4 border-b border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-4">
                      {link.icon && <link.icon className="w-5 h-5 text-accent" />}
                      <span className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-accent transition-colors tracking-tighter">
                        {link.label}
                      </span>
                    </div>
                    <Plane className="w-5 h-5 text-slate-300 group-hover:text-accent group-hover:translate-x-2 transition-all" />
                  </Link>
                </motion.div>
              ))}
              
              <div className="flex flex-col gap-4 mt-8">
                {user ? (
                  <Button variant="destructive" size="lg" onClick={handleSignOut} className="rounded-2xl h-14 font-black">
                    <LogOut className="w-5 h-5 mr-3" /> Sair
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="lg" asChild className="rounded-2xl h-14 font-black border-2">
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Fazer Login</Link>
                    </Button>
                    <Button variant="hero" size="lg" asChild className="rounded-2xl h-14 font-black shadow-2xl shadow-accent/20">
                      <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                        <Crown className="w-5 h-5 mr-3" /> Virar Premium
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
