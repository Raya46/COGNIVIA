import ScheduleCard, { ScheduleCardProps } from "@/components/ScheduleCard";
import TextInputCustom from "@/components/TextInputCustom";
import { ThemedText } from "@/components/ThemedText";
import { useCreateSchedule, useGetSchedule } from "@/hooks/useSchedule";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Schedule, scheduleSchema } from "@/types/schedule.type";
import { useAuth } from "@/context/AuthContext";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";

const ScheduleScreen = () => {
  const { userData } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset,
  } = useForm<Schedule>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      title: "",
      description: "",
      time: "",
      type: "kegiatan",
      date: selectedDate,
      user_id: userData?.id,
    },
  });

  const { schedules, isLoading } = useGetSchedule(selectedDate, userData?.id);
  const { mutate: createSchedule, isLoading: isCreating } = useCreateSchedule();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);
  const snapPoints = ["80%"];

  const handleSnapPress = useCallback(
    (index: number) => {
      reset({
        ...watch(),
        date: selectedDate,
      });
      sheetRef.current?.snapToIndex(index);
      setIsOpen(true);
    },
    [selectedDate]
  );

  const onTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(Platform.OS === "ios");
    if (date) {
      setSelectedTime(date);
      setValue("time", format(date, "HH:mm"));
    }
  };

  const onSubmit = async (data: Schedule) => {
    try {
      await createSchedule({
        ...data,
        user_id: userData?.id,
      });
      sheetRef.current?.close();
      reset();
      Alert.alert("Sukses", "Jadwal berhasil dibuat");
    } catch (error) {
      Alert.alert("Error", "Gagal membuat jadwal");
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white">
        <View className="mx-3">
          <View className="flex flex-row items-center my-4 justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <ThemedText className="text-lg font-semibold text-center">
              Jadwal Saya
            </ThemedText>
            <View className="mr-4"></View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="mx-3 flex-1"
        >
          <View className="border border-gray-300 shadow-lg rounded-lg">
            <Calendar
              current={selectedDate}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: "#14B8A6" },
              }}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setValue("date", day.dateString);
              }}
              theme={{
                selectedDayBackgroundColor: "#14B8A6",
                todayTextColor: "#14B8A6",
                arrowColor: "#14B8A6",
                borderRadius: 10,
              }}
            />
          </View>

          <ThemedText className="text-lg font-bold my-4 text-center">
            Kegiatan {format(new Date(selectedDate), "dd MMMM yyyy")}
          </ThemedText>

          {isLoading ? (
            <ActivityIndicator size="small" color="#2A9E9E" />
          ) : schedules && schedules.length > 0 ? (
            <FlatList
              data={schedules}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ScheduleCard
                  id={item.id}
                  title={item.title}
                  type={item.type}
                  time={item.time}
                  description={item.description}
                />
              )}
            />
          ) : (
            <View className="py-4">
              <ThemedText className="text-center text-gray-500">
                Tidak ada jadwal untuk tanggal ini
              </ThemedText>
            </View>
          )}
        </ScrollView>

        <View className="p-4">
          <TouchableOpacity
            onPress={() => handleSnapPress(0)}
            className="bg-[#2A9E9E] rounded-full p-3"
          >
            <View className="flex flex-row items-center justify-center gap-3">
              <Ionicons name="add" size={25} color="white" />
              <ThemedText className="text-white">Tambah Jadwal</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={() => setIsOpen(false)}
          index={-1}
        >
          <BottomSheetView className="p-4">
            <ScrollView>
              <ThemedText className="text-center text-lg font-bold mb-4">
                Buat Jadwal Baru
              </ThemedText>

              <View className="mb-4">
                <ThemedText className="font-bold mb-2">Tipe Jadwal</ThemedText>
                <View className="border border-gray-300 rounded-lg">
                  <Picker
                    selectedValue={watch("type")}
                    onValueChange={(value) => setValue("type", value)}
                  >
                    <Picker.Item label="Kegiatan" value="kegiatan" />
                    <Picker.Item label="Rutinitas" value="Rutinitas" />
                  </Picker>
                </View>
                {errors.type && (
                  <ThemedText className="text-red-500 text-sm mt-1">
                    {errors.type.message}
                  </ThemedText>
                )}
              </View>

              <View className="mb-4">
                <ThemedText className="font-bold mb-2">
                  Nama Aktifitas
                </ThemedText>
                <TextInputCustom
                  placeholder="Masukkan Nama Aktifitas"
                  name="title"
                  control={control}
                />
                {errors.title ? (
                  <ThemedText>{errors.title.message}</ThemedText>
                ) : null}
              </View>

              <View className="mb-4">
                <ThemedText className="font-bold mb-2">Deskripsi</ThemedText>
                <TextInputCustom
                  placeholder="Masukkan Deskripsi"
                  name="description"
                  control={control}
                  multiline
                  numberOfLines={3}
                />
                {errors.description ? (
                  <ThemedText>{errors.description.message}</ThemedText>
                ) : null}
              </View>

              <View className="mb-4">
                <ThemedText className="font-bold mb-2">Waktu</ThemedText>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="border border-gray-300 rounded-lg p-3"
                >
                  <ThemedText>{watch("time") || "Pilih Waktu"}</ThemedText>
                </TouchableOpacity>
                {errors.time && (
                  <ThemedText className="text-red-500 text-sm mt-1">
                    {errors.time.message}
                  </ThemedText>
                )}
              </View>

              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="default"
                  onChange={onTimeChange}
                />
              )}

              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isCreating}
                className="bg-teal-500 p-4 rounded-lg mt-4"
              >
                {isCreating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText className="text-white text-center font-bold">
                    Simpan Jadwal
                  </ThemedText>
                )}
              </TouchableOpacity>
            </ScrollView>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ScheduleScreen;
