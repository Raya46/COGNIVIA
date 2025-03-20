import { supabase } from "@/supabase/supabase";
import { Schedule } from "@/types/schedule.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetSchedule = (selectedDate?: string, user_id?: string) => {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", selectedDate, user_id],
    queryFn: async () => {
      let query = supabase
        .from("schedules")
        .select("*")
        .order("time", { ascending: true });

      if (selectedDate) {
        query = query.eq("date", selectedDate);
      }

      if (user_id) {
        query = query.eq("user_id", user_id);
      }

      const { data: schedules, error } = await query;
      if (error) throw error;
      return schedules;
    },
    enabled: true,
  });
  return { schedules, isLoading };
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: Schedule) => {
      const { error } = await supabase.from("schedules").insert({
        ...data,
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
