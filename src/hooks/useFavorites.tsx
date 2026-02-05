import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFavorites = (userId?: string) => {
  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("car_id")
        .eq("user_id", userId!);

      if (error) throw error;
      return data.map(f => f.car_id);
    },
    enabled: !!userId,
  });
};

export const useFavoriteCars = (userId?: string) => {
  return useQuery({
    queryKey: ["favoriteCars", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("car_id, cars(*)")
        .eq("user_id", userId!);

      if (error) throw error;
      return data.map(f => f.cars).filter(Boolean);
    },
    enabled: !!userId,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ carId, userId, isFavorite }: { carId: string; userId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("car_id", carId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from("favorites")
          .insert({ car_id: carId, user_id: userId });
        if (error) throw error;
      }
      return !isFavorite;
    },
    onSuccess: (isNowFavorite) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteCars"] });
      toast({
        title: isNowFavorite ? "Added to favorites" : "Removed from favorites",
        description: isNowFavorite ? "This car has been saved to your wishlist." : "This car has been removed from your wishlist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
