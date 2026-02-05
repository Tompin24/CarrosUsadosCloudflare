import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "vendor" | "stand" | null;

interface UseUserRoleReturn {
  role: AppRole;
  loading: boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isStand: boolean;
  canCreateListings: boolean;
  canManageListings: boolean;
  canDeleteListings: boolean;
  refetch: () => Promise<void>;
}

export const useUserRole = (): UseUserRoleReturn => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async () => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } else {
        setRole(data?.role as AppRole || null);
      }
    } catch (err) {
      console.error("Error fetching user role:", err);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [user?.id]);

  const isAdmin = role === "admin";
  const isVendor = role === "vendor";
  const isStand = role === "stand";

  // Permission helpers based on role hierarchy
  const canCreateListings = isAdmin || isVendor || isStand;
  const canManageListings = isAdmin || isStand; // "manage" = broader control
  const canDeleteListings = isAdmin || isStand;

  return {
    role,
    loading,
    isAdmin,
    isVendor,
    isStand,
    canCreateListings,
    canManageListings,
    canDeleteListings,
    refetch: fetchRole,
  };
};
