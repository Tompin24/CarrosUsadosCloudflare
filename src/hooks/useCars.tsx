import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car, CarFilters } from "@/types/car";
import { useToast } from "@/hooks/use-toast";

export const useCars = (filters?: CarFilters) => {
  return useQuery({
    queryKey: ["cars", filters],
    queryFn: async () => {
      let query = supabase
        .from("cars")
        .select("*")
        .eq("is_sold", false)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (filters?.brand) {
        query = query.ilike("brand", filters.brand);
      }
      if (filters?.model) {
        query = query.ilike("model", filters.model);
      }
      if (filters?.minPrice) {
        query = query.gte("price", filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte("price", filters.maxPrice);
      }
      if (filters?.minYear) {
        query = query.gte("year", filters.minYear);
      }
      if (filters?.maxYear) {
        query = query.lte("year", filters.maxYear);
      }
      if (filters?.fuelType) {
        query = query.eq("fuel_type", filters.fuelType);
      }
      if (filters?.transmission) {
        query = query.eq("transmission", filters.transmission);
      }
      if (filters?.bodyType) {
        query = query.eq("body_type", filters.bodyType);
      }
      if (filters?.color) {
        query = query.eq("color", filters.color);
      }
      if (filters?.minMileage) {
        query = query.gte("mileage", filters.minMileage);
      }
      if (filters?.maxMileage) {
        query = query.lte("mileage", filters.maxMileage);
      }
      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Car[];
    },
  });
};

export const useCarById = (id: string) => {
  return useQuery({
    queryKey: ["car", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Car | null;
    },
    enabled: !!id,
  });
};

export const useCarBySlug = (slug: string) => {
  // Extract the last 4 characters which is the short ID (last 4 chars of UUID)
  const shortId = slug.slice(-4);
  
  return useQuery({
    queryKey: ["car", "slug", slug],
    queryFn: async () => {
      // UUID columns can't use ilike, so we fetch cars and filter
      // We use a text search on id by casting it - using filter with textSearch
      const { data, error } = await supabase
        .from("cars")
        .select("*");

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Find cars where the ID ends with the short ID
        const matchingCars = data.filter(car => car.id.endsWith(shortId));
        
        if (matchingCars.length > 0) {
          const { generateCarSlug } = await import("@/lib/slugify");
          // Find the exact match by comparing full slugs
          const matchedCar = matchingCars.find(car => generateCarSlug(car.title, car.id) === slug);
          return matchedCar || matchingCars[0];
        }
      }
      
      return null;
    },
    enabled: !!slug && slug.length >= 4,
  });
};

export const useUserCars = (userId?: string) => {
  return useQuery({
    queryKey: ["userCars", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Car[];
    },
    enabled: !!userId,
  });
};

export const useCreateCar = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (car: Omit<Car, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("cars")
        .insert(car)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["userCars"] });
      toast({
        title: "Success!",
        description: "Your car listing has been created.",
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

export const useUpdateCar = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Car> & { id: string }) => {
      const { data, error } = await supabase
        .from("cars")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["car", data.id] });
      queryClient.invalidateQueries({ queryKey: ["userCars"] });
      toast({
        title: "Success!",
        description: "Your car listing has been updated.",
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

export const useDeleteCar = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cars").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["userCars"] });
      toast({
        title: "Deleted",
        description: "Your car listing has been removed.",
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
