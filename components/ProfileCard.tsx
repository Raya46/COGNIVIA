import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";

interface ProfileCardProps {
  image_url: string;
  title?: string;
  questionsLength?: number;
  type?: "kuis" | "guess-me";
}

const ProfileCard = ({
  image_url,
  title,
  questionsLength,
  type,
}: ProfileCardProps) => {
  return (
    <View className="bg-white p-4 rounded-xl shadow-lg">
      <Image
        source={{ uri: image_url }}
        className="w-full h-40 rounded-lg"
        resizeMode="cover"
      />
      
      <View className="flex-row justify-between items-center mt-2">
        <View className="w-full">
          <ThemedText className="text-sm text-gray-600 mb-1 text-center">
            Yuk, tebak siapa di foto ini!
          </ThemedText>
          <ThemedText className="text-xl font-bold text-black text-center">
            Apakah kamu masih ingat namanya?
          </ThemedText>
        </View>
      </View>

      {/* Edit & Delete Buttons */}
      {type === "kuis" ? null : (
        <View className="flex-row justify-between items-center w-full mt-4">
          <View>
            <ThemedText className="text-lg font-semibold">
              {title}
            </ThemedText>
            <ThemedText className="text-gray-500">
              {questionsLength} Pertanyaan
            </ThemedText>
          </View>
                  
          <View className="flex-row gap-2">
            <TouchableOpacity className="border-2 border-gray-500 p-2 px-4 rounded-lg">
              <Ionicons name="pencil" size={20} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity className="border-2 border-red-500 p-2 px-4 rounded-lg">
              <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default ProfileCard;