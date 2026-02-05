import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CarCard } from "@/components/cars/CarCard";
import { CarFiltersPanel } from "@/components/cars/CarFiltersPanel";
import { useCars } from "@/hooks/useCars";
import { CarFilters } from "@/types/car";
import { SEOHead, BreadcrumbJsonLd } from "@/components/seo";
import { PageBreadcrumb } from "@/components/navigation/PageBreadcrumb";

const BASE_URL = import.meta.env.VITE_SUPABASE_URL ? window.location.origin : "https://carrosusados.pt";

const CarsPage = () => {
  const [searchParams] = useSearchParams();
  const { brand: routeBrand, model: routeModel } = useParams<{ brand?: string; model?: string }>();
  
  const initialFilters: CarFilters = {
    search: searchParams.get("search") || undefined,
    brand: routeBrand || searchParams.get("brand") || undefined,
    model: routeModel || undefined,
  };
  const [filters, setFilters] = useState<CarFilters>(initialFilters);
  
  // Sync filters when route params change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      brand: routeBrand || searchParams.get("brand") || undefined,
      model: routeModel || undefined,
    }));
  }, [routeBrand, routeModel, searchParams]);
  const { data: cars, isLoading } = useCars(filters);

  const pageTitle = filters.model && filters.brand
    ? `${filters.brand} ${filters.model} à Venda`
    : filters.brand 
      ? `${filters.brand} à Venda` 
      : filters.search 
        ? `Pesquisa: ${filters.search}` 
        : "Pesquisar Carros Usados";

  const pageDescription = filters.model && filters.brand
    ? `Encontre ${filters.brand} ${filters.model} usados à venda em Portugal. Compare preços e características de vendedores de confiança.`
    : filters.brand
      ? `Encontre ${filters.brand} usados à venda em Portugal. Compare preços e características de vendedores de confiança.`
      : "Pesquise milhares de carros usados à venda em Portugal. Filtre por marca, preço, ano e localização para encontrar o seu veículo perfeito.";

  const breadcrumbItems = filters.model && filters.brand
    ? [
        { label: "Carros", href: "/carros" },
        { label: filters.brand, href: `/carros/${encodeURIComponent(filters.brand.toLowerCase())}` },
        { label: filters.model },
      ]
    : filters.brand
      ? [{ label: "Carros", href: "/carros" }, { label: filters.brand }]
      : [{ label: "Carros" }];

  return (
    <Layout>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={`${BASE_URL}/carros`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", url: BASE_URL },
          { name: "Carros", url: `${BASE_URL}/carros` },
        ]}
      />
      <div className="container py-8">
        <PageBreadcrumb items={breadcrumbItems} />
        <h1 className="font-display text-3xl font-bold mb-6">Pesquisar Carros</h1>
        <div className="space-y-6">
          <CarFiltersPanel filters={filters} onFiltersChange={setFilters} />
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : cars && cars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car, i) => (
                <CarCard key={car.id} car={car} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">Nenhum carro encontrado com esses critérios.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CarsPage;
