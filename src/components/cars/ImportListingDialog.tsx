import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, ExternalLink } from "lucide-react";

interface ImportedCarData {
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
}

interface ImportListingDialogProps {
  onImport: (data: ImportedCarData) => void;
}

export const ImportListingDialog = ({ onImport }: ImportListingDialogProps) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ImportedCarData | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!url.trim()) {
      toast({
        title: "URL em falta",
        description: "Por favor insira o URL do anúncio a importar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setPreviewData(null);

    try {
      const { data, error } = await supabase.functions.invoke("import-listing", {
        body: { url: url.trim() },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast({
          title: "Erro ao importar",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data.success && data.data) {
        setPreviewData(data.data);
        toast({
          title: "Dados extraídos!",
          description: "Revise os dados e clique em 'Usar Dados' para preencher o formulário.",
        });
      }
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível importar o anúncio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseData = () => {
    if (previewData) {
      onImport(previewData);
      setOpen(false);
      setUrl("");
      setPreviewData(null);
      toast({
        title: "Dados importados!",
        description: "O formulário foi preenchido com os dados do anúncio.",
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setUrl("");
    setPreviewData(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Importar Anúncio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Importar Anúncio</DialogTitle>
          <DialogDescription>
            Cole o URL de um anúncio do StandVirtual, OLX, CustoJusto ou AutoScout24 para importar os dados automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="import-url">URL do Anúncio</Label>
            <div className="flex gap-2">
              <Input
                id="import-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.standvirtual.com/carros/anuncio/..."
                disabled={loading}
              />
              <Button onClick={handleImport} disabled={loading || !url.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Importar"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sites suportados: StandVirtual, OLX, CustoJusto, AutoScout24
            </p>
          </div>

          {previewData && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <h4 className="font-semibold flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Dados Extraídos
              </h4>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Título:</span>
                  <p className="font-medium">{previewData.title || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Marca:</span>
                  <p className="font-medium">{previewData.brand || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Modelo:</span>
                  <p className="font-medium">{previewData.model || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ano:</span>
                  <p className="font-medium">{previewData.year || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Preço:</span>
                  <p className="font-medium">
                    {previewData.price
                      ? `${previewData.price.toLocaleString("pt-PT")} €`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Quilometragem:</span>
                  <p className="font-medium">
                    {previewData.mileage
                      ? `${previewData.mileage.toLocaleString("pt-PT")} km`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Combustível:</span>
                  <p className="font-medium">{previewData.fuel_type || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Transmissão:</span>
                  <p className="font-medium">{previewData.transmission || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Carroçaria:</span>
                  <p className="font-medium">{previewData.body_type || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cor:</span>
                  <p className="font-medium">{previewData.color || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Localização:</span>
                  <p className="font-medium">{previewData.location || "N/A"}</p>
                </div>
                {previewData.images && previewData.images.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Imagens:</span>
                    <p className="font-medium">{previewData.images.length} encontradas</p>
                  </div>
                )}
              </div>

              {previewData.description && (
                <div>
                  <span className="text-muted-foreground text-sm">Descrição:</span>
                  <p className="text-sm mt-1 line-clamp-3">{previewData.description}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={handleUseData} variant="hero" className="flex-1">
                  Usar Dados
                </Button>
                <Button onClick={handleClose} variant="outline">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
