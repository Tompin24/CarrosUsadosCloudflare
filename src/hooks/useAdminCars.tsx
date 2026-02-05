import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car } from "@/types/car";
import { useToast } from "@/hooks/use-toast";

export const usePendingCars = () => {
  return useQuery({
    queryKey: ["pendingCars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("is_approved", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Car[];
    },
  });
};

export const useAllCars = () => {
  return useQuery({
    queryKey: ["allCars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Car[];
    },
  });
};

export const useApproveCar = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ carId, userId }: { carId: string; userId: string }) => {
      const { data, error } = await supabase
        .from("cars")
        .update({
          is_approved: true,
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", carId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingCars"] });
      queryClient.invalidateQueries({ queryKey: ["allCars"] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast({
        title: "Aprovado!",
        description: "O anúncio foi aprovado e está agora visível ao público.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRejectCar = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (carId: string) => {
      const { error } = await supabase
        .from("cars")
        .delete()
        .eq("id", carId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingCars"] });
      queryClient.invalidateQueries({ queryKey: ["allCars"] });
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      toast({
        title: "Rejeitado",
        description: "O anúncio foi removido.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
