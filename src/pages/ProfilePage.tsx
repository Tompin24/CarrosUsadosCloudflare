import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Store, Building2, User } from "lucide-react";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { PageBreadcrumb } from "@/components/navigation/PageBreadcrumb";
import { StandBrandingForm } from "@/components/stand/StandBrandingForm";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
}

const getRoleBadge = (role: string | null) => {
  switch (role) {
    case "admin":
      return { label: "Admin", icon: Shield, variant: "destructive" as const };
    case "stand":
      return { label: "Stand", icon: Building2, variant: "default" as const };
    case "vendor":
      return { label: "Vendor", icon: Store, variant: "secondary" as const };
    default:
      return null;
  }
};

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, isStand } = useUserRole();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    avatar_url: "",
  });

  const roleBadge = getRoleBadge(role);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user!.id,
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "O seu perfil foi guardado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <PageBreadcrumb items={[{ label: "Perfil" }]} />
        <h1 className="font-display text-3xl font-bold mb-8">O Meu Perfil</h1>

        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-20 w-20 bg-muted rounded-full" />
                <div className="h-10 bg-muted rounded" />
                <div className="h-10 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ) : isStand ? (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                Perfil Pessoal
              </TabsTrigger>
              <TabsTrigger value="branding" className="gap-2">
                <Building2 className="h-4 w-4" />
                Branding do Stand
              </TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Tipo de Conta</CardTitle>
                <CardDescription>O seu tipo de conta e permissões</CardDescription>
              </CardHeader>
              <CardContent>
                {roleLoading ? (
                  <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                ) : roleBadge ? (
                  <div className="flex items-center gap-3">
                    <Badge variant={roleBadge.variant} className="text-sm py-1 px-3">
                      <roleBadge.icon className="h-4 w-4 mr-1" />
                      {roleBadge.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {role === "admin" && "Acesso total para gerir a plataforma"}
                      {role === "stand" && "Criar, gerir e eliminar anúncios"}
                      {role === "vendor" && "Criar e atualizar anúncios"}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sem função de vendedor atribuída. Contacte um administrador para se tornar vendedor ou stand.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display">Informações do Perfil</CardTitle>
              </CardHeader>
            <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <AvatarUpload
                  userId={user.id}
                  currentAvatarUrl={formData.avatar_url}
                  fallbackText={formData.full_name}
                  onAvatarChange={(url) => setFormData((prev) => ({ ...prev, avatar_url: url }))}
                />

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                    placeholder="João Silva"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+351 912 345 678"
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" variant="hero" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar Alterações
              </Button>
            </div>
          </form>
            </TabsContent>
            <TabsContent value="branding">
              <StandBrandingForm />
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Tipo de Conta</CardTitle>
                <CardDescription>O seu tipo de conta e permissões</CardDescription>
              </CardHeader>
              <CardContent>
                {roleLoading ? (
                  <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                ) : roleBadge ? (
                  <div className="flex items-center gap-3">
                    <Badge variant={roleBadge.variant} className="text-sm py-1 px-3">
                      <roleBadge.icon className="h-4 w-4 mr-1" />
                      {roleBadge.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {role === "admin" && "Acesso total para gerir a plataforma"}
                      {role === "stand" && "Criar, gerir e eliminar anúncios"}
                      {role === "vendor" && "Criar e atualizar anúncios"}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sem função de vendedor atribuída. Contacte um administrador para se tornar vendedor ou stand.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display">Informações do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <AvatarUpload
                  userId={user.id}
                  currentAvatarUrl={formData.avatar_url}
                  fallbackText={formData.full_name}
                  onAvatarChange={(url) => setFormData((prev) => ({ ...prev, avatar_url: url }))}
                />

                <div className="space-y-2">
                  <Label htmlFor="full_name2">Nome Completo</Label>
                  <Input
                    id="full_name2"
                    value={formData.full_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                    placeholder="João Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone2">Número de Telefone</Label>
                  <Input
                    id="phone2"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+351 912 345 678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email2">Email</Label>
                  <Input
                    id="email2"
                    value={user.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" variant="hero" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar Alterações
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
