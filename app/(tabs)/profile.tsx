import ScheduleCard, { ScheduleCardProps } from "@/components/ScheduleCard";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useGetSchedule } from "@/hooks/useSchedule";
import {
  useLogout,
  useConnectPatient,
  useGetCaregivers,
  useGetConnections,
  useUpdateConnectionStatus,
} from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useState } from "react";
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
  const { data: connections, isLoading: connectionsLoading } =
    useGetConnections(userData?.id as string);
  const { data: caregivers } = useGetCaregivers();
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>("");
  const { mutate: connectToCaregiver } = useConnectPatient();
  const { mutate: updateStatus } = useUpdateConnectionStatus();
  const { mutate: logout } = useLogout();
  const { schedules, isLoading: scheduleLoading } = useGetSchedule(
    isCaregiver ? userData?.id : undefined,
    isCaregiver ? undefined : userData?.id
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

  const handleConnectCaregiver = () => {
    if (!selectedCaregiver || !userData?.id) return;

    connectToCaregiver({
      caregiverId: selectedCaregiver,
      patientId: userData.id,
    });
  };

  const handleConnectionResponse = (
    connectionId: string,
    status: "accepted" | "rejected"
  ) => {
    updateStatus({ connectionId, status });
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
            <ThemedText className="text-lg font-bold">
              {isCaregiver ? "Semua Jadwal Dibuat" : "Jadwal Saya"}
            </ThemedText>
            {isCaregiver && (
              <TouchableOpacity
                onPress={() => router.push("/schedule")}
                className="bg-teal-500 px-3 py-1 rounded-lg"
              >
                <ThemedText className="text-white">Detail</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {scheduleLoading ? (
            <ActivityIndicator size="small" color="#008B8B" />
          ) : schedules && schedules.length > 0 ? (
            <FlatList
              data={schedules}
              renderItem={renderSchedule}
              keyExtractor={(item) => item.id as string}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View className="h-2" />}
              ListEmptyComponent={() => (
                <View className="py-4">
                  <ThemedText className="text-center text-gray-500">
                    {isCaregiver
                      ? "Belum ada jadwal yang dibuat"
                      : "Belum ada jadwal untuk Anda"}
                  </ThemedText>
                </View>
              )}
            />
          ) : (
            <View className="py-4">
              <ThemedText className="text-center text-gray-500">
                {isCaregiver
                  ? "Belum ada jadwal yang dibuat"
                  : "Belum ada jadwal untuk Anda"}
              </ThemedText>
            </View>
          )}
        </View>

        {!isCaregiver && (
          <View className="px-5 mt-4">
            <ThemedText className="text-lg font-bold mb-2">
              Hubungkan dengan Caregiver
            </ThemedText>
            <View className="bg-teal-500 border border-gray-300 rounded-lg">
              <Picker
                selectedValue={selectedCaregiver}
                onValueChange={(value) => setSelectedCaregiver(value)}
                style={{ color: "#fff" }}
              >
                <Picker.Item label="Pilih Caregiver" value="" color="#fff" />
                {caregivers?.map((caregiver) => (
                  <Picker.Item
                    key={caregiver.id}
                    label={caregiver.username}
                    value={caregiver.id}
                  />
                ))}
              </Picker>
            </View>
            {selectedCaregiver && (
              <TouchableOpacity
                className="bg-teal-500 p-3 rounded-lg mt-2"
                onPress={handleConnectCaregiver}
              >
                <ThemedText className="text-white text-center font-semibold">
                  Hubungkan dengan Caregiver
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View className="px-5 mt-4">
          <ThemedText className="text-lg font-bold mb-2">
            Koneksi {isCaregiver ? "Pasien" : "Caregiver"}
          </ThemedText>

          {connectionsLoading ? (
            <ActivityIndicator size="small" color="#008B8B" />
          ) : (
            <View className="space-y-2 gap-3">
              {connections?.map((connection) => (
                <View
                  key={connection.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <ThemedText className="font-semibold">
                    {isCaregiver
                      ? connection.users?.username
                      : connection.caregivers?.username}
                  </ThemedText>
                  <ThemedText className="text-gray-500">
                    Status: {connection.status}
                  </ThemedText>

                  {connection.status === "pending" && !isCaregiver && (
                    <View className="flex-row mt-2 space-x-2">
                      <TouchableOpacity
                        className="bg-teal-500 px-4 py-2 rounded"
                        onPress={() =>
                          handleConnectionResponse(connection.id, "accepted")
                        }
                      >
                        <ThemedText className="text-white">Terima</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-red-500 px-4 py-2 rounded"
                        onPress={() =>
                          handleConnectionResponse(connection.id, "rejected")
                        }
                      >
                        <ThemedText className="text-white">Tolak</ThemedText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
              {connections?.length === 0 && (
                <ThemedText className="text-center text-gray-500">
                  Belum ada koneksi
                </ThemedText>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Page;
