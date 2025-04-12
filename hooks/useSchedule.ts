import { supabase } from "@/supabase/supabase";
import { Schedule } from "@/types/schedule.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export const useGetSchedule = (caregiverId?: string, userId?: string) => {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", caregiverId, userId],
    queryFn: async () => {
      let query = supabase
        .from("schedules")
        .select("*")
        .order("created_at", { ascending: false });

      if (caregiverId) {
        query = query.eq("created_by", caregiverId);
      } else if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching schedules:", error);
        throw error;
      }

      return data;
    },
    enabled: !!caregiverId || !!userId,
  });

  return { schedules, isLoading };
};

export const useGetRelatedUsers = (caregiverId: string) => {
  const { data: relatedUsers, isLoading } = useQuery({
    queryKey: ["related-users", caregiverId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          id,
          username,
          user_caregivers!inner(caregiver_id)
        `
        )
        .eq("user_caregivers.caregiver_id", caregiverId);

      if (error) {
        console.error("Error fetching related users:", error);
        throw error;
      }

      console.log("Data from Supabase:", data);

      return (
        data?.map((user) => ({
          id: user.id,
          username: user.username,
        })) || []
      );
    },
    enabled: !!caregiverId,
  });

  return { relatedUsers, isLoading };
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();

  const mutation = useMutation({
    mutationFn: async (data: Schedule) => {
      const { error } = await supabase.from("schedules").insert({
        ...data,
        created_by: userData?.id,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (error) => {
      console.error("Error creating schedule:", error);
      throw error;
    },
  });
  return { mutate: mutation.mutate, isLoading: mutation.isPending };
};
