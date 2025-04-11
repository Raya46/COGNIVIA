import PostCard, { PostCardType } from "@/components/PostCard";
import PostCardCaregiver from "@/components/PostCardCaregiver";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useGetPostByUser } from "@/hooks/usePost";
import React from "react";
import {
  ActivityIndicator,
  View,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const Page = () => {
  const { userData } = useAuth();
  const isCaregiver = userData?.role === "caregiver";
  const { posts, isLoading } = useGetPostByUser(
    userData?.id as string,
    userData?.role
  );

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
    if (isCaregiver) {
      return (
        <PostCardCaregiver
          id={item.id}
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
    }

    return (
      <PostCard
        id={item.id}
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2A9E9E" />
        </View>
      );
    }

    if (!posts || posts.length === 0) {
      return (
        <View className="flex-1 items-center justify-center">
          <ThemedText className="text-gray-400 text-center">
            Belum ada postingan. Tambahkan postingan pertama Anda!
          </ThemedText>
        </View>
      );
    }

    if (isCaregiver) {
      return (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-4">
            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-300 rounded-full" />
                <View className="ml-3">
                  <ThemedText className="text-lg font-semibold">
                    Good morning, {userData?.username}!
                  </ThemedText>
                  <ThemedText className="text-gray-500">
                    {userData?.email}
                  </ThemedText>
                </View>
              </View>
              <Ionicons name="notifications-outline" size={24} color="black" />
            </View>
            <View className="mt-4">
              <View className="bg-teal-500 border border-gray-300 rounded-lg">
                <Picker>
                  <Picker.Item label="Pilih Penderita" value="" color="#fff" />
                  <Picker.Item label="Ahmad" value="ahmad" />
                </Picker>
              </View>
            </View>
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity className="flex-1 bg-teal-500 p-4 rounded-lg mx-1">
                <ThemedText className="text-white font-bold text-center">
                  Kegiatan Hari Ini
                </ThemedText>
                <ThemedText className="text-white text-2xl font-bold text-center">
                  3
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-teal-500 p-4 rounded-lg mx-1">
                <ThemedText className="text-white font-bold text-center">
                  Rutinitas Hari Ini
                </ThemedText>
                <ThemedText className="text-white text-2xl font-bold text-center">
                  2
                </ThemedText>
              </TouchableOpacity>
            </View>
            <FlatList
              data={posts}
              scrollEnabled={false}
              renderItem={renderPostCard}
            />
          </View>
        </ScrollView>
      );
    }

    return (
      <FlatList
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderPostCard}
        pagingEnabled
        snapToAlignment="center"
        decelerationRate={0.3}
        showsVerticalScrollIndicator={false}
        vertical
      />
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        className="flex-1"
        style={{
          backgroundColor: "#fff",
        }}
      >
        {renderContent()}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Page;
