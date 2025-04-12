import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { PostCardType } from "./PostCard";
import { ThemedText } from "./ThemedText";
import { LinearGradient } from "expo-linear-gradient";

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
    <LinearGradient
      colors={["#99F6E4", "#FFFFFF"]}
      start={{ x: 0, y: 1 }}
      end={{ x: 0.5, y: 0.2 }}
      style={{ borderRadius: 12, marginTop: 48, padding: 20 }}
    >
      {/* Header Section dengan absolute positioning */}
      <View style={{ position: "absolute", top: -40, left: 16, right: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {/* Card Tanggal dengan gradient */}
          <LinearGradient
            colors={["#008B8B", "#008B8B"]}
            style={{
              borderRadius: 8,
              width: 96,
              height: 80,
              padding: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ThemedText className="text-gray-200 text-sm text-center capitalize">
              {hari}
            </ThemedText>
            <ThemedText className="text-white text-xl font-bold text-center">
              {tanggal}
            </ThemedText>
          </LinearGradient>
        </View>
      </View>

      {/* Main Content */}
      <LinearGradient
        colors={["#14B8A6", "#0D9488"]}
        style={{
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 8,
          alignSelf: "flex-end",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <ThemedText className="text-white font-semibold text-xs ml-1">
          Tambah Recall
        </ThemedText>
      </LinearGradient>

      <View style={{ marginTop: 16 }}>
        {/* Image */}
        <View
          style={{
            marginBottom: 16,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Image
            source={{
              uri: image_url,
            }}
            style={{
              width: "100%",
              height: 160,
              resizeMode: "cover",
            }}
          />
        </View>

        {/* Divider dengan gradient */}
        <LinearGradient
          colors={["#5EEAD4", "#2DD4BF"]}
          style={{
            height: 1,
            width: "100%",
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />

        {/* Footer */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
          onPress={() =>
            router.push({
              pathname: "/detail-post",
              params: { id, title, image_url, caption },
            })
          }
        >
          <ThemedText className="text-teal-800 font-semibold">
            Lihat Detail
          </ThemedText>
          <Ionicons name="arrow-forward" size={18} color="#115E59" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default PostCardCaregiver;
