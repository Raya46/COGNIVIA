import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface PostCard {
  name: string;
  time: string;
  imgUrl: string;
  caption: string;
  like: number;
  comment: number;
  share: number;
  imageProfile: string;
}

const PostCard = ({
  name,
  time,
  imgUrl,
  caption,
  like,
  comment,
  share,
  imageProfile,
}: PostCard) => {
  return (
    <View className="bg-white rounded-lg shadow p-4 mt-4">
      {/* Post Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={{
              uri: imageProfile,
            }}
            className="w-10 h-10 rounded-full"
          />
          <View className="ml-3">
            <ThemedText className="font-semibold">{name}</ThemedText>
            <ThemedText className="text-gray-500">{time}</ThemedText>
          </View>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color="gray" />
      </View>

      {/* Post Image */}
      <View className="mt-3">
        <Image
          source={{
            uri: imgUrl,
          }}
          className="w-full h-40 rounded-lg"
        />
      </View>

      {/* Post Caption */}
      <ThemedText className="mt-2 text-gray-600">{caption}</ThemedText>

      {/* Post Actions */}
      <View className="flex-row justify-between mt-3">
        <View className="flex-row items-center">
          <Ionicons name="heart-outline" size={20} color="gray" />
          <ThemedText className="ml-1 text-gray-500">{like}</ThemedText>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="chatbubble-outline" size={20} color="gray" />
          <ThemedText className="ml-1 text-gray-500">{comment}</ThemedText>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="share-outline" size={20} color="gray" />
          <ThemedText className="ml-1 text-gray-500">{share}</ThemedText>
        </View>
      </View>
    </View>
  );
};

export default PostCard;
