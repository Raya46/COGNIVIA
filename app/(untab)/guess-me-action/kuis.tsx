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
import TextRecognition, {
  TextRecognitionScript,
} from "@react-native-ml-kit/text-recognition";

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

  const currentQuestion = questions[currentQuestionIndex];

  // Pastikan untuk mengupdate state userAnswer ketika imageText berubah
  useEffect(() => {
    if (imageText && imageText.trim() !== "") {
      setValue("answer", imageText);
      setUserAnswer(imageText);
    }
  }, [imageText, setValue]);

  const handleAnswerQuestion = (data: Answer) => {
    console.log("Handling answer submission:", data);
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

    // Tentukan jawaban mana yang akan digunakan
    const finalAnswer =
      imageText && imageText.trim() !== "" ? imageText : data.answer;

    // Update local state
    setUserAnswer(finalAnswer);
    setIsAnswered(true);

    // Check answer
    const isAnswerCorrect =
      finalAnswer.toLowerCase() === correctAnswer.answer.toLowerCase();

    setIsCorrect(isAnswerCorrect);
    console.log("Answer is correct:", isAnswerCorrect);

    // Log untuk debugging
    console.log("Submitting guess:", {
      answer_id: correctAnswer.id,
      user_id: userData.id,
      user_input: finalAnswer,
    });

    // Submit to database
    submitGuess(
      {
        answer_id: correctAnswer.id,
        user_id: userData.id,
        user_input: finalAnswer,
      },
      {
        onSuccess: (data) => {
          console.log("Answer submitted successfully:", data);
        },
        onError: (error: any) => {
          console.error("Error submitting answer:", error);
          Alert.alert("Error", error?.message || "Gagal menyimpan jawaban");
        },
      }
    );
  };

  // Saat reset form atau pindah ke pertanyaan lain, pastikan juga reset imageText dan imageUri
  const resetAllInputs = () => {
    reset({ answer: "", user_id: userData?.id });
    setIsAnswered(false);
    setIsCorrect(null);
    setUserAnswer("");
    setImageText("");
    setImageUri("");
  };

  // Handler untuk pindah ke pertanyaan berikutnya - dengan reset yang telah dimodifikasi
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetAllInputs();
    } else {
      // Quiz selesai
      Alert.alert(
        "Quiz Selesai",
        "Anda telah menyelesaikan semua pertanyaan!",
        [
          {
            text: "Kembali ke Detail",
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  // Handler untuk kembali ke pertanyaan sebelumnya - dengan reset yang telah dimodifikasi
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
        console.log(res.assets[0].uri);
        const selectedImageUri = res.assets[0].uri;
        const fileName = selectedImageUri.split("/").pop();
        const newPath = ((FileSystem.documentDirectory as string) +
          fileName) as string;

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
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <Ionicons
            name="arrow-back"
            size={24}
            color="black"
            onPress={() => router.back()}
          />
          <ThemedText className="text-lg font-semibold ml-2">
            Quiz Guess Me ({currentQuestionIndex + 1}/{questions.length})
          </ThemedText>
          <Ionicons
            name="help-circle-outline"
            size={24}
            color="black"
            className="ml-auto"
          />
        </View>

        {questions.length === 0 ? (
          <ActivityIndicator size="large" color="#2A9E9E" className="my-8" />
        ) : (
          <>
            {/* Result Banner - shown only when answered */}
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
                {!isCorrect &&
                  currentQuestion.answers &&
                  currentQuestion.answers.length > 0 && (
                    <ThemedText className="text-center text-gray-700 mt-1">
                      Jawaban yang benar: {currentQuestion.answers[0].answer}
                    </ThemedText>
                  )}
              </View>
            )}

            {/* Profile Card with Question */}
            <ProfileCard
              image_url={params.image_url as string}
              title={currentQuestion?.question || "Tidak ada pertanyaan"}
              type="kuis"
            />

            {/* Input Answer */}
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
                    editable={!isAnswered} // Disable input once answered
                  />
                </View>
              )}

              {imageUri ? (
                <View className="mt-4 mb-2">
                  <Image
                    source={{ uri: imageUri }}
                    className="w-full h-40 rounded-lg"
                    resizeMode="contain"
                  />
                </View>
              ) : null}

              {!imageText ? (
                <View>
                  <ThemedText className="text-center mt-2">Atau</ThemedText>
                  <ThemedText className="text-center font-bold text-lg my-2">
                    Jawab Dengan Tulisan Tangan
                  </ThemedText>
                  <ThemedText className="text-center">
                    Silahkan masukkan foto jawaban tulis tangan anda
                  </ThemedText>
                </View>
              ) : null}

              {/* Tombol kamera dan galeri hanya ditampilkan jika belum ada OCR atau belum jawab */}
              {!isAnswered && !imageText && (
                <View className="flex flex-row items-center justify-center gap-3 my-4">
                  <TouchableOpacity
                    onPress={openCamera}
                    className="p-4 rounded-lg flex-auto items-center bg-teal-500"
                  >
                    <Ionicons name="camera-outline" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => console.log("pick image")}
                    className="p-4 rounded-lg flex-auto items-center bg-teal-500"
                  >
                    <Ionicons name="image-outline" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            {!isAnswered ? (
              <TouchableOpacity
                className="bg-teal-500 p-3 rounded-lg mt-6"
                onPress={() => {
                  // Cek apakah ada jawaban yang valid
                  if (
                    (!userAnswer || userAnswer.trim() === "") &&
                    (!imageText || imageText.trim() === "")
                  ) {
                    Alert.alert(
                      "Peringatan",
                      "Silahkan masukkan jawaban terlebih dahulu"
                    );
                    return;
                  }

                  console.log("Submit button pressed");
                  handleSubmit((data) => {
                    console.log("Form submitted:", data);
                    handleAnswerQuestion(data);
                  })();
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
                className="border border-teal-500 p-3 rounded-lg flex-1 ml-2 items-center"
                onPress={() => router.back()}
              >
                <ThemedText className="text-teal-500 text-center font-semibold">
                  Kembali ke Detail
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Kuis;
