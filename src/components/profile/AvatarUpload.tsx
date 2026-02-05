import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, User, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string;
  fallbackText?: string;
  onAvatarChange: (url: string) => void;
  maxSizeKB?: number;
}

export const AvatarUpload = ({
  userId,
  currentAvatarUrl,
  fallbackText,
  onAvatarChange,
  maxSizeKB = 500,
}: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSizeKB * 1024) {
      toast({
        title: "File too large",
        description: `Image must be under ${maxSizeKB}KB.`,
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `avatar.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Delete existing avatar if any
      await supabase.storage.from("avatars").remove([filePath]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL with cache buster
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      onAvatarChange(newUrl);

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been uploaded.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;

    setIsUploading(true);
    try {
      // Extract file path from URL
      const urlParts = currentAvatarUrl.split("/avatars/");
      if (urlParts[1]) {
        const filePath = urlParts[1].split("?")[0];
        await supabase.storage.from("avatars").remove([filePath]);
      }

      onAvatarChange("");
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error: any) {
      console.error("Remove error:", error);
      toast({
        title: "Remove failed",
        description: error.message || "Failed to remove avatar.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage src={currentAvatarUrl} />
          <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
            {fallbackText?.charAt(0)?.toUpperCase() || <User className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>
        {currentAvatarUrl && !isUploading && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="absolute -top-1 -right-1 p-1 bg-background border border-border rounded-full hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          PNG, JPG up to {maxSizeKB}KB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
