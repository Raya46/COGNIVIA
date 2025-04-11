import CLogo from "@/assets/images/C.png";
import TextInputCustom from "@/components/TextInputCustom";
import { ThemedText } from "@/components/ThemedText";
import { useLogin } from "@/hooks/useUser";
import { User, userSchema } from "@/types/user.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
  const { mutate: login, isLoading } = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: User) => {
    console.log(data);
    login(data, {
      onError: (error: any) => {
        const errorMsg =
          error.response?.data?.message || "Invalid username or password";

        setErrorMessage(errorMsg); // Set error message to be displayed
      },
    });
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
            Nama Pengguna / Email
          </ThemedText>
          <TextInputCustom
            placeholder="@email.com"
            name="email"
            control={control}
          />
          {errors.email && (
            <ThemedText className="text-red-500 text-xs">
              {errors.email.message}
            </ThemedText>
          )}
        </View>

        {/* Input Password */}
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2 font-bold">
            Kata Sandi
          </ThemedText>
          <TextInputCustom
            placeholder="password"
            name="password"
            control={control}
            showable
          />
          {errors.password && (
            <ThemedText className="text-red-500 text-xs">
              {errors.password.message}
            </ThemedText>
          )}
        </View>

        {/* Tombol Login */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="mt-6 bg-teal-500 p-3 rounded-lg items-center"
        >
          <ThemedText className="text-white text-lg font-semibold">
            {isLoading ? <ActivityIndicator color={"#fff"} /> : "Login"}
          </ThemedText>
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
