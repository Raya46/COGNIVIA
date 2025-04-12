import PostCard, { PostCardType } from "@/components/PostCard";
import PostCardCaregiver from "@/components/PostCardCaregiver";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useGetPostByUser } from "@/hooks/usePost";
import {
  getAllPatients,
  useCheckCaregiverStatus,
  useConnectPatient,
} from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Page = () => {
  const { userData } = useAuth();
  const { data: caregiverStatus, isLoading } = useCheckCaregiverStatus();
  const { patients, isLoading: isLoadingPatient } = getAllPatients();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const { mutate: connectPatient } = useConnectPatient();
  const isCaregiver = userData?.role === "caregiver";
  const { posts, isLoading: isLoadingPosts } = useGetPostByUser(
    userData?.id as string,
    userData?.role
  );

  useEffect(() => {
    console.log(caregiverStatus);
    if (caregiverStatus && !caregiverStatus.isProfileComplete) {
      router.replace("/quiz");
    }
  }, [caregiverStatus]);

  // Tampilkan loading state saat mengecek status
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#2A9E9E" />
        <ThemedText className="mt-4 text-gray-600">
          Memeriksa status caregiver...
        </ThemedText>
      </View>
    );
  }

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
      <>
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
      </>
    );
  };

  const keyExtractor = (item: PostCardType) => item.id as string;

  const handleConnectPatient = () => {
    if (!selectedPatient || !userData?.id) return;

    connectPatient({
      caregiverId: userData.id,
      patientId: selectedPatient,
    });
  };

  const renderContent = () => {
    if (isLoadingPosts) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2A9E9E" />
        </View>
      );
    }

    if (!posts || (posts.length === 0 && isCaregiver)) {
      return (
        <View className="flex-1 px-4">
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
              <Picker
                selectedValue={selectedPatient}
                onValueChange={(value) => setSelectedPatient(value)}
              >
                <Picker.Item label="Pilih Penderita" value="" color="#fff" />
                {patients?.map((patient) => (
                  <Picker.Item
                    key={patient.id}
                    label={patient.username}
                    value={patient.id}
                  />
                ))}
              </Picker>
            </View>
            {selectedPatient && (
              <TouchableOpacity
                className="bg-teal-500 p-3 rounded-lg mt-2"
                onPress={handleConnectPatient}
              >
                <ThemedText className="text-white text-center font-semibold">
                  Hubungkan dengan Pasien
                </ThemedText>
              </TouchableOpacity>
            )}
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
            {caregiverStatus?.level >= 4 ? (
              <TouchableOpacity
                className="flex-1 bg-red-500 p-4 rounded-lg mx-1"
                onPress={() => {
                  Linking.openURL("https://www.halodoc.com/");
                }}
              >
                <ThemedText className="text-white font-bold text-center">
                  Konsultasi Halodoc
                </ThemedText>
                <ThemedText className="text-white text-sm text-center mt-1">
                  Segera Konsultasi!
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className="flex-1 bg-teal-600 p-4 rounded-lg mx-1">
                <ThemedText className="text-white font-bold text-center">
                  Rutinitas Hari Ini
                </ThemedText>
                <ThemedText className="text-white text-2xl font-bold text-center">
                  2
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    if (isCaregiver) {
      return (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-10">
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
              <Ionicons
                onPress={() => router.push("/caregiver-quiz/questions")}
                name="notifications-outline"
                size={24}
                color="black"
              />
            </View>
            <View className="mt-4">
              <View className="bg-teal-600 border border-gray-300 rounded-lg">
                <Picker
                  selectedValue={selectedPatient}
                  onValueChange={(value) => setSelectedPatient(value)}
                  style={{ color: "#fff" }}
                >
                  <Picker.Item label="Pilih Penderita" value="" color="#fff" />
                  {patients?.map((patient) => (
                    <Picker.Item
                      key={patient.id}
                      label={patient.username}
                      value={patient.id}
                      color="#fff"
                    />
                  ))}
                </Picker>
              </View>
              {selectedPatient && (
                <TouchableOpacity
                  className="bg-teal-600 p-3 rounded-lg mt-2"
                  onPress={handleConnectPatient}
                >
                  <ThemedText className="text-white text-center font-semibold">
                    Hubungkan dengan Pasien
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
            <View className="flex-row justify-between my-5">
              <TouchableOpacity className="flex-1 p-4 rounded-lg mx-1 border border-teal-500">
                <ThemedText className="text-teal-500 font-bold text-center">
                  Kegiatan Hari Ini
                </ThemedText>
                <ThemedText className="text-teal-500 text-2xl font-bold text-center">
                  3
                </ThemedText>
              </TouchableOpacity>

              {caregiverStatus?.level >= 4 ? (
                <TouchableOpacity
                  className="flex-1 bg-red-500 p-4 rounded-lg mx-1"
                  onPress={() => {
                    Linking.openURL("https://www.halodoc.com/");
                  }}
                >
                  <ThemedText className="text-white font-bold text-center">
                    Konsultasi Halodoc
                  </ThemedText>
                  <ThemedText className="text-white text-sm text-center mt-1">
                    Segera Konsultasi!
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity className="flex-1 bg-teal-500 p-4 rounded-lg mx-1">
                  <ThemedText className="text-white font-bold text-center">
                    Rutinitas Hari Ini
                  </ThemedText>
                  <ThemedText className="text-white text-2xl font-bold text-center">
                    2
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={posts}
              scrollEnabled={false}
              renderItem={renderPostCard}
              contentContainerStyle={{ gap: 18 }}
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
      <View
        className="flex-1"
        style={{
          backgroundColor: "#fff",
        }}
      >
        {renderContent()}
      </View>
    </GestureHandlerRootView>
  );
};

export default Page;
