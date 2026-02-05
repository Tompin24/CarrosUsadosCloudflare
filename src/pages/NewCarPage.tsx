import { Layout } from "@/components/layout/Layout";
import { CarForm } from "@/components/cars/CarForm";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { PageBreadcrumb } from "@/components/navigation/PageBreadcrumb";

const NewCarPage = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <PageBreadcrumb
          items={[
            { label: "Carros", href: "/cars" },
            { label: "Vender o Seu Carro" },
          ]}
        />
        <h1 className="font-display text-3xl font-bold mb-6">Vender o Seu Carro</h1>
        <CarForm />
      </div>
    </Layout>
  );
};

export default NewCarPage;
