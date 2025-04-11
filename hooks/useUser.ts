import { supabase } from "@/supabase/supabase";
import { SafeZone } from "@/types/user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: "penderita" | "caregiver";
  safezone?: string;
}

export const useLogin = () => {
  const mutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      console.log("Attempting login with:", data);

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error("Auth error:", error);
        throw error;
      }

      if (!authData.user) {
        throw new Error("No user data returned");
      }

      // Cek role user di metadata
      const role = authData.user?.user_metadata?.role || "penderita";
      console.log("User role:", role);

      // Ambil data user dari tabel yang sesuai
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", data.email)
        .single();

      if (userError) {
        console.error("User data error:", userError);
        throw userError;
      }

      if (authData.session) {
        await AsyncStorage.setItem("token", authData.session.access_token);
        await AsyncStorage.setItem("role", role);
      }

      return { ...authData, userData };
    },
    onSuccess: (data) => {
      console.log("Login successful:", data);
      router.replace("/home");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      throw error;
    },
  });
  return mutation;
};

export const useLogout = () =>
  useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem("token");
    },
    onSuccess: () => {
      router.replace("/login");
    },
    onError: (error) => {
      console.error("Logout error:", error);
    },
  });

export const useRegister = () => {
  const mutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      // Daftar di Supabase Auth
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

      // Insert ke tabel yang sesuai berdasarkan role
      const table = data.role === "caregiver" ? "caregivers" : "users";
      const { error: insertError } = await supabase.from(table).insert({
        id: authData.user.id,
        username: data.username,
        email: data.email,
        role: data.role,
        safezone: data.safezone || null,
      });

      if (insertError) {
        console.error("Error inserting user data:", insertError);
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw insertError;
      }

      if (authData.session) {
        await AsyncStorage.setItem("token", authData.session.access_token);
        await AsyncStorage.setItem("role", data.role);
      }

      return authData;
    },
    onSuccess: (data, variables) => {
      router.replace({
        pathname: "/home",
        params: {
          username: variables.username,
          email: variables.email,
          userId: data.user?.id,
          role: variables.role,
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
        .select("id,userusername,safezone")
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
          safezone: JSON.stringify(safeZone), // Convert ke string sebelum simpan ke DB
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
    onError: (error) => {
      console.error("Error updating safe zone:", error);
      throw error;
    },
  });
};
