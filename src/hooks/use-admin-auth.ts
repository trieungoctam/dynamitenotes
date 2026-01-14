/**
 * Admin Auth Hook
 * Checks if current user is an admin
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "./use-session";

export function useAdminAuth() {
  const { data: session } = useSession();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["admin-check", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;

      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return !!data;
    },
    enabled: !!session?.user?.id,
    retry: false,
  });

  return { isAdmin, isLoading };
}
