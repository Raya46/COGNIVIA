import { ThemedText } from "@/components/ThemedText";
import React from "react";
import {
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GuessMe from "@/assets/images/guess-me-nodata.png";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useGetGuessMe } from "@/hooks/useGuessMe";

const Page = () => {
  const { userData } = useAuth();
  const { guessMeData, isLoading } = useGetGuessMe(userData?.id);

  const handlePressGuessMe = (guessMe: any) => {
    if (guessMe.user_id === userData?.id) {
      const questionsParam = encodeURIComponent(
        JSON.stringify(guessMe.questions || [])
      );

      router.push({
        pathname: "/guess-me-action/detail",
        params: {
          id: guessMe.id,
          title: guessMe.title || `Guess Me`,
          image_url: guessMe.image_url || "",
          created_at: guessMe.created_at,
          questions_data: questionsParam,
        },
      });
    } else {
      Alert.alert(
        "Akses Ditolak",
        "Anda hanya dapat mengakses guess-me yang Anda buat."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex flex-col items-center justify-between px-4 py-2">
        <View className="flex flex-row items-center gap-2">
          <ThemedText className="text-xl font-bold">Guess Me</ThemedText>
          <Ionicons
            className="bg-teal-500 rounded-full p-2"
            onPress={() => router.push("/guess-me-action/create")}
            name="add"
            size={18}
            color="white"
          />
        </View>
        <ThemedText className="text-sm text-gray-500">
          Silahkan Tambahkan dan Pilih Data
        </ThemedText>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {!userData?.id ? (
          <View className="flex items-center justify-center py-10">
            <ThemedText className="text-center text-gray-500">
              Silakan login untuk mengakses fitur Guess Me.
            </ThemedText>
          </View>
        ) : isLoading ? (
          <View className="flex items-center justify-center py-10">
            <ActivityIndicator size="large" color="#2A9E9E" />
          </View>
        ) : guessMeData && guessMeData.length > 0 ? (
          <View className="flex-1">
            <FlatList
              scrollEnabled={false}
              numColumns={2}
              data={guessMeData}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handlePressGuessMe(item)}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 mb-4 shadow-sm flex-1 mx-1"
                >
                  {item.image_url ? (
                    <Image
                      source={{ uri: item.image_url }}
                      className="w-full h-48"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Ionicons name="image-outline" size={40} color="gray" />
                    </View>
                  )}
                  <View className="p-3">
                    <ThemedText className="text-lg font-semibold">
                      {item.title || `Guess Me #${index + 1}`}
                    </ThemedText>
                    <View className="flex-row items-center mt-1">
                      <Ionicons
                        name="help-circle-outline"
                        size={14}
                        color="gray"
                      />
                      <ThemedText className="text-gray-500 text-sm ml-1">
                        {item.questions ? item.questions.length : 0} Pertanyaan
                      </ThemedText>
                    </View>
                    <ThemedText className="text-gray-500 text-sm mt-1">
                      {new Date(item.created_at).toLocaleDateString("id-ID")}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <View className="flex items-center justify-center py-10">
            <Image
              source={GuessMe}
              className="w-full h-40"
              resizeMode="contain"
            />
            <ThemedText className="font-bold text-lg text-center text-[#2A9E9E]">
              Belum Ada Data Yang Ditambahkan
            </ThemedText>
            <ThemedText className="text-center text-gray-500 mt-2">
              Silahkan Tambahkan Data Guess Me Baru Untuk Menampilkan Items
            </ThemedText>
            <TouchableOpacity
              onPress={() => router.push("/guess-me-action/create")}
              className="mt-4 bg-teal-500 py-3 px-6 rounded-lg flex-row items-center"
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <ThemedText className="text-white ml-2">
                Tambahkan Data Guess Me
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Page;
