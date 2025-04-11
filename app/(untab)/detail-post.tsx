import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React from "react";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DetailPost = () => {
  const params = useLocalSearchParams();
  const { id, title, image_url, caption } = params;

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center my-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <ThemedText className="text-lg font-semibold ml-4">
            Detail Postingan
          </ThemedText>
        </View>

        {/* Preview Image */}
        {image_url && (
          <View className="mt-2 mb-4">
            <Image
              source={{ uri: image_url as string }}
              className="w-full h-48 rounded-lg"
              resizeMode="contain"
            />
          </View>
        )}

        {/* Judul Foto */}
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2">Judul Foto</ThemedText>
          <View className="border border-gray-300 rounded-lg p-3">
            <ThemedText className="text-gray-700">{title}</ThemedText>
          </View>
        </View>

        {/* Caption */}
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2">Caption</ThemedText>
          <View className="border border-gray-300 rounded-lg p-3 min-h-[100px]">
            <ThemedText className="text-gray-700">{caption}</ThemedText>
          </View>
        </View>

        {/* Tombol Tambah Recall */}
        <TouchableOpacity className="mt-6 mb-8 bg-teal-500 p-3 rounded-lg items-center">
          <ThemedText className="text-white text-lg font-semibold">
            Tambah Recall
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DetailPost;
