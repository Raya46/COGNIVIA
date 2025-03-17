import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";

const familyMembers = ["Ega", "Faris", "Vio", "Dhifan", "Gopal", "Aiman"];
const initialTags = ["Kue", "Pagi", "Bahagia"];

const PostingScreen = () => {
  const [tags, setTags] = useState(initialTags);
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScrollView>
        {/* Header */}
        <View className="flex-row items-center my-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <ThemedText className="text-lg font-semibold ml-4">
            Tambahkan Data Scenario
          </ThemedText>
        </View>

        {/* Input Judul Foto */}
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2">Judul Foto</ThemedText>
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
            <Ionicons name="image-outline" size={20} color="gray" />
            <TextInput
              placeholder="Masukkan Judul Foto"
              className="flex-1 ml-2 text-gray-700"
            />
          </View>
        </View>

        {/* Input Captions */}
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2">Captions</ThemedText>
          <View className="flex-row items-start border border-gray-300 rounded-lg px-3 py-2">
            <Ionicons name="chatbox-ellipses-outline" size={20} color="gray" />
            <TextInput
              placeholder="Masukkan Captions"
              multiline
              className="flex-1 ml-2 text-gray-700 h-20"
            />
          </View>
        </View>

        {/* Input Tanggal Foto */}
        <View className="mt-4">
          <ThemedText className="text-gray-700 mb-2">Tanggal Foto</ThemedText>
          <TouchableOpacity className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
            <Ionicons name="calendar-outline" size={20} color="gray" />
            <ThemedText className="flex-1 ml-2 text-gray-700">
              Pilih Tanggal
            </ThemedText>
            <Ionicons name="add" size={20} color="gray" />
          </TouchableOpacity>
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
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 mt-2">
            <Ionicons name="pricetag-outline" size={20} color="gray" />
            <TextInput
              placeholder="Masukkan Kata Memori"
              value={newTag}
              onChangeText={setNewTag}
              className="flex-1 ml-2 text-gray-700"
            />
            <TouchableOpacity onPress={addTag}>
              <Ionicons name="add" size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tombol Mengunggah */}
        <TouchableOpacity
          onPress={() => router.replace("/home")}
          className="mt-6 bg-teal-500 p-3 rounded-lg items-center"
        >
          <ThemedText className="text-white text-lg font-semibold">
            Mengunggah
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PostingScreen;
