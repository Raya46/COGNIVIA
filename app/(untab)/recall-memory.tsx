import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useGetPostById } from "@/hooks/usePost";
import {
  useCreateRecallMemory,
  useRecallMemories,
} from "@/hooks/useRecallMemory";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const Page = () => {
  const params = useLocalSearchParams();
  const { userData } = useAuth();
  const { post, isLoading: postLoading } = useGetPostById(params.id as string);
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speaking, setSpeaking] = useState(false);

  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const startPulseAnimation = () => {
    animatedValue.setValue(0);

    pulseAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.current.start();
  };

  const stopPulseAnimation = () => {
    if (pulseAnimation.current) {
      pulseAnimation.current.stop();
    }
  };

  const pulseScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const pulseOpacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1, 0.5],
  });

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

  const speakWithAnimation = (text: string) => {
    setSpeaking(true);
    startPulseAnimation();

    Speech.speak(text, {
      language: "id-ID",
      onStart: () => {
        console.log("Speech started");
      },
      onDone: () => {
        console.log("Speech done");
        setSpeaking(false);
        stopPulseAnimation();
      },
      onStopped: () => {
        console.log("Speech stopped");
        setSpeaking(false);
        stopPulseAnimation();
      },
      onError: (error) => {
        console.error("Speech error:", error.message);
        setSpeaking(false);
        stopPulseAnimation();
      },
    });
  };

  const processQuestion = async (question: string) => {
    if (!post || !userData?.id || !question.trim()) {
      console.log("Missing required data:", {
        post,
        userId: userData?.id,
        question,
      });
      Alert.alert(
        "Error",
        "Data tidak lengkap, pastikan postingan sudah dimuat dengan benar"
      );
      return;
    }

    try {
      console.log(
        "[Production Debug] Processing question with Gemini:",
        question
      );
      console.log("[Production Debug] Post data:", JSON.stringify(post));
      console.log("[Production Debug] User ID:", userData.id);

      setAnswer("");

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout: Permintaan terlalu lama")),
          30000
        )
      );

      const result = (await Promise.race([
        createRecallMemoryMutation.mutateAsync({
          question,
          post,
          userId: userData.id,
        }),
        timeoutPromise,
      ])) as any;

      console.log(
        "[Production Debug] Gemini result received:",
        result ? "yes" : "no"
      );

      if (result && result.answer) {
        setAnswer(result.answer);
        speakWithAnimation(result.answer);
      } else {
        console.log(
          "[Production Debug] No answer in result, using fallback question"
        );

        const fallbackResult = await createRecallMemoryMutation.mutateAsync({
          question: "Bantu saya mengingat detail dari postingan ini",
          post,
          userId: userData.id,
        });

        if (fallbackResult && fallbackResult.answer) {
          setAnswer(fallbackResult.answer);
          speakWithAnimation(fallbackResult.answer);
        } else {
          Alert.alert(
            "Info",
            "Tidak dapat memproses pertanyaan saat ini, silakan coba lagi nanti"
          );
        }
      }
    } catch (error: any) {
      console.error(
        "[Production Debug] Error processing question with Gemini:",
        error
      );
      console.error(
        "[Production Debug] Error message:",
        error.message || "Unknown error"
      );

      try {
        console.log("[Production Debug] Trying fallback question");
        const fallbackResult = await createRecallMemoryMutation.mutateAsync({
          question: "Jelaskan tentang postingan ini secara singkat",
          post,
          userId: userData.id,
        });

        if (fallbackResult && fallbackResult.answer) {
          setAnswer(fallbackResult.answer);
          speakWithAnimation(fallbackResult.answer);
        } else {
          Alert.alert(
            "Error",
            "Tidak dapat menghasilkan jawaban. Silakan coba lagi nanti."
          );
        }
      } catch (fallbackError: any) {
        console.error(
          "[Production Debug] Fallback also failed:",
          fallbackError
        );

        if (
          error.message?.includes("network") ||
          error.message?.includes("timeout")
        ) {
          Alert.alert(
            "Masalah Jaringan",
            "Pastikan Anda terhubung ke internet yang stabil dan coba lagi"
          );
        } else if (
          error.message?.includes("AI") ||
          error.message?.includes("Gemini")
        ) {
          Alert.alert(
            "Masalah dengan AI",
            "Layanan AI sedang mengalami gangguan. Silakan coba lagi nanti."
          );
        } else {
          Alert.alert(
            "Error",
            "Terjadi kesalahan saat memproses. Silakan coba lagi atau gunakan pertanyaan yang berbeda."
          );
        }
      }
    }
  };

  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(true);
  const snapPoints = ["60%"];
  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    return () => {
      if (speaking) {
        Speech.stop();
        stopPulseAnimation();
      }
    };
  }, [speaking]);

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
            <ThemedText>
              {new Date(params.created_at || post?.created_at).toLocaleString(
                "id-ID"
              )}
            </ThemedText>
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

        {speaking && (
          <View className="items-center mt-2 mb-2">
            <View className="flex-row items-center">
              <Animated.View
                style={{
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                }}
                className="bg-teal-500 h-3 w-3 rounded-full mx-0.5"
              />
              <Animated.View
                style={{
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                  animationDelay: "300ms",
                }}
                className="bg-teal-500 h-3 w-3 rounded-full mx-0.5"
              />
              <Animated.View
                style={{
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                  animationDelay: "600ms",
                }}
                className="bg-teal-500 h-3 w-3 rounded-full mx-0.5"
              />
              <ThemedText className="text-teal-600 ml-2">
                Berbicara...
              </ThemedText>
            </View>
          </View>
        )}

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
              disabled={speaking}
            >
              <Ionicons
                name="mic"
                size={36}
                color={speaking ? "#ccc" : "#fff"}
              />
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
            onPress={() => {
              if (speaking) {
                Speech.stop();
                setSpeaking(false);
                stopPulseAnimation();
              }
              router.back();
            }}
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
          <BottomSheetScrollView
            className="p-4"
            showsVerticalScrollIndicator={false}
          >
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
            {historyLoading ? (
              <ActivityIndicator size="small" color="#2A9E9E" />
            ) : (
              <FlatList
                scrollEnabled={false}
                data={chatHistory}
                renderItem={({ item, index }) => (
                  <View
                    key={item.id || index}
                    className="bg-gray-50 p-4 rounded-lg mb-2"
                  >
                    <ThemedText className="font-bold">
                      Q: {item.question}
                    </ThemedText>
                    <ThemedText className="mt-2">A: {item.answer}</ThemedText>
                    <ThemedText className="text-xs text-gray-500 mt-2">
                      {new Date(item.created_at).toLocaleString("id-ID")}
                    </ThemedText>
                  </View>
                )}
              />
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default Page;
