import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StandProfile } from "@/types/car";
import { useToast } from "@/hooks/use-toast";

export const useStandProfile = (userId?: string) => {
  return useQuery({
    queryKey: ["standProfile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stand_profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();

      if (error) throw error;
      return data as StandProfile | null;
    },
    enabled: !!userId,
  });
};

export const useUpsertStandProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (profile: Partial<StandProfile> & { user_id: string; business_name: string }) => {
      const { data, error } = await supabase
        .from("stand_profiles")
        .upsert({
          user_id: profile.user_id,
          business_name: profile.business_name,
          logo_url: profile.logo_url,
          description: profile.description,
          primary_color: profile.primary_color,
          secondary_color: profile.secondary_color,
          phone: profile.phone,
          email: profile.email,
          website: profile.website,
          address: profile.address,
          city: profile.city,
        })
        .select()
        .single();

      if (error) throw error;
      return data as StandProfile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["standProfile", data.user_id] });
      toast({
        title: "Perfil atualizado",
        description: "O branding do seu stand foi guardado com sucesso.",
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
