import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Cookie, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type CookieConsentType = 'all' | 'essential' | null;

const COOKIE_CONSENT_KEY = 'voecerto_lgpd_consent';

export function CookieBanner() {
  const [consent, setConsent] = useState<CookieConsentType>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY) as CookieConsentType;
    if (savedConsent) {
      setConsent(savedConsent);
      setIsVisible(false);
    } else {
      // Pequeno delay para animação de entrada suave
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'all');
    setConsent('all');
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential');
    setConsent('essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-0 inset-x-0 z-[120] p-3 sm:p-4 md:p-6 pointer-events-none"
      >
        <div className="max-w-5xl mx-auto bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-[12px] p-4 sm:p-5 pointer-events-auto text-card-foreground">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Texto explicativo LGPD */}
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-[8px] bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 text-accent animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Sua Privacidade & LGPD
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Utilizamos cookies e tecnologias semelhantes para personalizar sua experiência, salvar seu progresso nos simulados e garantir o funcionamento seguro da plataforma, em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong>. Saiba mais na nossa{' '}
                  <Link to="/privacidade" className="text-accent underline font-bold hover:text-accent/80 transition-colors">
                    Política de Privacidade
                  </Link>.
                </p>
              </div>
            </div>

            {/* Ações / Botões */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAcceptEssential}
                className="flex-1 md:flex-initial h-10 px-4 rounded-[6px] text-xs font-bold border-border hover:bg-muted"
              >
                Apenas Essenciais
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="flex-1 md:flex-initial h-10 px-5 rounded-[6px] text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-1.5"
              >
                <Check className="w-4 h-4" />
                Aceitar Todos
              </Button>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
