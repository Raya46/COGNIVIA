import PostCard, { PostCardType } from "@/components/PostCard";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useGetPostByUser } from "@/hooks/usePost";
import React from "react";
import { ActivityIndicator, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Page = () => {
  const { userData } = useAuth();
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-black">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2A9E9E" />
          </View>
        ) : posts && posts.length > 0 ? (
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
        ) : (
          <View className="flex-1 items-center justify-center">
            <ThemedText className="text-gray-400 text-center">
              Belum ada postingan. Tambahkan postingan pertama Anda!
            </ThemedText>
          </View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Page;
