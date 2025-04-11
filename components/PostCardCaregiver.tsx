import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { PostCardType } from "./PostCard";
import { ThemedText } from "./ThemedText";

const PostCardCaregiver = ({
  id,
  title,
  name,
  created_at,
  caption,
  image_url,
  imageProfile,
}: PostCardType) => {
  // Format tanggal untuk mendapatkan hari dan tanggal
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Jika tanggal invalid, gunakan tanggal hari ini
        const today = new Date();
        return {
          hari: today.toLocaleDateString("id-ID", { weekday: "long" }),
          tanggal: today.getDate(),
        };
      }
      return {
        hari: date.toLocaleDateString("id-ID", { weekday: "long" }),
        tanggal: date.getDate(),
      };
    } catch (error) {
      console.error("Error formatting date:", error);
      // Fallback ke tanggal hari ini jika ada error
      const today = new Date();
      return {
        hari: today.toLocaleDateString("id-ID", { weekday: "long" }),
        tanggal: today.getDate(),
      };
    }
  };

  const { hari, tanggal } = formatDate(created_at);

  return (
    <View className="relative border border-teal-500 p-5 rounded-lg mt-12">
      {/* Header Section dengan absolute positioning */}
      <View className="absolute -top-10 left-4 right-4">
        <View className="flex-row justify-between">
          {/* Card Tanggal */}
          <View className="bg-teal-700 px-3 py-2 rounded-lg w-24 h-20 flex flex-col items-center justify-center">
            <ThemedText className="text-gray-200 text-sm text-center capitalize">
              {hari}
            </ThemedText>
            <ThemedText className="text-white text-xl font-bold text-center">
              {tanggal}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View className="bg-teal-500 px-4 py-2 flex-row items-center rounded-lg self-end">
        <ThemedText className="text-white font-semibold text-xs ml-1">
          Tambah Recall
        </ThemedText>
      </View>
      <View className="mt-4">
        {/* Image */}
        <View className="mb-4">
          <Image
            source={{
              uri: image_url,
            }}
            className="w-full h-40 rounded-lg"
            style={{ resizeMode: "cover" }}
          />
        </View>

        {/* Divider */}
        <View className="border-t border-teal-200" />

        {/* Footer */}
        <TouchableOpacity
          className="flex-row items-center justify-between mt-3"
          onPress={() =>
            router.push({
              pathname: "/detail-post",
              params: { id, title, image_url, caption },
            })
          }
        >
          <ThemedText className="text-teal-600 font-semibold">
            Lihat Detail
          </ThemedText>
          <Ionicons name="arrow-forward" size={18} color="#0D9488" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCardCaregiver;
