import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import CLogo from "@/assets/images/C.png";
import { router } from "expo-router";

const LoginScreen = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

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
            onPress={() => router.push("/register")}
            className="text-blue-500"
          >
            Daftar Disini
          </ThemedText>
        </ThemedText>

        {/* Input Email */}
        <View className="mt-8">
          <ThemedText className="text-gray-700 mb-2 font-bold">
            Nama Pengguna / Email
          </ThemedText>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
            <Ionicons name="mail-outline" size={20} color="gray" />
            <TextInput
              placeholder="Pengguna@email.com"
              keyboardType="email-address"
              className="flex-1 ml-2 text-gray-700"
            />
          </View>
        </View>

        {/* Input Password */}
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2 font-bold">
            Kata Sandi
          </ThemedText>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
            <Ionicons name="lock-closed-outline" size={20} color="gray" />
            <TextInput
              placeholder="Password..."
              secureTextEntry={!passwordVisible}
              className="flex-1 ml-2 text-gray-700"
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="mt-2">
            <ThemedText className="text-blue-500 text-right">
              Lupa Password?
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tombol Login */}
        <TouchableOpacity
          onPress={() => router.push("/home")}
          className="mt-6 bg-teal-500 p-3 rounded-lg items-center"
        >
          <ThemedText className="text-white text-lg font-semibold">
            Login
          </ThemedText>
        </TouchableOpacity>

        {/* Tombol Login dengan Google */}
        <TouchableOpacity className="mt-4 border border-gray-300 p-3 rounded-lg flex-row items-center justify-center">
          <Image
            source={{
              uri: "https://www.citypng.com/public/uploads/preview/google-logo-icon-gsuite-hd-701751694791470gzbayltphh.png",
            }}
            className="w-5 h-5 mr-2"
          />
          <ThemedText className="text-gray-700 font-semibold">
            Masuk dengan Google
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
