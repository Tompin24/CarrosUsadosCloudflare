import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { usePendingCars, useAllCars, useApproveCar, useRejectCar } from "@/hooks/useAdminCars";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBreadcrumb } from "@/components/navigation/PageBreadcrumb";
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
import { Check, X, Clock, Car, Users, Shield, Loader2, ExternalLink } from "lucide-react";
import { generateCarSlug } from "@/lib/slugify";

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { data: pendingCars, isLoading: pendingLoading } = usePendingCars();
  const { data: allCars, isLoading: allLoading } = useAllCars();
  const approveMutation = useApproveCar();
  const rejectMutation = useRejectCar();

  if (authLoading || roleLoading) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const approvedCars = allCars?.filter(c => c.is_approved) || [];
  const soldCars = allCars?.filter(c => c.is_sold) || [];

  const handleApprove = (carId: string) => {
    approveMutation.mutate({ carId, userId: user.id });
  };

  const handleReject = (carId: string) => {
    rejectMutation.mutate(carId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Layout>
      <div className="container py-8">
        <PageBreadcrumb items={[{ label: "Administração" }]} />
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-destructive" />
          <h1 className="font-display text-3xl font-bold">Painel de Administração</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCars?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedCars.length}</p>
                  <p className="text-sm text-muted-foreground">Aprovados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Car className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allCars?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{soldCars.length}</p>
                  <p className="text-sm text-muted-foreground">Vendidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pendentes ({pendingCars?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              <Car className="h-4 w-4" />
              Todos os Anúncios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Anúncios Pendentes de Aprovação</CardTitle>
                <CardDescription>
                  Reveja e aprove os anúncios antes de serem visíveis ao público
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : pendingCars && pendingCars.length > 0 ? (
                  <div className="space-y-4">
                    {pendingCars.map((car) => (
                      <div
                        key={car.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {car.images && car.images[0] ? (
                          <img
                            src={car.images[0]}
                            alt={car.title}
                            className="w-24 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-24 h-16 bg-muted rounded-md flex items-center justify-center">
                            <Car className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{car.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {car.brand} {car.model} • {car.year} • {car.mileage?.toLocaleString()} km
                          </p>
                          <p className="text-sm font-medium text-primary">
                            {formatPrice(car.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`/carros/anuncio/${generateCarSlug(car.title, car.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(car.id)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <X className="h-4 w-4 mr-1" />
                                Rejeitar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Rejeitar anúncio?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação irá eliminar permanentemente o anúncio "{car.title}".
                                  Esta ação não pode ser revertida.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleReject(car.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Rejeitar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Check className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>Não há anúncios pendentes de aprovação.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Todos os Anúncios</CardTitle>
                <CardDescription>Lista completa de todos os anúncios na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                {allLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : allCars && allCars.length > 0 ? (
                  <div className="space-y-4">
                    {allCars.map((car) => (
                      <div
                        key={car.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {car.images && car.images[0] ? (
                          <img
                            src={car.images[0]}
                            alt={car.title}
                            className="w-24 h-16 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-24 h-16 bg-muted rounded-md flex items-center justify-center">
                            <Car className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">{car.title}</h3>
                            {car.is_approved ? (
                              <Badge variant="default" className="bg-green-600">Aprovado</Badge>
                            ) : (
                              <Badge variant="secondary">Pendente</Badge>
                            )}
                            {car.is_sold && (
                              <Badge variant="outline">Vendido</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {car.brand} {car.model} • {car.year} • {car.mileage?.toLocaleString()} km
                          </p>
                          <p className="text-sm font-medium text-primary">
                            {formatPrice(car.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`/carros/anuncio/${generateCarSlug(car.title, car.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                          {!car.is_approved && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(car.id)}
                              disabled={approveMutation.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-4" />
                    <p>Não há anúncios na plataforma.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPage;
