import { supabase } from "@/supabase/supabase";
import { SafeZone, User } from "@/types/user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

export const useLogin = () => {
  const mutation = useMutation({
    mutationFn: async (data: User) => {
      console.log("data from uselogin", data);
      const { data: authData, error } = await supabase.auth.signInWithPassword(
        data
      );
      if (error) throw error;

      if (authData.session) {
        await AsyncStorage.setItem(
          "token",
          authData.session.access_token as string
        );
      }
    },
    onSuccess: () => {
      router.replace("/home");
    },
    onError: (error) => {
      console.error("Login error:", error.message);
    },
  });
  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
  };
};

export const useLogout = () =>
  useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem("token");
    },
    onSuccess: () => {
      router.replace("/");
    },
    onError: (error) => {
      console.error("Logout error:", error);
    },
  });

export const useRegister = () => {
  const mutation = useMutation({
    mutationFn: async (data: User) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            role: data.role,
          },
        },
      });

      if (error) {
        console.error("Registration error:", error);
        throw error;
      }

      if (!authData.user) {
        throw new Error("Gagal mendaftarkan pengguna");
      }

      console.log("Auth data after signup:", authData);

      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: data.email,
        username: data.username,
        password: data.password,
        role: data.role,
      });

      if (insertError) {
        console.error("Error inserting user data:", insertError);
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw insertError;
      }

      if (authData.session) {
        await AsyncStorage.setItem(
          "token",
          authData.session.access_token as string
        );
        await AsyncStorage.setItem(
          "role",
          authData.session.user.role as string
        );
      }

      return authData;
    },
    onSuccess: (data, variables) => {
      console.log("Registration successful, navigating to home");
      router.replace({
        pathname: "/home",
        params: {
          username: variables.username,
          email: variables.email,
          userId: data.user?.id,
          role: data.user?.role as string,
        },
      });
    },
    onError: (error) => {
      console.error("Register error:", error);
    },
  });
  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
  };
};

export const useCheckSession = () => {
  const checkSession = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        return false;
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("role");
        return false;
      }

      // Perbarui token di AsyncStorage jika perlu
      if (session.access_token !== token) {
        await AsyncStorage.setItem("token", session.access_token);
        await AsyncStorage.setItem("role", session.user.role as string);
      }

      return true;
    } catch (error) {
      console.error("Error checking session:", error);
      return false;
    }
  };

  return { checkSession };
};

export const getAllPatients = () => {
  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data: patients, error } = await supabase
        .from("users")
        .select("id,username,safezone")
        .eq("role", "penderita");
      if (error) throw error;
      return patients;
    },
  });
  return { patients, isLoading };
};

export const useUpdateSafeZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      safeZone,
    }: {
      userId: string;
      safeZone: SafeZone;
    }) => {
      const { data, error } = await supabase
        .from("users")
        .update({
          safezone: safeZone,
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate dan refetch data patients
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error) => {
      console.error("Error updating safe zone:", error);
      throw error;
    },
  });
};
