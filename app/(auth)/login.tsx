import CLogo from "@/assets/images/C.png";
import TextInputCustom from "@/components/TextInputCustom";
import { ThemedText } from "@/components/ThemedText";
import { useLogin } from "@/hooks/useUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginScreen = () => {
  const { mutate: login, isPending } = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setErrorMessage(null);
      await login(data, {
        onError: (error: any) => {
          console.error("Login error in component:", error);
          const errorMsg = error?.message || "Gagal masuk. Silakan coba lagi.";
          setErrorMessage(errorMsg);
          Alert.alert("Error", errorMsg);
        },
      });
    } catch (error: any) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "Terjadi kesalahan yang tidak diharapkan");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      {/* Logo */}
      <View className="mb-6 rounded-lg">
        <Image
          source={CLogo}
          style={{
            width: 50,
            height: 50,
            resizeMode: "contain",
          }}
          className="rounded-lg"
        />
      </View>

      {/* Konten utama dalam container flex */}
      <View className="flex-1">
        {/* Title */}
        <ThemedText className="text-2xl font-bold">Login</ThemedText>
        <ThemedText className="text-gray-500">
          Belum punya akun,{" "}
          <ThemedText
            onPress={() => router.replace("/register")}
            className="text-blue-500"
          >
            Daftar Disini
          </ThemedText>
        </ThemedText>

        {errorMessage && (
          <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-4">
            <ThemedText className="text-sm">{errorMessage}</ThemedText>
          </View>
        )}

        {/* Input Email */}
        <View className="mt-8">
          <ThemedText className="text-gray-700 mb-2 font-bold">
            Email
          </ThemedText>
          <TextInputCustom
            placeholder="email@example.com"
            name="email"
            control={control}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && (
            <ThemedText className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </ThemedText>
          )}
        </View>

        {/* Input Password */}
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2 font-bold">
            Password
          </ThemedText>
          <TextInputCustom
            placeholder="******"
            name="password"
            control={control}
            secureTextEntry
            autoCapitalize="none"
          />
          {errors.password && (
            <ThemedText className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </ThemedText>
          )}
        </View>

        {/* Tombol Login */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          className={`mt-6 bg-teal-500 p-3 rounded-lg items-center ${
            isPending ? "opacity-50" : ""
          }`}
        >
          {isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText className="text-white text-lg font-semibold">
              Login
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer dengan posisi di bawah */}
      <View className="mb-6">
        <ThemedText className="text-center text-gray-500">
          Dengan Login, Anda Menyetujui{" "}
          <ThemedText className="text-blue-500">Kebijakan Privasi</ThemedText>{" "}
          dan{" "}
          <ThemedText className="text-blue-500">Syarat & Ketentuan</ThemedText>.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
