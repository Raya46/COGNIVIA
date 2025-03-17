import PostCard from "@/components/PostCard";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Page = () => {
  // Tambahkan data dummy
  const dummyPosts = [
    {
      id: "1",
      name: "John Doe",
      time: "2 jam yang lalu",
      imgUrl: "https://picsum.photos/400/300",
      caption: "Hari yang indah di pantai!",
      like: 120,
      comment: 45,
      share: 12,
      imageProfile: "https://picsum.photos/100/100",
    },
    {
      id: "2",
      name: "Jane Smith",
      time: "5 jam yang lalu",
      imgUrl: "https://picsum.photos/400/301",
      caption: "Makan siang bersama teman-teman",
      like: 89,
      comment: 23,
      share: 5,
      imageProfile: "https://picsum.photos/100/101",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-gray-300 rounded-full" />
            <View className="ml-3">
              <ThemedText className="text-lg font-semibold">
                Good morning, Hadiano!
              </ThemedText>
              <ThemedText className="text-gray-500">@hadiano_sutomo</ThemedText>
            </View>
          </View>
          <Ionicons name="notifications-outline" size={24} color="black" />
        </View>

        {/* Info Card */}
        <View className="p-4 mt-4 shadow bg-white rounded-lg">
          <ThemedText className="text-gray-500">Hari ini</ThemedText>
          <ThemedText className="font-bold">Minggu, 25 Agustus 2024</ThemedText>
          <ThemedText className="text-gray-500">
            Semoga harimu menyenangkan!
          </ThemedText>
        </View>

        {/* Stats */}
        <View className="flex-row justify-between mt-4">
          <TouchableOpacity className="flex-1 bg-teal-500 p-4 rounded-lg mx-1">
            <ThemedText className="text-white font-bold text-center">
              Kegiatan Hari Ini
            </ThemedText>
            <ThemedText className="text-white text-2xl font-bold text-center">
              3
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-green-500 p-4 rounded-lg mx-1">
            <ThemedText className="text-white font-bold text-center">
              Rutinitas Hari Ini
            </ThemedText>
            <ThemedText className="text-white text-2xl font-bold text-center">
              2
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Post Card */}
        <FlatList
          data={dummyPosts}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              name={item.name}
              time={item.time}
              imgUrl={item.imgUrl}
              caption={item.caption}
              like={item.like}
              comment={item.comment}
              share={item.share}
              imageProfile={item.imageProfile}
            />
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Page;
