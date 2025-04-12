import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useGetPostById } from "@/hooks/usePost";
import {
  useCreateRecallMemory,
  useRecallMemories,
} from "@/hooks/useRecallMemory";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
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
  const [sound, setSound] = useState<Audio.Sound | null>(null);

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

  const unloadSound = async () => {
    if (sound) {
      console.log("Unloading Sound");
      await sound.unloadAsync();
      setSound(null); // Clear the sound state
    }
  };

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

  const speakWithAnimation = async (text: string) => {
    if (speaking || !text) return; // Prevent concurrent speech or empty text

    setSpeaking(true);
    startPulseAnimation();
    await unloadSound(); // Unload previous sound if any

    const XI_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY; // Replace with your actual key (use env vars ideally)
    const VOICE_ID = "TMvmhlKUioQA4U7LOoko";

    if (!XI_API_KEY) {
      Alert.alert("Error", "API key for ElevenLabs is missing.");
      setSpeaking(false);
      stopPulseAnimation();
      return;
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
    const headers: Record<string, string> = {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
      "xi-api-key": XI_API_KEY,
    };
    const body = JSON.stringify({
      text: text,
      model_id: "eleven_multilingual_v2", // Or another suitable model
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    });

    try {
      console.log("Requesting TTS from ElevenLabs...");
      const response = await fetch(url, { method: "POST", headers, body });
      console.log("TTS Response Status:", response.status); // <-- Add logging

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("ElevenLabs API Error Body:", errorBody); // <-- Log error body
        throw new Error(
          `ElevenLabs API Error: ${response.status} - ${errorBody}`
        );
      }

      // --- Process the audio blob ---
      console.log("Processing audio blob...");
      const audioBlob = await response.blob();
      // Log blob details
      console.log("Audio Blob received:", {
        size: audioBlob.size,
        type: audioBlob.type,
      });

      if (audioBlob.size === 0) {
        console.error("Received empty audio blob from API.");
        throw new Error("Empty audio data received.");
      }

      // Instead of checking for type strictly, only throw if the blob type is set and not audio.
      if (audioBlob.type && !audioBlob.type.startsWith("audio/")) {
        console.error(`Received blob of unexpected type: ${audioBlob.type}`);
        throw new Error(
          `Expected audio blob, but received type ${audioBlob.type}`
        );
      }

      const reader = new FileReader();

      reader.onloadend = async () => {
        console.log("FileReader onloadend triggered.");
        let base64data = reader.result as string;
        console.log(
          "Raw reader result (first 100 chars):",
          base64data?.substring(0, 100)
        );

        // If result doesn't start with "data:audio/", check other possibilities
        if (!base64data.startsWith("data:audio/")) {
          if (base64data.startsWith("data:application/octet-stream")) {
            // Replace octet-stream with the desired audio MIME type (e.g., audio/mpeg)
            base64data = base64data.replace(
              "data:application/octet-stream",
              "data:audio/mpeg"
            );
            console.log(
              "Replaced application/octet-stream with data:audio/mpeg."
            );
          } else if (base64data.startsWith("data:;base64")) {
            // Handle missing mime type
            base64data = base64data.replace(
              "data:;base64",
              "data:audio/mpeg;base64"
            );
            console.log("Replaced empty mime type with data:audio/mpeg.");
          } else {
            console.error(
              "Failed to read audio data correctly. Result was not a valid audio data URI.",
              `Type: ${typeof base64data}, StartsWith 'data:audio/': ${base64data?.startsWith(
                "data:audio/"
              )}`
            );
            Alert.alert(
              "Error",
              "Gagal memproses data audio dari respons API."
            );
            setSpeaking(false);
            stopPulseAnimation();
            return;
          }
        }

        console.log("Base64 data seems valid, creating sound object...");
        try {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: base64data },
            { shouldPlay: true },
            (status) => {
              if (!status.isLoaded) {
                if (status.error) {
                  console.error(`Playback Error: ${status.error}`);
                  setSpeaking(false);
                  stopPulseAnimation();
                  unloadSound();
                  Alert.alert("Error", `Gagal memutar suara: ${status.error}`);
                }
              } else {
                if (status.didJustFinish) {
                  console.log("Playback finished successfully.");
                  setSpeaking(false);
                  stopPulseAnimation();
                  unloadSound();
                }
              }
            }
          );
          setSound(newSound);
          console.log("Playing Sound");
        } catch (playbackError: any) {
          console.error(
            "Error creating or playing sound:",
            playbackError.message
          );
          Alert.alert("Error", "Gagal memutar suara setelah diunduh.");
          setSpeaking(false);
          stopPulseAnimation();
        }
      };

      reader.onerror = (event) => {
        console.error("FileReader error event:", event);
        if (reader.error) {
          console.error("FileReader specific error:", reader.error);
        }
        throw new Error(
          `FileReader failed to read blob: ${
            reader.error?.message || "Unknown error"
          }`
        );
      };

      console.log("Calling reader.readAsDataURL...");
      reader.readAsDataURL(audioBlob);
      console.log("Started reading blob as Data URL...");
      // --- End audio processing ---
    } catch (error: any) {
      console.error("Error during ElevenLabs TTS or playback:", error.message);
      Alert.alert("Error", `Gagal memutar suara: ${error.message}`);
      setSpeaking(false);
      stopPulseAnimation();
      // Ensure sound is unloaded in case of error during setup
      await unloadSound();
    }
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
        console.log(result.answer);
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
      // Existing cleanup
      if (speaking) {
        handleStopSpeaking(); // Use the new stop function
        stopPulseAnimation();
      }
      unloadSound(); // Ensure sound is unloaded on unmount
    };
  }, [speaking, sound]);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }); // Ensure playback works in silent mode (iOS)
    return () => {
      unloadSound(); // Cleanup on unmount
    };
  }, [sound]);

  const handleStopSpeaking = async () => {
    if (speaking && sound) {
      console.log("Stopping playback...");
      await sound.stopAsync();
      // Playback status listener should handle state updates (speaking, animation)
    }
    // If you were using expo-speech, you might need:
    // Speech.stop();
  };

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
                }}
                className="bg-teal-500 h-3 w-3 rounded-full mx-0.5"
              />
              <Animated.View
                style={{
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
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
              handleStopSpeaking();
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
