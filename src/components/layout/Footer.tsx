import { Car } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2 font-display font-bold text-xl"
            >
              <Car className="h-6 w-6 text-secondary" />
              <span className="text-primary">Carros</span>
              <span className="text-secondary">Usados</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              O marketplace dos carros usados em Portugal!
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/carros"
                  className="hover:text-foreground transition-colors"
                >
                  Pesquisar Carros
                </Link>
              </li>
              <li>
                <Link
                  to="/carros/novo"
                  className="hover:text-foreground transition-colors"
                >
                  Vender o Seu Carro
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="hover:text-foreground transition-colors"
                >
                  Entrar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">
              Marcas Populares
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/carros?brand=BMW"
                  className="hover:text-foreground transition-colors"
                >
                  BMW
                </Link>
              </li>
              <li>
                <Link
                  to="/carros?brand=Mercedes-Benz"
                  className="hover:text-foreground transition-colors"
                >
                  Mercedes-Benz
                </Link>
              </li>
              <li>
                <Link
                  to="/carros?brand=Audi"
                  className="hover:text-foreground transition-colors"
                >
                  Audi
                </Link>
              </li>
              <li>
                <Link
                  to="/carros?brand=Volkswagen"
                  className="hover:text-foreground transition-colors"
                >
                  Volkswagen
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Suporte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Centro de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contacte-nos
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Termos de Serviço
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Carros Usados. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
