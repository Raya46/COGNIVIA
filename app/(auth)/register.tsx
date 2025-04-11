import CLogo from "@/assets/images/C.png";
import TextInputCustom from "@/components/TextInputCustom";
import { ThemedText } from "@/components/ThemedText";
import { useRegister } from "@/hooks/useUser";
import { User, userSchema } from "@/types/user.type";
import { zodResolver } from "@hookform/resolvers/zod";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RegisterScreen = () => {
  const { mutate: register, isLoading } = useRegister();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<User>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
      role: "penderita",
    },
  });

  const onSubmit = (data: User) => {
    console.log(data);
    register(data, {
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
        <ThemedText className="text-2xl font-bold">Register</ThemedText>
        <ThemedText className="text-gray-500">
          Sudah punya akun?,{" "}
          <ThemedText
            onPress={() => router.replace("/login")}
            className="text-blue-500"
          >
            Login Disini
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
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2 font-bold">
            Username
          </ThemedText>
          <TextInputCustom
            placeholder="username"
            name="username"
            control={control}
          />
          {errors.username && (
            <ThemedText className="text-red-500 text-xs">
              {errors.username.message}
            </ThemedText>
          )}
        </View>

        <View className="mt-4">
          <ThemedText className="text-gray-700 font-bold mb-2">Role</ThemedText>
          <View className="border border-gray-300 rounded-lg">
            <Picker
              selectedValue={watch("role")}
              onValueChange={(value) => setValue("role", value)}
            >
              <Picker.Item label="Select Role" value="" />
              <Picker.Item label="Penderita" value="penderita" />
              <Picker.Item label="Caregiver" value="caregiver" />
            </Picker>
          </View>
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

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="mt-6 bg-teal-500 p-3 rounded-lg items-center"
        >
          {isLoading ? (
            <ThemedText className="text-white text-lg font-semibold">
              Loading...
            </ThemedText>
          ) : (
            <ThemedText className="text-white text-lg font-semibold">
              Register
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer dengan posisi di bawah */}
      <View className="mb-6">
        <ThemedText className="text-center text-gray-500">
          Dengan Register, Anda Menyetujui{" "}
          <ThemedText className="text-blue-500">Kebijakan Privasi</ThemedText>{" "}
          dan{" "}
          <ThemedText className="text-blue-500">Syarat & Ketentuan</ThemedText>.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
};

export default RegisterScreen;
