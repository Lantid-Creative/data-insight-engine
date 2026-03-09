import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useHospitalContext() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["hms_hospital_context", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Check if user is a staff member (admin role)
      const { data, error } = await supabase
        .from("hms_staff")
        .select("hospital_id, hms_hospitals(name)")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data?.hospital_id) {
        return {
          hospital_id: data.hospital_id,
          hospital_name: (data.hms_hospitals as any)?.name ?? null,
        };
      }

      // Fallback: check if user owns a hospital
      const { data: hospital, error: hospError } = await supabase
        .from("hms_hospitals")
        .select("id, name")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (hospError && hospError.code !== "PGRST116") throw hospError;

      if (hospital) {
        return { hospital_id: hospital.id, hospital_name: hospital.name };
      }

      return null;
    },
    enabled: !!user,
  });
}
