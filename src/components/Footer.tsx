import { Twitter, Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import zapyerLogo from "../assets/zapyer-hub-logo.png";

const Footer = () => {
  return (
    <footer className="w-full py-8 mt-0">
      <div className="container px-4">
        <div className="glass glass-hover rounded-xl p-8">
          {/* Branding / Social */}
          <div className="space-y-4 mb-8">
            <img src={zapyerLogo} alt="Zapyer Hub" className="h-8 w-auto mx-auto md:mx-0" />
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Seu WhatsApp muito mais Smart!
            </p>
            <div className="flex space-x-2 justify-center md:justify-start">
              <a href="https://x.com/MZapyer34353" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" aria-label="X">
                  <Twitter className="w-4 h-4" />
                </Button>
              </a>
              <a href="https://www.instagram.com/zapyerhub/" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </Button>
              </a>
              <a href="https://www.facebook.com/profile.php?id=61564629352529" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </Button>
              </a>
              <a href="https://www.youtube.com/@zapyerhub" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" aria-label="YouTube">
                  <Youtube className="w-4 h-4" />
                </Button>
              </a>
              <a href="http://wa.me/5587996316081" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" aria-label="WhatsApp">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                </Button>
              </a>
            </div>
          </div>

          {/* Links - 3 columns on mobile */}
          <div className="grid grid-cols-3 gap-6 md:grid-cols-3 md:gap-8">
            <div className="space-y-4 text-center md:text-left">
              <h4 className="font-medium">Sobre nós</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Preços
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <h4 className="font-medium">Atalhos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#/noticias" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Últimas Notícias
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Trajetória
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4 text-center md:text-left">
              <h4 className="font-medium">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Termos de Serviço
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Zapyer Hub 💚. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;