import { Layout } from "@/components/layout/Layout";
import { CarCard } from "@/components/cars/CarCard";
import { useFavoriteCars } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Car } from "@/types/car";
import { PageBreadcrumb } from "@/components/navigation/PageBreadcrumb";

const FavoritesPage = () => {
  const { user, loading } = useAuth();
  const { data: cars, isLoading } = useFavoriteCars(user?.id);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container py-8">
        <PageBreadcrumb items={[{ label: "Favoritos" }]} />
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <h1 className="font-display text-3xl font-bold">Os Meus Favoritos</h1>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : cars && cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(cars as Car[]).map((car, i) => (
              <CarCard key={car.id} car={car} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg mb-4">Ainda não guardou nenhum carro.</p>
            <Link to="/cars">
              <Button variant="hero">Pesquisar Carros</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;
