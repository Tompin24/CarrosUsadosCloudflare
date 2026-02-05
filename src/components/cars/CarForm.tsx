import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCreateCar, useUpdateCar } from "@/hooks/useCars";
import { Car, CAR_BRANDS, FUEL_TYPES, TRANSMISSIONS, BODY_TYPES, COLORS } from "@/types/car";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { ImageUpload } from "./ImageUpload";
import { ImportListingDialog } from "./ImportListingDialog";
import { generateCarSlug } from "@/lib/slugify";

const carSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres").max(100),
  brand: z.string().min(1, "Por favor selecione uma marca"),
  model: z.string().min(1, "Por favor insira um modelo").max(50),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(1, "O preço deve ser maior que 0"),
  mileage: z.number().min(0).optional(),
  fuel_type: z.string().optional(),
  transmission: z.string().optional(),
  body_type: z.string().optional(),
  color: z.string().optional(),
  location: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  images: z.array(z.string()).optional(),
});

interface CarFormProps {
  car?: Car;
  isEditing?: boolean;
}

export const CarForm = ({ car, isEditing = false }: CarFormProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();

  const [formData, setFormData] = useState({
    title: car?.title || "",
    brand: car?.brand || "",
    model: car?.model || "",
    year: car?.year || new Date().getFullYear(),
    price: car?.price || 0,
    mileage: car?.mileage || undefined,
    fuel_type: car?.fuel_type || "",
    transmission: car?.transmission || "",
    body_type: car?.body_type || "",
    color: car?.color || "",
    location: car?.location || "",
    description: car?.description || "",
    images: car?.images || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleImportData = (importedData: {
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage?: number;
    fuel_type?: string;
    transmission?: string;
    body_type?: string;
    color?: string;
    location?: string;
    description?: string;
    images?: string[];
  }) => {
    setFormData({
      title: importedData.title || formData.title,
      brand: importedData.brand || formData.brand,
      model: importedData.model || formData.model,
      year: importedData.year || formData.year,
      price: importedData.price || formData.price,
      mileage: importedData.mileage ?? formData.mileage,
      fuel_type: importedData.fuel_type || formData.fuel_type,
      transmission: importedData.transmission || formData.transmission,
      body_type: importedData.body_type || formData.body_type,
      color: importedData.color || formData.color,
      location: importedData.location || formData.location,
      description: importedData.description || formData.description,
      images: importedData.images || formData.images,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const dataToValidate = {
      ...formData,
      mileage: formData.mileage || undefined,
      fuel_type: formData.fuel_type || undefined,
      transmission: formData.transmission || undefined,
      body_type: formData.body_type || undefined,
      color: formData.color || undefined,
      location: formData.location || undefined,
      description: formData.description || undefined,
    };

    const result = carSchema.safeParse(dataToValidate);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (isEditing && car) {
        await updateCar.mutateAsync({ id: car.id, ...dataToValidate });
        navigate(`/cars/${generateCarSlug(car.title, car.id)}`);
      } else {
        const newCar = await createCar.mutateAsync({
          ...dataToValidate,
          user_id: user!.id,
          is_sold: false,
        });
        navigate("/my-listings");
      }
    } catch (error) {
      console.error("Error saving car:", error);
    }
  };

  const isLoading = createCar.isPending || updateCar.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isEditing && (
        <div className="flex justify-end">
          <ImportListingDialog onImport={handleImportData} />
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Informação Básica</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="title">Título do Anúncio*</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="ex: BMW Série 3 2020 - Excelente Estado"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Marca*</Label>
            <Select
              value={formData.brand}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, brand: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar marca" />
              </SelectTrigger>
              <SelectContent>
                {CAR_BRANDS.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.brand && <p className="text-sm text-destructive">{errors.brand}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Modelo*</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
              placeholder="ex: Série 3"
            />
            {errors.model && <p className="text-sm text-destructive">{errors.model}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Ano*</Label>
            <Select
              value={formData.year.toString()}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, year: Number(v) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço (€)*</Label>
            <Input
              id="price"
              type="number"
              value={formData.price || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
              placeholder="25000"
            />
            {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mileage">Quilometragem (km)</Label>
            <Input
              id="mileage"
              type="number"
              value={formData.mileage || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, mileage: e.target.value ? Number(e.target.value) : undefined }))
              }
              placeholder="50000"
            />
          </div>

          <div className="space-y-2">
            <Label>Combustível</Label>
            <Select
              value={formData.fuel_type}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, fuel_type: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar combustível" />
              </SelectTrigger>
              <SelectContent>
                {FUEL_TYPES.map((fuel) => (
                  <SelectItem key={fuel} value={fuel}>
                    {fuel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transmissão</Label>
            <Select
              value={formData.transmission}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, transmission: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar transmissão" />
              </SelectTrigger>
              <SelectContent>
                {TRANSMISSIONS.map((trans) => (
                  <SelectItem key={trans} value={trans}>
                    {trans}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Carroçaria</Label>
            <Select
              value={formData.body_type}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, body_type: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {BODY_TYPES.map((body) => (
                  <SelectItem key={body} value={body}>
                    {body}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <Select
              value={formData.color}
              onValueChange={(v) => setFormData((prev) => ({ ...prev, color: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar cor" />
              </SelectTrigger>
              <SelectContent>
                {COLORS.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="ex: Lisboa, Portugal"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Fotografias</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={formData.images}
            onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
            maxImages={10}
            maxSizeKB={500}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Descrição</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Descreva o seu carro, o seu estado, características, histórico de manutenção..."
            rows={5}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancelar
        </Button>
        <Button type="submit" variant="hero" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Atualizar Anúncio" : "Criar Anúncio"}
        </Button>
      </div>
    </form>
  );
};
