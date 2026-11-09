import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';
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
    <footer className="w-full bg-slate-50/80 dark:bg-[#071328] border-t border-slate-200/70 dark:border-slate-800/80 text-foreground transition-colors">
      {/* ── PARTE SUPERIOR (CONTEÚDO PRINCIPAL EM 3 COLUNAS) ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 md:gap-6 lg:gap-12 max-w-5xl mx-auto">
          
          {/* 1. COLUNA ESQUERDA: LOGO + SLOGAN */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group select-none">
              {branding.logo_url ? (
                <img
                  src={getDriveImageUrl(branding.logo_url) || ''}
                  alt={branding.site_name}
                  className="h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-105"
                />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-[10px] bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Plane className="w-6 h-6 -rotate-45" />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-[#071328] dark:text-white">
                    {branding.site_name}
                  </span>
                </>
              )}
            </Link>

            <p className="text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-xs">
              Seu futuro na aviação começa com a orientação certa.
            </p>
          </div>

          {/* DIVISOR VERTICAL 1 (DESKTOP) */}
          <div className="hidden md:block w-px h-28 bg-slate-200 dark:bg-slate-800 self-center" />

          {/* DIVISOR HORIZONTAL (MOBILE) */}
          <div className="w-full h-px bg-slate-200/70 dark:bg-slate-800 md:hidden" />

          {/* 2. COLUNA CENTRAL: LINKS ÚTEIS */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left md:pl-4 lg:pl-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 sm:mb-5">
              LINKS ÚTEIS
            </h4>

            <ul className="space-y-2.5 sm:space-y-3 text-sm font-semibold text-[#071328] dark:text-slate-200">
              <li>
                <Link
                  to="/guia-carreira"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Guias de Carreira
                </Link>
              </li>
              <li>
                <a
                  href="/#planos"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Planos de Assinatura
                </a>
              </li>
              <li>
                <a
                  href="/#faq"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Perguntas Frequentes
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@voecerto.com.br"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Fale Conosco
                </a>
              </li>
            </ul>
          </div>

          {/* DIVISOR VERTICAL 2 (DESKTOP) */}
          <div className="hidden md:block w-px h-28 bg-slate-200 dark:bg-slate-800 self-center" />

          {/* DIVISOR HORIZONTAL (MOBILE) */}
          <div className="w-full h-px bg-slate-200/70 dark:bg-slate-800 md:hidden" />

          {/* 3. COLUNA DIREITA: REDES SOCIAIS (NOS SIGA) */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left md:pl-4 lg:pl-8">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 sm:mb-5">
              NOS SIGA
            </h4>

            {/* Ícones redondos com cores oficiais */}
            <div className="flex items-center gap-3">
              {/* YouTube */}
              <a
                href="https://youtube.com/@voecerto"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Canal do YouTube do Voe Certo"
                className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center shadow-sm hover:scale-110 hover:shadow-md transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com/@voecerto"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Perfil do TikTok do Voe Certo"
                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-sm hover:scale-110 hover:shadow-md transition-all cursor-pointer"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.76 1.48-.03 2.77-.99 3.16-2.42.17-.58.2-1.19.19-1.79V.02h-.03z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/voecerto"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Perfil do Instagram do Voe Certo"
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-sm hover:scale-110 hover:shadow-md transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ── SUB-RODAPÉ (FAIXA AZUL ESCURA INFERIOR) ── */}
      <div className="w-full bg-[#0c2340] dark:bg-[#071528] py-5 px-4 text-center">
        <p className="text-xs sm:text-sm text-white/90 font-normal tracking-wide">
          &copy; 2026 Voe Certo by Instance. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
