import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeKB?: number;
}

export const ImageUpload = ({
  images,
  onImagesChange,
  maxImages = 10,
  maxSizeKB = 500,
}: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${remainingSlots} more image(s).`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const newImageUrls: string[] = [];

    for (const file of files) {
      // Check file size (500KB = 512000 bytes)
      if (file.size > maxSizeKB * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${maxSizeKB}KB limit.`,
          variant: "destructive",
        });
        continue;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image.`,
          variant: "destructive",
        });
        continue;
      }

      try {
        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `cars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("car-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("car-images")
          .getPublicUrl(filePath);

        newImageUrls.push(urlData.publicUrl);
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}.`,
          variant: "destructive",
        });
      }
    }

    if (newImageUrls.length > 0) {
      onImagesChange([...images, ...newImageUrls]);
      toast({
        title: "Images uploaded",
        description: `${newImageUrls.length} image(s) uploaded successfully.`,
      });
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Photos ({images.length}/{maxImages})
        </label>
        <span className="text-xs text-muted-foreground">Max {maxSizeKB}KB per image</span>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img src={url} alt={`Car ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-secondary transition-colors"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload photos
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to {maxSizeKB}KB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
