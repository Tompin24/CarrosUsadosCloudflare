import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface FavoriteButtonProps {
  carId: string;
  size?: "sm" | "default";
  className?: string;
}

export const FavoriteButton = ({ carId, size = "default", className }: FavoriteButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: favorites = [] } = useFavorites(user?.id);
  const toggleFavorite = useToggleFavorite();

  const isFavorite = favorites.includes(carId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/auth");
      return;
    }

    toggleFavorite.mutate({
      carId,
      userId: user.id,
      isFavorite,
    });
  };

  return (
    <Button
      variant="ghost"
      size={size === "sm" ? "icon" : "default"}
      onClick={handleClick}
      disabled={toggleFavorite.isPending}
      className={cn(
        "transition-all",
        size === "sm" && "h-8 w-8",
        isFavorite && "text-red-500 hover:text-red-600",
        className
      )}
    >
      <Heart
        className={cn(
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          isFavorite && "fill-current"
        )}
      />
      {size !== "sm" && (
        <span className="ml-2">{isFavorite ? "Saved" : "Save"}</span>
      )}
    </Button>
  );
};
