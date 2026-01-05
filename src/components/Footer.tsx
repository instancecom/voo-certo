import { Link } from 'react-router-dom';
import { Plane, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Plane className="w-8 h-8 text-accent" />
              <span className="text-xl font-bold">Voo Certo</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm">
              Plataforma de simulados realistas para concursos. Prepare-se para decolar na sua carreira.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Simulados</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/simulados/anac" className="hover:text-accent transition-colors">ANAC</Link></li>
              <li><Link to="/simulados/oab" className="hover:text-accent transition-colors">OAB (Em breve)</Link></li>
              <li><Link to="/simulados/enem" className="hover:text-accent transition-colors">ENEM (Em breve)</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/meu-progresso" className="hover:text-accent transition-colors">Meu Progresso</Link></li>
              <li><Link to="/premium" className="hover:text-accent transition-colors">Plano Premium</Link></li>
              <li><Link to="/ajuda" className="hover:text-accent transition-colors">Central de Ajuda</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="flex gap-3 mb-4">
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="mailto:contato@voocerto.com.br" className="p-2 bg-primary-foreground/10 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-primary-foreground/70">
              contato@voocerto.com.br
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-sm text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Voo Certo. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
