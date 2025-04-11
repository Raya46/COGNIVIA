import React from "react";
import { Image, View, Dimensions } from "react-native";
import { ThemedText } from "./ThemedText";

export interface PostCardType {
  id?: string;
  title: string;
  name: string;
  users?: {
    username: string;
  };
  created_at: string;
  image_url: string;
  image?: string;
  caption: string;
  like?: number;
  comment?: number;
  share?: number;
  imageProfile: string;
  memory_word?: string;
}

const PostCard = ({ title, image_url, caption }: PostCardType) => {
  const { height } = Dimensions.get("window");

  return (
    <View className="relative" style={{ height: height }}>
      {/* Background Image */}
      <Image
        source={{
          uri: image_url,
        }}
        className="absolute w-full h-full"
        style={{ resizeMode: "cover" }}
      />

      {/* Overlay gradient untuk memastikan teks dapat terbaca */}
      <View className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Content */}
      <View className="absolute bottom-10 p-4">
        <ThemedText className="text-white text-xl font-bold mb-2">
          {title}
        </ThemedText>
        <ThemedText className="text-white text-base">{caption}</ThemedText>
      </View>
    </View>
  );
};

export default PostCard;
