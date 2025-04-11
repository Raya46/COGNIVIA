import ScheduleCard, { ScheduleCardProps } from "@/components/ScheduleCard";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useGetSchedule } from "@/hooks/useSchedule";
import { useLogout } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Page = () => {
  const { userData } = useAuth();
  const isCaregiver = userData?.role === "caregiver";
  const { mutate: logout } = useLogout();
  const { schedules, isLoading: scheduleLoading } = useGetSchedule(
    undefined,
    userData?.id as string
  );
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

  if (scheduleLoading) {
    return <ActivityIndicator size="small" color="#008B8B" />;
  }
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <View className="flex-row items-center justify-between px-5 pt-2">
          <ThemedText className="text-2xl font-bold">Profile</ThemedText>
          <TouchableOpacity onPress={() => logout()}>
            <Ionicons name="log-out-outline" size={24} color="#008B8B" />
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
              <View className="flex flex-row items-center mt-1">
                <Ionicons name="location" size={14} color="gray" />
                <ThemedText className="ml-1 text-gray-500">
                  Bandung, Indonesia
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="pencil-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
            <View className="flex flex-row items-center gap-3">
              <Ionicons name="person-outline" size={24} color={"#008B8B"} />
              <ThemedText className="text-teal-500">Account</ThemedText>
            </View>
            <View className="border-t border-gray-200"></View>
            <View className="flex flex-row items-center gap-3">
              <Ionicons
                name="notifications-outline"
                size={24}
                color={"#008B8B"}
              />
              <ThemedText className="text-teal-500">Add Caregiver</ThemedText>
            </View>
            <View className="border-t border-gray-200"></View>
            <View className="flex flex-row items-center gap-3">
              <Ionicons name="chatbubble-outline" size={24} color={"#008B8B"} />
              <ThemedText className="text-teal-500">Help Center</ThemedText>
            </View>
            <View className="border-t border-gray-200"></View>
            <View className="flex flex-row items-center gap-3">
              <Ionicons name="headset-outline" size={24} color={"#008B8B"} />
              <ThemedText className="text-teal-500">Contact Support</ThemedText>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => logout()}
            className="flex flex-row items-center gap-3 p-3 border border-gray-200 rounded-lg my-4"
          >
            <Ionicons name="log-out-outline" size={24} color={"red"} />
            <ThemedText className="text-red-500">Logout</ThemedText>
          </TouchableOpacity>

          <View className="flex flex-row items-center justify-between mb-3">
            <ThemedText className="text-lg font-bold">Jadwal</ThemedText>
            {isCaregiver ? (
              <TouchableOpacity>
                <ThemedText
                  onPress={() => router.push("/schedule")}
                  className="text-teal-500"
                >
                  Detail
                </ThemedText>
              </TouchableOpacity>
            ) : null}
          </View>

          <FlatList
            data={schedules}
            renderItem={renderSchedule}
            keyExtractor={(item) => item.id as string}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View className="h-1" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Page;
