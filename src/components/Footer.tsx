import { Link } from 'react-router-dom';
import { Plane, Instagram, Linkedin, Youtube, Mail, ShieldCheck } from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';

export function Footer() {
  const { settings: branding } = useBranding();

  const getDriveImageUrl = (url: string | null): string | null => {
    if (!url) return null;
    if (url.includes('lh3.googleusercontent.com')) return url;
    const ucMatch = url.match(/drive\.google\.com\/uc\?export=view&id=([^&]+)/);
    if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
    return url;
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              {branding.logo_url ? (
                <img 
                  src={getDriveImageUrl(branding.logo_url) || ''} 
                  alt={branding.site_name} 
                  className="h-10 w-auto object-contain" 
                />
              ) : (
                <>
                  <Plane className="w-8 h-8 text-accent" />
                  <span className="text-2xl font-bold tracking-tight">{branding.site_name}</span>
                </>
              )}
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Plataforma de simulados baseados em padrões reais do mercado aeronáutico. Prepare-se para decolar na sua carreira com inteligência e estratégia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Simulados</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link to="/simulados/anac" className="hover:text-accent transition-colors">Padrão ANAC</Link></li>
              <li><Link to="/simulados/oab" className="hover:text-accent transition-colors opacity-50 cursor-not-allowed">OAB (Em breve)</Link></li>
              <li><Link to="/simulados/enem" className="hover:text-accent transition-colors opacity-50 cursor-not-allowed">ENEM (Em breve)</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Recursos</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link to="/meu-progresso" className="hover:text-accent transition-colors">Painel de Performance</Link></li>
              <li><Link to="/premium" className="hover:text-accent transition-colors">Assinatura Premium</Link></li>
              <li><Link to="/ajuda" className="hover:text-accent transition-colors">Central de Ajuda</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Conecte-se</h4>
            <div className="flex justify-center md:justify-start gap-2 mb-6">
              <a href="#" className="p-2.5 bg-primary-foreground/10 rounded-[5px] hover:bg-accent hover:text-accent-foreground transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2.5 bg-primary-foreground/10 rounded-[5px] hover:bg-accent hover:text-accent-foreground transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="p-2.5 bg-primary-foreground/10 rounded-[5px] hover:bg-accent hover:text-accent-foreground transition-all">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="mailto:contato@voecerto.com.br" className="p-2.5 bg-primary-foreground/10 rounded-[5px] hover:bg-accent hover:text-accent-foreground transition-all">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-primary-foreground/50">
               <ShieldCheck className="w-4 h-4" />
               <span>Pagamento 100% Seguro</span>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] md:text-xs text-primary-foreground/40 max-w-2xl text-center md:text-left leading-normal italic">
              <strong>Aviso Legal:</strong> O Voe Certo é uma plataforma independente de estudos. Nossos simulados são baseados em padrões históricos e padrões de avaliação da Agência Nacional de Aviação Civil (ANAC), mas não possuímos qualquer vínculo oficial com o órgão regulador.
            </p>
            <div className="text-[10px] md:text-xs text-primary-foreground/40 whitespace-nowrap">
              &copy; {new Date().getFullYear()} {branding.site_name}. CNPJ: 00.000.000/0001-00
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
