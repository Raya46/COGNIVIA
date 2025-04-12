import StartQuiz from "@/assets/images/hospital-family-visit.png";
import { useCheckCaregiverStatus } from "@/hooks/useUser";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function QuizScreen() {
  const router = useRouter();
  const { data: caregiverStatus, isLoading, error } = useCheckCaregiverStatus();

  useEffect(() => {
    console.log("Quiz Screen Status Check:", {
      isLoading,
      caregiverStatus,
      error,
    });

    // Jika profil sudah lengkap, redirect ke home
    if (!isLoading && caregiverStatus?.isProfileComplete) {
      console.log("Redirecting from Quiz to Home (profile complete)...");
      router.replace("/home");
    }
  }, [isLoading, caregiverStatus, router]);

  // Tampilkan loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2A9E9E" />
        <Text className="mt-4 text-gray-600">
          Memeriksa status caregiver...
        </Text>
      </View>
    );
  }

  // Jika profil sudah lengkap tapi belum redirect
  if (caregiverStatus?.isProfileComplete) {
    console.log("Profile complete, rendering null while waiting for redirect.");
    return null;
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 items-center justify-between px-4 pb-8">
        <View className="flex-1 items-center justify-center">
          <Image
            source={StartQuiz}
            className="w-72 h-72"
            resizeMode="contain"
          />

          <Text className="text-2xl font-bold text-center mt-6 mb-2">
            Kuis Singkat untuk Calon Caregiver
          </Text>

          <Text className="text-gray-600 text-center px-4 mb-8">
            Tes ini akan menguji pengetahuan dasar Anda sebagai caregiver dan
            mengupload Clock Drawing Test. Harap jawab dengan jujur dan teliti.
          </Text>
        </View>

        <TouchableOpacity
          className="w-full bg-teal-500 rounded-full py-4 px-6"
          onPress={() => router.push("/(untab)/caregiver-quiz/questions")}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Mulai Kuis
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
