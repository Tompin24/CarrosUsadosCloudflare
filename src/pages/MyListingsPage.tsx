import { Layout } from "@/components/layout/Layout";
import { CarCard } from "@/components/cars/CarCard";
import { useUserCars } from "@/hooks/useCars";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Check } from "lucide-react";
import { PageBreadcrumb } from "@/components/navigation/PageBreadcrumb";

const MyListingsPage = () => {
  const { user, loading } = useAuth();
  const { data: cars, isLoading } = useUserCars(user?.id);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container py-8">
        <PageBreadcrumb items={[{ label: "Anúncios" }]} />
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold">Os meus anúncios</h1>
          <Link to="/carros/novo">
            <Button variant="hero">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </Link>
        </div>

        {/* Stats */}
        {cars && cars.length > 0 && (
          <div className="flex gap-4 mb-6">
            <Badge variant="secondary" className="text-sm py-1 px-3 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {cars.filter((c) => !c.is_approved).length} pendentes
            </Badge>
            <Badge variant="default" className="text-sm py-1 px-3 bg-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              {cars.filter((c) => c.is_approved).length} aprovados
            </Badge>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : cars && cars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car, i) => (
              <CarCard key={car.id} car={car} index={i} showApprovalStatus />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-4">Ainda não tem carros anunciados.</p>
            <Link to="/carros/novo">
              <Button variant="hero">Vender o Seu Primeiro Carro</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyListingsPage;
