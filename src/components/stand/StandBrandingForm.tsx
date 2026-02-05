import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStandProfile, useUpsertStandProfile } from "@/hooks/useStandProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Building2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const StandBrandingForm = () => {
  const { user } = useAuth();
  const { data: standProfile, isLoading } = useStandProfile(user?.id);
  const upsertMutation = useUpsertStandProfile();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    business_name: "",
    logo_url: "",
    description: "",
    primary_color: "#3b82f6",
    secondary_color: "#1e40af",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    if (standProfile) {
      setFormData({
        business_name: standProfile.business_name || "",
        logo_url: standProfile.logo_url || "",
        description: standProfile.description || "",
        primary_color: standProfile.primary_color || "#3b82f6",
        secondary_color: standProfile.secondary_color || "#1e40af",
        phone: standProfile.phone || "",
        email: standProfile.email || "",
        website: standProfile.website || "",
        address: standProfile.address || "",
        city: standProfile.city || "",
      });
    }
  }, [standProfile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, logo_url: urlData.publicUrl }));
      toast({
        title: "Logo carregado",
        description: "O logo foi carregado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.business_name.trim()) {
      toast({
        title: "Erro",
        description: "O nome comercial é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    upsertMutation.mutate({
      user_id: user.id,
      ...formData,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Branding do Stand
          </CardTitle>
          <CardDescription>
            Configure a identidade visual do seu stand que aparecerá nos seus anúncios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <Label>Logo do Stand</Label>
            <div className="flex items-center gap-4">
              {formData.logo_url ? (
                <img
                  src={formData.logo_url}
                  alt="Logo"
                  className="w-20 h-20 object-contain rounded-lg border bg-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg border bg-muted flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                  id="logo-upload"
                />
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" disabled={uploading} asChild>
                    <span>
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Carregar Logo
                    </span>
                  </Button>
                </Label>
              </div>
            </div>
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business_name">Nome Comercial *</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, business_name: e.target.value }))}
              placeholder="Auto Stand Silva"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Especialistas em carros usados desde 1995..."
              rows={3}
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Cor Principal</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  id="primary_color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, primary_color: e.target.value }))}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary_color">Cor Secundária</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  id="secondary_color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, secondary_color: e.target.value }))}
                  placeholder="#1e40af"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Contactos</CardTitle>
          <CardDescription>
            Informações de contacto que serão exibidas nos seus anúncios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+351 912 345 678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="info@autostand.pt"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
              placeholder="https://www.autostand.pt"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Morada</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Rua Principal, 123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Lisboa"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" variant="hero" disabled={upsertMutation.isPending}>
          {upsertMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Guardar Branding
        </Button>
      </div>
    </form>
  );
};
