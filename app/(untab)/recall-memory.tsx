import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const Page = () => {
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => setRecognizing(false));
  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0]?.transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error message:", event.message);
  });

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      return;
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "id-ID",
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: false,
      contextualStrings: ["Carlsen", "Nepomniachtchi", "Praggnanandhaa"],
    });
  };
  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(true);
  const snapPoints = ["60%"];
  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
    setIsOpen(true);
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-4">
        <View className="flex flex-row items-center my-4 justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <ThemedText className="text-lg font-semibold text-center">
            Recall Memory
          </ThemedText>
          <View className="mr-4"></View>
        </View>
        <View className="flex flex-col gap-2">
          <ThemedText className="font-bold text-lg">
            "Pesta Ulang Tahun"
          </ThemedText>
          <ThemedText>25 Agustus 2024</ThemedText>
        </View>
      </View>
      <View className="rounded-lg bg-gray-100 p-6 mx-4 my-4">
        <Image
          source={{ uri: "https://picsum.photos/200/200?random=1" }}
          className="w-full h-48 rounded-lg"
          resizeMode="cover"
        />
      </View>
      <View className="bg-gray-100 p-3 rounded-lg my-4 mx-3">
        <ThemedText className="text-center">
          Tekan tombol mikrofon untuk memulai percakapan
        </ThemedText>
      </View>
      <ThemedText className="text-center">{transcript}</ThemedText>
      <View className="flex flex-row justify-between items-center mx-10 mt-10">
        <TouchableOpacity
          onPress={() => handleSnapPress(0)}
          className="rounded-full bg-gray-100 p-5"
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={28}
            color={"#2A9E9E"}
          />
        </TouchableOpacity>
        {!recognizing ? (
          <TouchableOpacity
            onPress={handleStart}
            className="rounded-full bg-[#2A9E9E] p-6 -mt-10"
          >
            <Ionicons name="mic" size={36} color={"#fff"} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => ExpoSpeechRecognitionModule.stop()}
            className="rounded-full bg-[#2A9E9E] p-6 -mt-10"
          >
            <Ionicons name="pause" size={36} color={"red"} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-full bg-gray-100 p-5"
        >
          <Ionicons name="close" size={28} color="red" />
        </TouchableOpacity>
      </View>
      <GestureHandlerRootView>
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={() => setIsOpen(false)}
          index={-1}
        >
          <BottomSheetView>
            <ThemedText className="text-center font-bold">
              recall with chat
            </ThemedText>
          </BottomSheetView>
        </BottomSheet>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default Page;
