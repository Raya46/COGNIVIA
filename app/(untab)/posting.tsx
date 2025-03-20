import TextInputCustom from "@/components/TextInputCustom";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/hooks/usePost";
import { Post, postSchema } from "@/types/post.type";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
const initialTags = ["Kue", "Pagi", "Bahagia"];
const familyMembers = ["Ega", "Faris", "Vio", "Dhifan", "Gopal", "Aiman"];

const PostingScreen = () => {
  const { userData } = useAuth();
  const { selectedImage } = useLocalSearchParams();
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const { mutate: createPost, isLoading } = useCreatePost();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<Post>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      caption: "",
      image_date: format(new Date(), "yyyy-MM-dd"),
      memory_word: "",
      user_id: userData?.id,
      image: selectedImage as string,
    },
  });

  // Pantau nilai tanggal
  const watchedDate = watch("image_date");

  // Fungsi untuk menangani perubahan tanggal
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");

    if (date) {
      setSelectedDate(date);
      setValue("image_date", format(date, "yyyy-MM-dd"));
    }
  };

  // Tampilkan date picker
  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  // Format tanggal untuk ditampilkan
  const getFormattedDate = () => {
    if (!watchedDate) return "Pilih Tanggal";

    try {
      const date = new Date(watchedDate);
      return format(date, "EEEE, d MMMM yyyy", { locale: id });
    } catch (error) {
      return "Pilih Tanggal";
    }
  };

  const onSubmit = (data: Post) => {
    console.log(data);
    const postData = {
      ...data,
      memory_word: tags.join(","),
      image: selectedImage as string,
    };
    createPost(postData, {
      onError: (error: any) => {
        const errorMsg =
          error.response?.data?.message || "Invalid username or password";

        setErrorMessage(errorMsg);
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center my-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <ThemedText className="text-lg font-semibold ml-4">
            Tambahkan Data Scenario
          </ThemedText>
        </View>

        {/* Preview Image */}
        {selectedImage && (
          <View className="mt-2 mb-4">
            <Image
              source={{ uri: selectedImage as string }}
              className="w-full h-48 rounded-lg"
              resizeMode="contain"
            />
          </View>
        )}

        {/* Input Judul Foto */}
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2">Judul Foto</ThemedText>
          <TextInputCustom
            name="title"
            control={control}
            placeholder="Masukkan Judul Foto"
          />
        </View>

        {/* Input caption */}
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2">caption</ThemedText>
          <TextInputCustom
            name="caption"
            control={control}
            placeholder="Masukkan caption"
            multiline
            className="min-h-[100px] text-gray-700"
          />
        </View>

        {/* Input Tanggal Foto */}
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2">Tanggal Foto</ThemedText>
          <Controller
            control={control}
            name="image_date"
            render={({ field: { value } }) => (
              <TouchableOpacity
                onPress={showDatepicker}
                className="flex-row items-center border border-gray-300 rounded-lg p-3"
              >
                <Ionicons name="calendar-outline" size={20} color="gray" />
                <ThemedText className="flex-1 ml-2 text-gray-700">
                  {getFormattedDate()}
                </ThemedText>
                <Ionicons name="chevron-down" size={20} color="gray" />
              </TouchableOpacity>
            )}
          />

          {/* DateTimePicker */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Anggota Keluarga */}
        <View className="mt-6">
          <ThemedText className="text-gray-700 mb-2">
            Anggota Keluarga
          </ThemedText>
          <View className="flex-row flex-wrap gap-2">
            {familyMembers.map((name, index) => (
              <TouchableOpacity
                key={index}
                className={`px-4 py-2 rounded-lg ${
                  index % 2 === 0 ? "bg-teal-500" : "bg-gray-300"
                }`}
              >
                <ThemedText className="text-white font-medium">
                  {name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Kata Memori */}
        <View className="mt-6">
          <ThemedText className="text-gray-700 mb-2">Kata Memori</ThemedText>
          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag, index) => (
              <View
                key={index}
                className="flex-row items-center bg-teal-100 px-3 py-2 rounded-lg"
              >
                <ThemedText className="text-teal-700">{tag}</ThemedText>
                <TouchableOpacity
                  onPress={() => removeTag(tag)}
                  className="ml-2"
                >
                  <Ionicons name="close-circle" size={16} color="teal" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View className="flex-row items-center mt-2">
            <TouchableOpacity onPress={addTag}>
              <Ionicons name="add" size={24} color="gray" />
            </TouchableOpacity>
            <TextInputCustom
              name="memory_word"
              control={control}
              placeholder="Masukkan Kata Memori"
              value={newTag}
              onChangeText={setNewTag}
              className="ml-2 text-gray-700"
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="mt-6 mb-8 bg-teal-500 p-3 rounded-lg items-center"
          disabled={isLoading}
        >
          <ThemedText className="text-white text-lg font-semibold">
            {isLoading ? "Sedang Mengunggah..." : "Mengunggah"}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PostingScreen;
