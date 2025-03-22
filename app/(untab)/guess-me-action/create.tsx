import TextInputCustom from "@/components/TextInputCustom";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useCreateGuessMe, useGetQuestion } from "@/hooks/useGuessMe";
import { Answer, answerSchema } from "@/types/answer.type";
import { Question, questionSchema } from "@/types/question.type";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { zodResolver } from "@hookform/resolvers/zod";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import AddImage from "@/assets/images/add-image.png";

const GuessMeForm = () => {
  const { userData } = useAuth();
  const { data: questionsData, isLoading: loadingQuestion } = useGetQuestion();
  const { mutate: createGuessMe, isLoading: isCreating } = useCreateGuessMe();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<
    Array<{ id: string; question: string; answer: string }>
  >([]);
  const [customQuestions, setCustomQuestions] = useState<
    Array<{ question: string; answer: string }>
  >([]);

  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(false);
  const snapPoints = ["60%"];

  const {
    control: controlQuestion,
    handleSubmit: handleSubmitQuestion,
    reset: resetQuestion,
    formState: { errors: errorsQuestion },
  } = useForm<Question>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: "",
    },
  });

  const {
    control: controlAnswer,
    handleSubmit: handleSubmitAnswer,
    reset: resetAnswer,
    formState: { errors: errorsAnswer },
  } = useForm<Answer>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answer: "",
      user_id: userData?.id || "",
    },
  });

  useEffect(() => {
    if (userData?.id) {
      resetAnswer({ answer: "", user_id: userData.id });
    }
  }, [userData]);

  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
    setIsOpen(true);
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const selectedImageUri = result.assets[0].uri;
        const fileName = selectedImageUri.split("/").pop();
        const newPath = ((FileSystem.documentDirectory as string) +
          fileName) as string;

        await FileSystem.copyAsync({
          from: selectedImageUri,
          to: newPath,
        });

        setImageUri(newPath);
      } catch (error) {
        console.error("Error copying image:", error);
        Alert.alert("Error", "Gagal mengupload gambar");
      }
    }
  };

  const handleAnswerChange = (id: string, question: string, answer: string) => {
    const existingIndex = selectedQuestions.findIndex((q) => q.id === id);

    if (existingIndex >= 0) {
      const updatedQuestions = [...selectedQuestions];
      updatedQuestions[existingIndex].answer = answer;
      setSelectedQuestions(updatedQuestions);
    } else {
      setSelectedQuestions([...selectedQuestions, { id, question, answer }]);
    }
  };

  const toggleQuestionSelection = (id: string, question: string) => {
    const existingIndex = selectedQuestions.findIndex((q) => q.id === id);

    if (existingIndex >= 0) {
      const updatedQuestions = selectedQuestions.filter((q) => q.id !== id);
      setSelectedQuestions(updatedQuestions);
    } else {
      setSelectedQuestions([
        ...selectedQuestions,
        { id, question, answer: "" },
      ]);
    }
  };

  const onSubmitCustomQuestion = (
    questionData: Question,
    answerData: Answer
  ) => {
    if (!questionData.question || !answerData.answer) {
      Alert.alert("Error", "Pertanyaan dan jawaban harus diisi");
      return;
    }

    setCustomQuestions([
      ...customQuestions,
      { question: questionData.question, answer: answerData.answer },
    ]);

    resetQuestion();
    resetAnswer({ answer: "", user_id: userData?.id || "" });

    sheetRef.current?.close();
    Alert.alert("Sukses", "Pertanyaan berhasil ditambahkan");
  };

  const handleSaveGuessMe = () => {
    if (!imageUri) {
      Alert.alert("Error", "Silakan pilih gambar terlebih dahulu");
      return;
    }

    if (!title) {
      Alert.alert("Error", "Judul guess me harus diisi");
      return;
    }

    if (selectedQuestions.length === 0 && customQuestions.length === 0) {
      Alert.alert("Error", "Minimal 1 pertanyaan harus dipilih");
      return;
    }

    const allQuestions = [
      ...selectedQuestions.map((q) => ({
        question: q.question,
        answers: [q.answer],
      })),
      ...customQuestions.map((q) => ({
        question: q.question,
        answers: [q.answer],
      })),
    ];

    createGuessMe(
      {
        image: imageUri,
        title: title,
        user_id: userData?.id as string,
        questions: allQuestions,
      },
      {
        onSuccess: () => {
          Alert.alert("Sukses", "Guess Me berhasil dibuat");
          router.replace("/guess-me");
        },
        onError: (error) => {
          console.error("Error creating guess me:", error);
          console.log(error);
          Alert.alert("Error", "Gagal membuat Guess Me");
        },
      }
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white px-4 pt-4">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center my-4">
            <Ionicons
              onPress={() => router.back()}
              name="arrow-back"
              size={24}
              color="black"
            />
            <ThemedText className="text-lg font-semibold ml-2">
              Tambahkan Data Guess Me
            </ThemedText>
          </View>

          {/* Title Input */}
          <View className="my-4">
            <ThemedText className="font-bold mb-2">Judul Guess Me</ThemedText>
            <TextInputCustom
              name="title"
              control={controlQuestion}
              placeholder="Masukkan judul guess me"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Upload Image */}
          <View className="my-4">
            <ThemedText className="font-bold mb-2">Upload Gambar</ThemedText>
            <TouchableOpacity
              onPress={pickImage}
              className="border-2 border-dashed border-gray-400 rounded-xl p-6 items-center"
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  className="w-full h-40 rounded-lg"
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={AddImage}
                  className="w-full h-20 mb-2"
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickImage}
              className="bg-teal-500 p-3 rounded-lg mt-4"
            >
              <ThemedText className="text-white text-center font-semibold">
                Buka Galeri
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Question List */}
          <View className="my-4">
            <ThemedText className="font-bold mb-2">Pilih Pertanyaan</ThemedText>

            {loadingQuestion ? (
              <ActivityIndicator size="small" color="#2A9E9E" />
            ) : questionsData && questionsData.length > 0 ? (
              <FlatList
                data={questionsData}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isSelected = selectedQuestions.some(
                    (q) => q.id === item.id
                  );
                  const selectedItem = selectedQuestions.find(
                    (q) => q.id === item.id
                  );

                  return (
                    <View className="mb-4 border border-gray-200 rounded-lg p-3">
                      <View className="flex-row items-center">
                        <TouchableOpacity
                          onPress={() =>
                            toggleQuestionSelection(item.id, item.question)
                          }
                          className="flex-row items-center"
                        >
                          <Ionicons
                            name={isSelected ? "checkbox" : "square-outline"}
                            size={24}
                            color={isSelected ? "#2A9E9E" : "gray"}
                          />
                          <ThemedText className="ml-2 font-medium">
                            {item.question}
                          </ThemedText>
                        </TouchableOpacity>
                      </View>

                      {isSelected && (
                        <View className="mt-2">
                          <TextInputCustom
                            placeholder={`Masukkan Jawaban untuk ${item.question}`}
                            name="answer"
                            control={controlAnswer}
                            value={selectedItem?.answer || ""}
                            onChangeText={(text) =>
                              handleAnswerChange(item.id, item.question, text)
                            }
                          />
                        </View>
                      )}
                    </View>
                  );
                }}
              />
            ) : (
              <ThemedText className="text-gray-500 text-center py-4">
                Belum ada pertanyaan tersedia
              </ThemedText>
            )}
          </View>

          {/* Custom Questions Preview */}
          {customQuestions.length > 0 && (
            <View className="my-4">
              <ThemedText className="font-bold mb-2">
                Pertanyaan Tambahan
              </ThemedText>
              {customQuestions.map((item, index) => (
                <View
                  key={index}
                  className="mb-4 border border-gray-200 rounded-lg p-3 flex flex-row justify-between items-center"
                >
                  <View className="flex flex-col ">
                    <ThemedText className="font-bold">
                      {item.question}
                    </ThemedText>
                    <ThemedText className="text-gray-500 mt-1">
                      Jawaban: {item.answer}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setCustomQuestions(
                        customQuestions.filter((_, i) => i !== index)
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Button Tambah Informasi */}
          <TouchableOpacity
            onPress={() => handleSnapPress(0)}
            className="flex-row items-center justify-center border p-3 rounded-lg border-teal-500 mt-4"
          >
            <Ionicons name="add-circle-outline" size={20} color="teal" />
            <ThemedText className="text-teal-500 ml-2 font-semibold">
              Tambah Pertanyaan Lainnya
            </ThemedText>
          </TouchableOpacity>

          {/* Button Simpan */}
          <TouchableOpacity
            onPress={handleSaveGuessMe}
            disabled={isCreating}
            className={`p-3 rounded-lg mt-4 mb-8 ${
              isCreating ? "bg-gray-400" : "bg-teal-500"
            }`}
          >
            {isCreating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <ThemedText className="text-white text-center font-semibold">
                Simpan Guess Me
              </ThemedText>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={() => setIsOpen(false)}
        index={-1}
      >
        <BottomSheetView className="p-4">
          <ThemedText className="text-center font-bold mb-4">
            Tambah Pertanyaan Baru
          </ThemedText>

          <ThemedText className="font-bold mb-1">Pertanyaan</ThemedText>
          <TextInputCustom
            name="question"
            control={controlQuestion}
            placeholder="Masukkan pertanyaan baru"
          />
          {errorsQuestion.question && (
            <Text className="text-red-500 text-sm">
              {errorsQuestion.question.message}
            </Text>
          )}

          <ThemedText className="font-bold mb-1 mt-4">Jawaban</ThemedText>
          <TextInputCustom
            name="answer"
            control={controlAnswer}
            placeholder="Masukkan jawaban yang benar"
          />
          {errorsAnswer.answer && (
            <Text className="text-red-500 text-sm">
              {errorsAnswer.answer.message}
            </Text>
          )}

          <TouchableOpacity
            onPress={() => {
              handleSubmitQuestion((data) => {
                handleSubmitAnswer((answerData) => {
                  onSubmitCustomQuestion(data, answerData);
                })();
              })();
            }}
            className="bg-teal-500 p-3 rounded-lg mt-4"
          >
            <ThemedText className="text-white text-center font-semibold">
              Tambahkan Pertanyaan
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => sheetRef.current?.close()}
            className="border border-teal-500 p-3 rounded-lg mt-4"
          >
            <ThemedText className="text-teal-500 text-center font-semibold">
              Kembali
            </ThemedText>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

export default GuessMeForm;
