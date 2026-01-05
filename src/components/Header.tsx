import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Menu, X, User, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 ${
        isHome ? 'bg-transparent' : 'bg-card/80 backdrop-blur-md border-b border-border'
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
            <span className={`text-xl font-bold ${isHome ? 'text-primary-foreground' : 'text-foreground'}`}>
              Voo Certo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/simulados"
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isHome ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}
            >
              Simulados
            </Link>
            <Link
              to="/categorias"
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isHome ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}
            >
              Categorias
            </Link>
            <Link
              to="/meu-progresso"
              className={`text-sm font-medium transition-colors hover:text-accent ${
                isHome ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}
            >
              Meu Progresso
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant={isHome ? 'glass' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/admin" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Admin
              </Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/premium" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Premium
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className={`w-6 h-6 ${isHome ? 'text-primary-foreground' : 'text-foreground'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isHome ? 'text-primary-foreground' : 'text-foreground'}`} />
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
              to="/categorias"
              onClick={() => setIsMenuOpen(false)}
              className="text-foreground font-medium py-2"
            >
              Categorias
            </Link>
            <Link
              to="/meu-progresso"
              onClick={() => setIsMenuOpen(false)}
              className="text-foreground font-medium py-2"
            >
              Meu Progresso
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Button variant="outline" asChild>
                <Link to="/admin">Admin</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/premium">
                  <Crown className="w-4 h-4 mr-2" />
                  Premium
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
