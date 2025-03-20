import PostCard, { PostCardType } from "@/components/PostCard";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useGetPost } from "@/hooks/usePost";
import { useLogout } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Page = () => {
  const { mutate: logout } = useLogout();
  const { userData } = useAuth();
  const { posts, isLoading } = useGetPost();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  const renderPostCard = ({ item }: { item: PostCardType }) => {
    return (
      <PostCard
        title={item.title}
        name={item?.users?.username as string}
        created_at={formatDate(item.created_at)}
        image_url={(item.image_url as string) || (item.image as string)}
        caption={item.caption}
        like={item.like || 0}
        comment={item.comment || 0}
        share={item.share || 0}
        imageProfile="https://picsum.photos/100/100"
      />
    );
  };

  const keyExtractor = (item: PostCardType) => item.id as string;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push("/recall-memory")}
              className="w-10 h-10 bg-gray-300 rounded-full"
            />
            <View className="ml-3">
              <ThemedText className="text-lg font-semibold">
                Good morning, {userData?.username}
              </ThemedText>
              <ThemedText className="text-gray-500">
                {userData?.email}
              </ThemedText>
            </View>
          </View>
          <Ionicons
            onPress={() => logout()}
            name="notifications-outline"
            size={24}
            color="black"
          />
        </View>

        {/* Info Card */}
        <View className="flex flex-col gap-1 p-4 mt-4 shadow bg-white rounded-lg">
          <ThemedText className="text-gray-500">Hari ini</ThemedText>
          <ThemedText className="font-bold">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </ThemedText>
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
              {posts?.length || 0}
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

        {/* Posts Section */}
        <View className="mt-6">
          <ThemedText className="text-xl font-bold mb-2">
            Postingan Terbaru
          </ThemedText>

          {isLoading ? (
            <View className="py-8 flex items-center justify-center">
              <ActivityIndicator size="large" color="#2A9E9E" />
            </View>
          ) : posts && posts.length > 0 ? (
            <FlatList
              data={posts}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              keyExtractor={keyExtractor}
              renderItem={renderPostCard}
            />
          ) : (
            <View className="py-8 flex items-center justify-center">
              <ThemedText className="text-gray-400 text-center">
                Belum ada postingan. Tambahkan postingan pertama Anda!
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Page;
