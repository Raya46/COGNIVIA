import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Image,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useGetPostById } from "@/hooks/usePost";
import { useAuth } from "@/context/AuthContext";
import {
  useCreateRecallMemory,
  useRecallMemories,
} from "@/hooks/useRecallMemory";
import * as Speech from "expo-speech";
const Page = () => {
  const params = useLocalSearchParams();
  const { userData } = useAuth();
  const { post, isLoading: postLoading } = useGetPostById(params.id as string);
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  // Menggunakan hooks TanStack Query
  const createRecallMemoryMutation = useCreateRecallMemory();
  const { data: chatHistory = [], isLoading: historyLoading } =
    useRecallMemories(params.id as string);

  const [answer, setAnswer] = useState("");

  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    setTranscript("");
  });

  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    if (transcript.trim()) {
      processQuestion(transcript);
    }
  });

  useSpeechRecognitionEvent("result", (event) => {
    const newTranscript = event.results[0]?.transcript;
    if (newTranscript) {
      setTranscript(newTranscript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error message:", event.message);
    setRecognizing(false);
    Alert.alert("Error", "Terjadi kesalahan pada speech recognition");
  });

  const handleStart = async () => {
    try {
      const result =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert("Izin Diperlukan", "Aplikasi membutuhkan izin mikrofon");
        return;
      }

      setTranscript("");
      setAnswer("");

      await ExpoSpeechRecognitionModule.start({
        lang: "id-ID",
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
      });
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      Alert.alert("Error", "Gagal memulai speech recognition");
    }
  };

  const handleStop = async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  const processQuestion = async (question: string) => {
    if (!post || !userData?.id || !question.trim()) {
      console.log("Missing required data:", {
        post,
        userId: userData?.id,
        question,
      });
      return;
    }

    try {
      console.log("Processing question:", question);
      const result = await createRecallMemoryMutation.mutateAsync({
        question,
        post,
        userId: userData.id,
      });

      if (result.answer) {
        setAnswer(result.answer);
        Speech.speak(result.answer, {
          language: "id-ID",
          onError: (error) => console.error("Speech error:", error),
        });
      }
    } catch (error) {
      console.error("Error processing question:", error);
      Alert.alert("Error", "Terjadi kesalahan saat memproses pertanyaan");
    }
  };

  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(true);
  const snapPoints = ["60%"];
  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
    setIsOpen(true);
  }, []);

  return (
    <GestureHandlerRootView>
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
              {params.title || post?.title}
            </ThemedText>
            <ThemedText>{params.created_at || post?.created_at}</ThemedText>
          </View>
        </View>
        <View className="rounded-lg bg-gray-100 p-6 mx-4 my-4">
          <Image
            source={{ uri: params.image_url || post?.image_url }}
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
              onPress={handleStop}
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
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={() => setIsOpen(false)}
          index={-1}
        >
          <BottomSheetView className="p-4">
            <ThemedText className="text-center font-bold mb-4">
              Riwayat Percakapan
            </ThemedText>

            {createRecallMemoryMutation.isPending && (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#2A9E9E" />
                <ThemedText className="mt-2">
                  Memproses pertanyaan...
                </ThemedText>
              </View>
            )}

            {answer && (
              <View className="bg-teal-50 p-4 rounded-lg mb-4">
                <ThemedText className="font-bold">
                  Pertanyaan Terakhir:
                </ThemedText>
                <ThemedText className="mt-2">{transcript}</ThemedText>
                <ThemedText className="font-bold mt-4">Jawaban:</ThemedText>
                <ThemedText className="mt-2">{answer}</ThemedText>
              </View>
            )}

            <ScrollView>
              {historyLoading ? (
                <ActivityIndicator size="small" color="#2A9E9E" />
              ) : (
                chatHistory.map((chat, index) => (
                  <View
                    key={chat.id || index}
                    className="bg-gray-50 p-4 rounded-lg mb-2"
                  >
                    <ThemedText className="font-bold">
                      Q: {chat.question}
                    </ThemedText>
                    <ThemedText className="mt-2">A: {chat.answer}</ThemedText>
                    <ThemedText className="text-xs text-gray-500 mt-2">
                      {new Date(chat.created_at).toLocaleString("id-ID")}
                    </ThemedText>
                  </View>
                ))
              )}
            </ScrollView>
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Page;
