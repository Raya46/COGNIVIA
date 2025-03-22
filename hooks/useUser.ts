import { supabase } from "@/supabase/supabase";
import { User } from "@/types/user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
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
      });
      if (error) throw error;

      if (authData.user) {
        await supabase.from("users").insert({
          email: data.email,
          username: data.username,
          password: data.password,
        });
      }

      if (authData.session) {
        await AsyncStorage.setItem(
          "token",
          authData.session.access_token as string
        );
      }
    },
    onSuccess: (data, variables) => {
      router.replace({
        pathname: "/home",
        params: {
          username: variables.username,
          email: variables.email,
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
        return false;
      }

      // Perbarui token di AsyncStorage jika perlu
      if (session.access_token !== token) {
        await AsyncStorage.setItem("token", session.access_token);
      }

      return true;
    } catch (error) {
      console.error("Error checking session:", error);
      return false;
    }
  };

  return { checkSession };
};

// Tambahkan fungsi untuk memperbarui sesi secara otomatis
export const setupSessionRefresh = () => {
  // Berlangganan pada perubahan sesi Supabase
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session) {
      // Simpan token baru
      await AsyncStorage.setItem("token", session.access_token);
    } else if (event === "SIGNED_OUT") {
      // Hapus token
      await AsyncStorage.removeItem("token");
    }
  });
};
