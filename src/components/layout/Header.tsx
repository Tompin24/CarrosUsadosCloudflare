import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Car, LogIn, LogOut, Plus, User, Menu, X, Heart, Shield } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { role, canCreateListings, isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-1 font-display font-bold text-xl">
          <Car className="h-7 w-7 text-secondary" />
          <span className="text-primary">Carros</span>
          <span className="text-secondary">Usados</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/carros"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Pesquisar Carros
          </Link>
          {user && (
            <>
              {canCreateListings && (
                <Link
                  to="/my-listings"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Os Meus Anúncios
                </Link>
              )}
              <Link
                to="/favorites"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Heart className="h-4 w-4 inline mr-1" />
                Favoritos
              </Link>
              {canCreateListings && (
                <Link to="/carros/novo">
                  <Button variant="secondary" size="sm">
                    <Plus className="h-4 w-4" />
                    Vender Carro
                  </Button>
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Shield className="h-4 w-4 inline mr-1" />
                  Administração
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  Perfil
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm">
                <LogIn className="h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-card"
          >
            <nav className="container py-4 flex flex-col gap-3">
              <Link to="/carros" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Pesquisar Carros
              </Link>
              {user ? (
                <>
                  {canCreateListings && (
                    <Link
                      to="/my-listings"
                      className="text-sm font-medium py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Os Meus Anúncios
                    </Link>
                  )}
                  <Link
                    to="/favorites"
                    className="text-sm font-medium py-2 flex items-center gap-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4" />
                    Favoritos
                  </Link>
                  {canCreateListings && (
                    <Link to="/carros/novo" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        <Plus className="h-4 w-4" />
                        Vender Carro
                      </Button>
                    </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="text-sm font-medium py-2 flex items-center gap-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4" />
                        Administração
                      </Link>
                    )}
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      <User className="h-4 w-4" />
                      Perfil
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full">
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Button>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
