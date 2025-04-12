import React, { useState, useRef, useCallback } from "react";
import {
  Image,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";

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

const MAX_CAPTION_LENGTH = 100;

const PostCard = ({
  id,
  title,
  image_url,
  caption,
  comment = 0,
}: PostCardType) => {
  const { height } = Dimensions.get("window");
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const commentSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["65%"];

  const truncatedCaption =
    caption.length > MAX_CAPTION_LENGTH && !showFullCaption
      ? `${caption.substring(0, MAX_CAPTION_LENGTH)}...`
      : caption;

  const handleRecallPress = () => {
    if (id) {
      router.push({
        pathname: "/recall-memory",
        params: { id },
      });
    }
  };

  const handleCommentPress = useCallback(() => {
    commentSheetRef.current?.snapToIndex(0);
    setIsCommentOpen(true);
  }, []);

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

      {/* Gradient overlay atas */}
      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "transparent", "transparent"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "30%",
        }}
      />

      {/* Gradient overlay bawah */}
      <LinearGradient
        colors={["transparent", "transparent", "rgba(0,0,0,0.8)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
        }}
      />

      {/* Side Buttons dengan background lebih gelap */}
      <View className="absolute right-4 bottom-32 items-center space-y-6">
        {/* Recall Button */}
        <TouchableOpacity className="items-center" onPress={handleRecallPress}>
          <View className="bg-black/60 rounded-full p-3 mb-1">
            <Ionicons
              name="file-tray-stacked-outline"
              size={28}
              color="white"
            />
          </View>
          <ThemedText type="semibold" className="text-white text-md font-medium">
            Recall
          </ThemedText>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity className="items-center" onPress={handleCommentPress}>
          <View className="bg-black/60 rounded-full p-3 mb-1">
            <Ionicons name="chatbubble-outline" size={28} color="white" />
          </View>
          <ThemedText className="text-white text-md font-medium">
            {comment}
          </ThemedText>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity className="items-center">
          <View className="bg-black/60 rounded-full p-3 mb-1">
            <Ionicons name="bookmark-outline" size={28} color="white" />
          </View>
          <ThemedText type="semibold" className="text-white text-md font-medium">
            Save
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content dengan shadow tambahan untuk keterbacaan */}
      <View className="absolute bottom-10 p-4 pr-20">
        <ThemedText
          className="text-white text-xl font-bold mb-2"
          style={{
            textShadowColor: "rgba(0, 0, 0, 0.75)",
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}
        >
          {title}
        </ThemedText>
        <View>
          <ThemedText
            className="text-white text-base"
            style={{
              textShadowColor: "rgba(0, 0, 0, 0.75)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {truncatedCaption}
          </ThemedText>
          {caption.length > MAX_CAPTION_LENGTH && (
            <TouchableOpacity
              onPress={() => setShowFullCaption(!showFullCaption)}
              className="mt-1"
            >
              <ThemedText
                className="text-gray-300 text-sm"
                style={{
                  textShadowColor: "rgba(0, 0, 0, 0.75)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              >
                {showFullCaption ? "Show less" : "See more"}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Comment Bottom Sheet */}
      <BottomSheet
        ref={commentSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={() => setIsCommentOpen(false)}
        index={-1}
      >
        <BottomSheetScrollView
          className="p-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText className="text-lg font-bold">Komentar</ThemedText>
            <TouchableOpacity
              onPress={() => commentSheetRef.current?.close()}
              className="p-2"
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Dummy comments for now */}
          {[1, 2, 3].map((_, index) => (
            <View key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-full bg-gray-300 mr-2" />
                <View>
                  <ThemedText className="font-bold">User Name</ThemedText>
                  <ThemedText className="text-xs text-gray-500">
                    2 jam yang lalu
                  </ThemedText>
                </View>
              </View>
              <ThemedText>Ini adalah komentar contoh.</ThemedText>
            </View>
          ))}

          {/* Comment Input */}
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mt-4 mb-4">
            <View className="w-8 h-8 rounded-full bg-gray-300 mr-2" />
            <ThemedText className="flex-1 text-gray-500">
              Tulis komentar...
            </ThemedText>
            <TouchableOpacity className="ml-2">
              <Ionicons name="send" size={24} color="#2A9E9E" />
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

export default PostCard;
