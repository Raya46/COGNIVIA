import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TouchableOpacity, View, Animated } from "react-native";
import { ThemedText } from "./ThemedText";

export interface ScheduleCardProps {
  id: string;
  title: string;
  type: string;
  time: string;
  onPress?: () => void;
  description?: string;
}

const ScheduleCard = ({
  title,
  type,
  time,
  description = "Tidak ada deskripsi",
  onPress,
}: ScheduleCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Menentukan warna dot berdasarkan type
  const getDotColor = () => {
    switch (type.toLowerCase()) {
      case "rutinitas":
        return "bg-blue-500";
      case "kegiatan":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <View className="mb-3">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="bg-white border border-gray-300 rounded-t-lg"
      >
        <View className="px-4 py-3">
          <View className="flex flex-row items-center justify-between ">
            <View className="flex flex-row items-center gap-2">
              <View
                className={`w-4 h-4 mt-1 mr-2 rounded-full ${getDotColor()}`}
              />
              <View>
                <ThemedText className="font-bold text-lg">{title}</ThemedText>
                <ThemedText className="text-gray-500">{type}</ThemedText>
              </View>
            </View>
            <View className="flex flex-row items-center">
              <ThemedText className="mr-2">{time}</ThemedText>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="gray"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View className="px-4 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
          <View className="ml-4">
            <ThemedText className="text-gray-600">{description}</ThemedText>
            {/* Tambahan konten expandable bisa ditambahkan di sini */}
            <View className="flex-row justify-end mt-2">
              <TouchableOpacity
                className="bg-teal-500 px-4 py-2 rounded-lg"
                onPress={onPress}
              >
                <ThemedText className="text-white">Edit</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ScheduleCard;
