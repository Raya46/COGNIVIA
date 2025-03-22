import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

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
      <ThemedText className="text-lg font-semibold text-center mt-2">
        {title}
      </ThemedText>
      <ThemedText className="text-gray-500 text-center">
        {questionsLength} Pertanyaan
      </ThemedText>

      {/* Edit & Delete Buttons */}
      {type === "kuis" ? null : (
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity className="bg-teal-500 p-2 px-4 rounded-lg">
            <ThemedText className="text-white font-semibold">
              Edit Data
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity className="bg-red-500 p-2 px-4 rounded-lg">
            <ThemedText className="text-white font-semibold">
              Hapus Data
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ProfileCard;
