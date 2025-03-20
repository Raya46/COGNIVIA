import { ThemedText } from "@/components/ThemedText";
import React from "react";
import {
  ScrollView,
  View,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetPost } from "@/hooks/usePost";
import { router } from "expo-router";
import { PostCardType } from "@/components/PostCard";
import { useGetSchedule } from "@/hooks/useSchedule";
import ScheduleCard, { ScheduleCardProps } from "@/components/ScheduleCard";
import { useAuth } from "@/context/AuthContext";

const Page = () => {
  const { posts, isLoading } = useGetPost();
  const { userData } = useAuth();
  const { schedules, isLoading: scheduleLoading } = useGetSchedule();
  const renderSchedule = ({ item }: { item: ScheduleCardProps }) => {
    return (
      <ScheduleCard
        onPress={() => router.push("/schedule")}
        id={item.id}
        time={item.time}
        title={item.title}
        type={item.type}
        description={item.description}
      />
    );
  };
  const renderImagePost = ({ item }: { item: PostCardType }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/recall-memory",
            params: {
              id: item.id,
              title: item.title,
              image_url: item.image_url,
              caption: item.caption,
              memory_word: item.memory_word,
              created_at: item.created_at,
            },
          })
        }
        className="w-1/3 mx-1"
      >
        <Image
          source={{ uri: item.image_url }}
          className="w-full h-40"
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  if (scheduleLoading && isLoading) {
    return <ActivityIndicator size="small" color="#008B8B" />;
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="flex-row items-center justify-between px-5 pt-2">
          <ThemedText className="text-2xl font-bold">Profile</ThemedText>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="notifications-outline" size={24} color="#008B8B" />
          </TouchableOpacity>
        </View>

        <View className="px-5 pt-5">
          <View className="flex flex-row items-center mb-5">
            <View className="w-20 h-20 mr-5 overflow-hidden rounded-full">
              <View className="w-20 h-20 rounded-full bg-sky-300" />
            </View>
            <View className="flex-1">
              <ThemedText className="text-lg font-bold">
                {userData?.username}
              </ThemedText>
              <ThemedText className="mt-1 text-gray-500">
                {userData?.email}
              </ThemedText>
              <View className="flex flex-row items-center mt-1">
                <Ionicons name="location" size={14} color="gray" />
                <ThemedText className="ml-1 text-gray-500">
                  Bandung, Indonesia
                </ThemedText>
              </View>
            </View>
          </View>

          <View className="flex flex-row items-center justify-between mb-3">
            <ThemedText className="text-lg font-bold">Jadwal</ThemedText>
            <TouchableOpacity>
              <ThemedText
                onPress={() => router.push("/schedule")}
                className="text-teal-500"
              >
                Detail
              </ThemedText>
            </TouchableOpacity>
          </View>

          <FlatList
            data={schedules}
            renderItem={renderSchedule}
            keyExtractor={(item) => item.id as string}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View className="h-1" />}
          />

          <ThemedText className="mt-5 mb-3 text-lg font-bold">
            Postingan
          </ThemedText>

          <FlatList
            data={posts}
            renderItem={renderImagePost}
            keyExtractor={(item) => item.id as string}
            numColumns={3}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Page;
