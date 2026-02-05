import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useCarBySlug, useDeleteCar } from "@/hooks/useCars";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SEOHead, CarJsonLd, BreadcrumbJsonLd } from "@/components/seo";
import { PageBreadcrumb } from "@/components/navigation/PageBreadcrumb";
import { StandBadge } from "@/components/stand/StandBadge";
import { Calendar, Gauge, Fuel, Settings2, MapPin, Palette, Car, Edit, Trash2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { generateCarSlug } from "@/lib/slugify";
import { supabase } from "@/integrations/supabase/client";

const BASE_URL = import.meta.env.VITE_SUPABASE_URL ? window.location.origin : "https://carrosusados.pt";

const CarDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isStand: ownerIsStand } = useUserRole();
  const { data: car, isLoading, error } = useCarBySlug(slug || "");
  const deleteCar = useDeleteCar();
  const [selectedImage, setSelectedImage] = useState(0);
  const [sellerIsStand, setSellerIsStand] = useState(false);

  // Check if seller is a stand
  useEffect(() => {
    const checkSellerRole = async () => {
      if (car?.user_id) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", car.user_id)
          .maybeSingle();
        setSellerIsStand(data?.role === "stand");
      }
    };
    checkSellerRole();
  }, [car?.user_id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number | null) => {
    if (!mileage) return "N/D";
    return new Intl.NumberFormat("pt-PT").format(mileage) + " km";
  };

  const handleDelete = async () => {
    if (car) {
      await deleteCar.mutateAsync(car.id);
      navigate("/my-listings");
    }
  };

  const isOwner = user?.id === car?.user_id;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="aspect-video bg-muted rounded-xl" />
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="h-12 bg-muted rounded" />
                <div className="h-32 bg-muted rounded" />
              </div>
              <div className="h-64 bg-muted rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !car) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Carro Não Encontrado</h1>
          <p className="text-muted-foreground mb-6">Este anúncio pode ter sido removido ou não existe.</p>
          <Link to="/carros">
            <Button variant="hero">Pesquisar Carros</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const carUrl = `${BASE_URL}/carros/anuncio/${generateCarSlug(car.title, car.id)}`;
  const carDescription = car.description || `${car.year} ${car.brand} ${car.model} with ${formatMileage(car.mileage)} for sale in ${car.location || "Portugal"}. ${car.fuel_type || ""} ${car.transmission || ""}`.trim();

  return (
    <Layout>
      <SEOHead
        title={`${car.title} - ${formatPrice(car.price)}`}
        description={carDescription}
        canonicalUrl={carUrl}
        ogType="product"
        ogImage={car.images?.[0]}
        ogImageAlt={car.title}
      />
      <CarJsonLd car={car} url={carUrl} />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", url: BASE_URL },
          { name: "Carros", url: `${BASE_URL}/carros` },
          { name: car.title, url: carUrl },
        ]}
      />
      <div className="container py-8">
        <PageBreadcrumb
          items={[
            { label: "Carros", href: "/carros" },
            { label: car.brand, href: `/carros/${encodeURIComponent(car.brand.toLowerCase())}` },
            { label: car.model, href: `/carros/${encodeURIComponent(car.brand.toLowerCase())}/${encodeURIComponent(car.model.toLowerCase())}` },
            { label: car.title.replace(`${car.brand} ${car.model}`, '').trim() || car.title },
          ]}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image gallery */}
              <div className="space-y-4">
                <div className="aspect-video overflow-hidden rounded-xl bg-muted relative">
                  {car.images && car.images.length > 0 ? (
                    <img
                      src={car.images[selectedImage]}
                      alt={car.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-muted-foreground">Sem imagens disponíveis</span>
                    </div>
                  )}
                  {car.is_sold && (
                    <Badge className="absolute top-4 left-4 bg-destructive text-lg px-4 py-2">
                      Vendido
                    </Badge>
                  )}
                  {!car.is_approved && isOwner && (
                    <Badge className="absolute top-4 right-4 bg-orange-500 text-white text-sm px-3 py-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pendente Aprovação
                    </Badge>
                  )}
                </div>
                {car.images && car.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {car.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === index ? "border-secondary" : "border-transparent"
                        }`}
                      >
                        <img src={img} alt={`${car.title} ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title and price (mobile) */}
              <div className="lg:hidden">
                <h1 className="font-display text-2xl font-bold mb-2">{car.title}</h1>
                <p className="font-display text-3xl font-bold text-secondary">{formatPrice(car.price)}</p>
              </div>

              {/* Specifications */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-xl font-semibold mb-4">Especificações</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Calendar className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ano</p>
                        <p className="font-medium">{car.year}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Gauge className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Quilometragem</p>
                        <p className="font-medium">{formatMileage(car.mileage)}</p>
                      </div>
                    </div>
                    {car.fuel_type && (
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Fuel className="h-5 w-5 text-secondary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Combustível</p>
                          <p className="font-medium">{car.fuel_type}</p>
                        </div>
                      </div>
                    )}
                    {car.transmission && (
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Settings2 className="h-5 w-5 text-secondary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Transmissão</p>
                          <p className="font-medium">{car.transmission}</p>
                        </div>
                      </div>
                    )}
                    {car.body_type && (
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Car className="h-5 w-5 text-secondary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Tipo de Carroçaria</p>
                          <p className="font-medium">{car.body_type}</p>
                        </div>
                      </div>
                    )}
                    {car.color && (
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Palette className="h-5 w-5 text-secondary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Cor</p>
                          <p className="font-medium">{car.color}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              {car.description && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-display text-xl font-semibold mb-4">Descrição</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap">{car.description}</p>
                  </CardContent>
                </Card>
              )}
            </div>

              {/* Stand Branding */}
              {sellerIsStand && (
                <StandBadge userId={car.user_id} />
              )}

              {/* Pending approval warning for owner */}
              {!car.is_approved && isOwner && (
                <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <Clock className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Pendente de Aprovação</p>
                        <p className="text-sm opacity-80">O seu anúncio está a aguardar aprovação de um administrador.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price card (desktop) */}
              <Card className="hidden lg:block sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{car.brand} {car.model}</p>
                    <h1 className="font-display text-xl font-bold">{car.title}</h1>
                  </div>
                  <p className="font-display text-3xl font-bold text-secondary">{formatPrice(car.price)}</p>
                  
                  {car.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{car.location}</span>
                    </div>
                  )}

                  {isOwner ? (
                    <div className="space-y-2 pt-4 border-t border-border">
                      <Link to={`/carros/anuncio/${generateCarSlug(car.title, car.id)}/editar`} className="block">
                        <Button variant="hero" className="w-full">
                          <Edit className="h-4 w-4" /> Editar Anúncio
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            <Trash2 className="h-4 w-4" /> Eliminar Anúncio
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar este anúncio?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O seu anúncio será permanentemente eliminado.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ) : (
                    <Button variant="hero" className="w-full">Contactar Vendedor</Button>
                  )}
                </CardContent>
              </Card>

              {/* Mobile owner actions */}
              {isOwner && (
                <div className="lg:hidden flex gap-2">
                  <Link to={`/carros/anuncio/${generateCarSlug(car.title, car.id)}/editar`} className="flex-1">
                    <Button variant="hero" className="w-full">
                      <Edit className="h-4 w-4" /> Editar
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar este anúncio?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O seu anúncio será permanentemente eliminado.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CarDetailPage;
