import ProfileCard from "@/components/ProfileCard";
import TextInputCustom from "@/components/TextInputCustom";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useSubmitGuess } from "@/hooks/useGuessMe";
import { Answer, answerSchema } from "@/types/answer.type";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { launchCameraAsync } from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import TextRecognition from "@react-native-ml-kit/text-recognition";

const Kuis = () => {
  const params = useLocalSearchParams();
  const { userData } = useAuth();
  const { mutate: submitGuess, isLoading: isSubmitting } = useSubmitGuess();
  const [imageUri, setImageUri] = useState("");
  const [imageText, setImageText] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Answer>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: "",
      user_id: userData?.id || "",
    },
  });

  // Parse questions data from params
  useEffect(() => {
    if (params.questions_data) {
      try {
        const parsedQuestions = JSON.parse(
          decodeURIComponent(params.questions_data as string)
        );
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error("Error parsing questions:", error);
        Alert.alert("Error", "Gagal memuat pertanyaan");
      }
    }
  }, [params.questions_data]);

  const currentQuestion = questions[currentQuestionIndex];

  // Update userAnswer when imageText changes
  useEffect(() => {
    if (imageText && imageText.trim() !== "") {
      setValue("answer", imageText);
      setUserAnswer(imageText);
    }
  }, [imageText, setValue]);

  const handleAnswerQuestion = (data: Answer) => {
    if (!currentQuestion || !userData?.id) {
      console.log("Missing current question or user data");
      return;
    }

    const correctAnswer =
      currentQuestion.answers && currentQuestion.answers.length > 0
        ? currentQuestion.answers[0]
        : null;

    if (!correctAnswer) {
      Alert.alert("Error", "Tidak ada jawaban untuk pertanyaan ini");
      return;
    }

    const finalAnswer = imageText.trim() || data.answer.trim();
    setUserAnswer(finalAnswer);
    setIsAnswered(true);

    const isAnswerCorrect =
      finalAnswer.toLowerCase() === correctAnswer.answer.toLowerCase();
    setIsCorrect(isAnswerCorrect);

    submitGuess(
      {
        answer_id: correctAnswer.id,
        user_id: userData.id,
        user_input: finalAnswer,
      },
      {
        onSuccess: () => {
          console.log("Answer submitted successfully");
        },
        onError: (error: any) => {
          console.error("Error submitting answer:", error);
          Alert.alert("Error", error?.message || "Gagal menyimpan jawaban");
        },
      }
    );
  };

  const resetAllInputs = () => {
    reset({ answer: "", user_id: userData?.id });
    setIsAnswered(false);
    setIsCorrect(null);
    setUserAnswer("");
    setImageText("");
    setImageUri("");
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetAllInputs();
    } else {
      Alert.alert("Quiz Selesai", "Anda telah menyelesaikan semua pertanyaan!", [
        {
          text: "Kembali ke Detail",
          onPress: () => router.back(),
        },
      ]);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetAllInputs();
    }
  };

  const openCamera = async () => {
    try {
      const res = await launchCameraAsync({
        mediaTypes: "livePhotos",
        quality: 0.7,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const selectedImageUri = res.assets[0].uri;
        const fileName = selectedImageUri.split("/").pop();
        const newPath = `${FileSystem.documentDirectory}${fileName}`;

        await FileSystem.copyAsync({
          from: selectedImageUri,
          to: newPath,
        });
        setImageUri(newPath);
        const resultOcr = await TextRecognition.recognize(newPath);
        setImageText(resultOcr.text);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Gagal mengambil foto");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Ionicons
            name="arrow-back"
            size={24}
            color="black"
            onPress={() => router.back()}
          />
          <ThemedText className="text-lg font-semibold flex-1 text-center">
            Quiz Guess Me ({currentQuestionIndex + 1}/{questions.length})
          </ThemedText>
          <Ionicons name="help-circle-outline" size={24} color="black" />
        </View>

        {questions.length === 0 ? (
          <ActivityIndicator size="large" color="#2A9E9E" className="my-8" />
        ) : (
          <>
            {/* Result Banner */}
            {isAnswered && (
              <View
                className={`p-3 rounded-lg mb-4 ${
                  isCorrect ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <ThemedText
                  className={`text-center font-bold ${
                    isCorrect ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isCorrect ? "Benar!" : "Jawaban salah!"}
                </ThemedText>
                {!isCorrect && currentQuestion.answers?.[0] && (
                  <ThemedText className="text-center text-gray-700 mt-1">
                    Jawaban yang benar: {currentQuestion.answers[0].answer}
                  </ThemedText>
                )}
              </View>
            )}

            {/* Profile Card */}
            <ProfileCard
              image_url={params.image_url as string}
              title="Yuk, tebak siapa di foto ini!"
              type="kuis"
            />

            {/* Input Section */}
            <View className="bg-white p-4 rounded-xl shadow-lg mt-6">
              {imageText ? (
                <View>
                  <ThemedText className="text-lg font-bold mb-3 text-center">
                    Jawaban dari Foto
                  </ThemedText>
                  <View className="bg-gray-100 p-3 rounded-lg">
                    <ThemedText className="text-center text-lg">
                      {imageText}
                    </ThemedText>
                  </View>
                  {!isAnswered && (
                    <TouchableOpacity
                      onPress={() => {
                        setImageText("");
                        setImageUri("");
                      }}
                      className="mt-2 p-2 bg-red-100 rounded-lg"
                    >
                      <ThemedText className="text-center text-red-700">
                        Hapus & Gunakan Input Teks
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View>
                  <ThemedText className="text-lg font-bold mb-3 text-center">
                    Ketik Jawaban
                  </ThemedText>
                  <TextInputCustom
                    control={control}
                    placeholder="Masukkan jawaban anda"
                    name="answer"
                    value={userAnswer}
                    onChangeText={(text) => {
                      setValue("answer", text);
                      setUserAnswer(text);
                    }}
                    editable={!isAnswered}
                    className="rounded-full text-center"
                  />
                </View>
              )}

              {imageUri && (
                <View className="mt-4 mb-2">
                  <Image
                    source={{ uri: imageUri }}
                    className="w-full h-40 rounded-lg"
                    resizeMode="contain"
                  />
                </View>
              )}

              {!imageText && (
                <View>
                  <ThemedText className="text-center mt-2">Atau</ThemedText>
                  <ThemedText className="text-center font-bold text-lg my-2">
                    Jawab Dengan Tulisan Tangan
                  </ThemedText>
                  <ThemedText className="text-center">
                    Silahkan masukkan foto jawaban tulis tangan anda
                  </ThemedText>
                </View>
              )}

              {/* Camera Button */}
              {!isAnswered && !imageText && (
                <View className="my-4">
                  <TouchableOpacity
                    onPress={openCamera}
                    className="border-2 border-dashed border-gray-400 rounded-xl p-6 items-center"
                  >
                    <View className="items-center">
                      <ThemedText className="text-center font-bold text-lg mb-2">
                        Ambil Foto
                      </ThemedText>
                      <ThemedText className="text-center text-gray-500 mb-4">
                        Silahkan foto jawaban tulisan tangan anda
                      </ThemedText>
                      {imageUri ? (
                        <Image
                          source={{ uri: imageUri }}
                          className="w-32 h-32 rounded-lg"
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons name="camera" size={48} color="#9CA3AF" />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              {!isAnswered ? (
                <TouchableOpacity
                  className="bg-teal-500 p-3 rounded-lg mt-6"
                  onPress={() => {
                    if (!userAnswer.trim() && !imageText.trim()) {
                      Alert.alert(
                        "Peringatan",
                        "Silahkan masukkan jawaban terlebih dahulu"
                      );
                      return;
                    }
                    handleSubmit(handleAnswerQuestion)();
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <ThemedText className="text-white text-center font-semibold">
                      Jawab Pertanyaan
                    </ThemedText>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="bg-teal-500 p-3 rounded-lg mt-6"
                  onPress={handleNextQuestion}
                >
                  <ThemedText className="text-white text-center font-semibold">
                    {currentQuestionIndex < questions.length - 1
                      ? "Pertanyaan Selanjutnya"
                      : "Selesai"}
                  </ThemedText>
                </TouchableOpacity>
              )}

              {/* Navigation Buttons */}
              <View className="flex-row justify-between mt-3 mb-6">
                <TouchableOpacity
                  className="border border-teal-500 p-3 rounded-lg flex-1 mr-2"
                  onPress={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ThemedText
                    className={`text-center font-semibold ${
                      currentQuestionIndex === 0
                        ? "text-gray-400"
                        : "text-teal-500"
                    }`}
                  >
                    Pertanyaan Sebelumnya
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  className="border border-teal-500 p-3 rounded-lg flex-1 ml-2"
                  onPress={() => router.back()}
                >
                  <ThemedText className="text-teal-500 text-center font-semibold">
                    Kembali ke Detail
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Kuis;