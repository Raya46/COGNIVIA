import { supabase } from "@/supabase/supabase";
import { SafeZone } from "@/types/user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import { useAuth } from "@/context/AuthContext";

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

      // Ambil data user dari tabel yang sesuai berdasarkan role
      let userData;
      if (role === "caregiver") {
        const { data: caregiverData, error: caregiverError } = await supabase
          .from("caregivers")
          .select("*")
          .eq("email", data.email)
          .single();

        if (caregiverError) {
          console.error("Caregiver data error:", caregiverError);
          throw caregiverError;
        }
        userData = caregiverData;
      } else {
        const { data: userDataResult, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("email", data.email)
          .single();

        if (userError) {
          console.error("User data error:", userError);
          throw userError;
        }
        userData = userDataResult;
      }

      if (authData.session) {
        await AsyncStorage.setItem("token", authData.session.access_token);
        await AsyncStorage.setItem("role", role);
      }

      return {
        ...authData,
        userData: {
          ...userData,
          role, // Memastikan role selalu ada di userData
        },
      };
    },
    onSuccess: (data) => {
      console.log("Login successful:", data);
      router.replace("/home");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      Alert.alert(
        "Error",
        "Gagal login. Silakan periksa email dan password Anda."
      );
    },
  });
  return mutation;
};

export const useLogout = () =>
  useMutation({
    mutationFn: async () => {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("role");
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
      if (data.role == "caregiver") {
        await supabase.from("caregivers").insert({
          id: authData.user.id,
          username: data.username,
          email: data.email,
          role: data.role,
          quiz_cg_value: 0,
          password: data.password,
        });
      } else {
        await supabase.from("users").insert({
          id: authData.user.id,
          username: data.username,
          email: data.email,
          role: data.role,
          password: data.password,
        });
      }

      if (authData.session) {
        await AsyncStorage.setItem("token", authData.session.access_token);
        await AsyncStorage.setItem("role", data.role);
      }

      return authData;
    },
    onSuccess: (data, variables) => {
      if (variables.role == "caregiver") {
        router.replace("/quiz");
      } else {
        router.replace({
          pathname: "/home",
          params: {
            username: variables.username,
            email: variables.email,
            userId: data.user?.id,
            role: variables.role,
          },
        });
      }
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

export const useSendClockTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      imageUri,
      quizScore,
    }: {
      userId: string;
      imageUri: string;
      quizScore: number;
    }) => {
      try {
        let imagePath = "";
        const timestamp = new Date().getTime();
        const fileExt = imageUri.split(".").pop() || "jpg";
        imagePath = `public/${userId}_${timestamp}.${fileExt}`;

        // Handle both file:// protocol and content:// protocol
        if (imageUri.startsWith("file://")) {
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const { error: storageError } = await supabase.storage
            .from("clocktests")
            .upload(imagePath, decode(base64), {
              contentType: `image/${fileExt}`,
              upsert: true,
            });

          if (storageError) {
            console.error("Storage error:", storageError);
            throw new Error(`Upload failed: ${storageError.message}`);
          }
        } else {
          const response = await fetch(imageUri);
          const blob = await response.blob();

          const { error: storageError } = await supabase.storage
            .from("clocktests")
            .upload(imagePath, blob, {
              contentType: `image/${fileExt}`,
              upsert: true,
            });

          if (storageError) {
            console.error("Storage error:", storageError);
            throw new Error(`Upload failed: ${storageError.message}`);
          }
        }

        // Dapatkan URL publik
        const {
          data: { publicUrl },
        } = supabase.storage.from("clocktests").getPublicUrl(imagePath);

        // Update tabel caregivers
        const { data: updateData, error: updateError } = await supabase
          .from("caregivers")
          .update({
            clocktest: publicUrl,
            quiz_cg_value: quizScore,
          })
          .eq("id", userId)
          .select()
          .single();

        if (updateError) {
          console.error("Update error:", updateError);
          throw new Error(`Update failed: ${updateError.message}`);
        }

        return updateData;
      } catch (error) {
        console.error("Error in sendClockTest:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caregiverProfile"] });
      router.replace("/home");
    },
    onError: (error: Error) => {
      console.error("Error sending clock test:", error);
      Alert.alert(
        "Error",
        `Gagal mengunggah clock test: ${error.message}. Silakan coba lagi.`
      );
    },
  });
};

// Tambahkan fungsi decode untuk konversi base64
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const useCheckCaregiverStatus = () => {
  const { userData } = useAuth();

  return useQuery({
    queryKey: ["caregiverStatus", userData?.id],
    queryFn: async () => {
      if (!userData?.id) {
        throw new Error("User ID tidak ditemukan");
      }

      const { data, error } = await supabase
        .from("caregivers")
        .select("quiz_cg_value, clocktest")
        .eq("id", userData.id)
        .single();

      if (error) {
        console.error("Error fetching caregiver status:", error);
        throw error;
      }

      return data;
    },
    enabled: !!userData?.id && userData?.role === "caregiver",
    retry: false,
  });
};

// Tambahkan di useUser.ts
export const useConnectPatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caregiverId,
      patientId,
    }: {
      caregiverId: string;
      patientId: string;
    }) => {
      const { data, error } = await supabase
        .from("user_caregivers")
        .insert({
          user_id: patientId,
          caregiver_id: caregiverId,
          status: "pending", // pending, accepted, rejected
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      Alert.alert("Sukses", "Permintaan koneksi telah dikirim");
    },
    onError: (error) => {
      console.error("Error connecting patient:", error);
      Alert.alert("Error", "Gagal menghubungkan dengan pasien");
    },
  });
};

export const useGetCaregivers = () => {
  return useQuery({
    queryKey: ["caregivers"],
    queryFn: async () => {
      const { data: caregivers, error } = await supabase
        .from("caregivers")
        .select("id, username");

      if (error) throw error;
      return caregivers;
    },
  });
};

// Di useUser.ts, update fungsi useGetConnections
export const useGetConnections = (userId: string) => {
  return useQuery({
    queryKey: ["connections", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_caregivers")
        .select(
          `
          id,
          user_id,
          caregiver_id,
          status,
          users (id, username),
          caregivers (id, username)
        `
        )
        .or(`user_id.eq.${userId},caregiver_id.eq.${userId}`);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const useUpdateConnectionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      connectionId,
      status,
    }: {
      connectionId: string;
      status: "accepted" | "rejected";
    }) => {
      const { data, error } = await supabase
        .from("user_caregivers")
        .update({ status })
        .eq("id", connectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
};
