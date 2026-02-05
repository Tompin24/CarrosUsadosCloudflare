import { useParams, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CarForm } from "@/components/cars/CarForm";
import { useCarBySlug } from "@/hooks/useCars";
import { useAuth } from "@/hooks/useAuth";
import { generateCarSlug } from "@/lib/slugify";
import { PageBreadcrumb } from "@/components/navigation/PageBreadcrumb";

const EditCarPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: car, isLoading, error } = useCarBySlug(slug || "");

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-3xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-48 bg-muted rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  
  if (error || !car) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Carro Não Encontrado</h1>
          <p className="text-muted-foreground">Este anúncio pode ter sido removido ou não existe.</p>
        </div>
      </Layout>
    );
  }

  // Only owner can edit
  if (car.user_id !== user.id) {
    return <Navigate to={`/carros/anuncio/${generateCarSlug(car.title, car.id)}`} replace />;
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <PageBreadcrumb
          items={[
            { label: "Carros", href: "/carros" },
            { label: car.title, href: `/carros/anuncio/${generateCarSlug(car.title, car.id)}` },
            { label: "Editar" },
          ]}
        />
        <h1 className="font-display text-3xl font-bold mb-8">Editar Anúncio</h1>
        <CarForm car={car} isEditing />
      </div>
    </Layout>
  );
};

export default EditCarPage;
