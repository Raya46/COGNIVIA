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
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import AddImage from "@/assets/images/upload-foto.png";

const GuessMeForm = () => {
  const { userData } = useAuth();
  const { mutate: createGuessMe, isLoading: isCreating } = useCreateGuessMe();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [relationship, setRelationship] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
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
      Alert.alert("Error", "Nama lengkap harus diisi");
      return;
    }

    if (!relationship) {
      Alert.alert("Error", "Hubungan harus diisi");
      return;
    }

    if (!birthDate) {
      Alert.alert("Error", "Tanggal lahir harus diisi");
      return;
    }

    if (!city) {
      Alert.alert("Error", "Kota domisili harus diisi");
      return;
    }

    // Buat array pertanyaan default dari form data
    const defaultQuestions = [
      {
        question: "Hubungan",
        answers: [relationship]
      },
      {
        question: "Tanggal Lahir",
        answers: [birthDate]
      },
      {
        question: "Kota Domisili",
        answers: [city]
      }
    ];

    // Gabungkan dengan pertanyaan tambahan jika ada
    const allQuestions = [
      ...defaultQuestions,
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
          Alert.alert("Sukses", "Data berhasil disimpan");
          router.replace("/guess-me");
        },
        onError: (error) => {
          console.error("Error creating guess me:", error);
          Alert.alert("Error", "Gagal menyimpan data");
        },
      }
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-white px-4 pt-10">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="flex-row items-center mb-6">
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

          {/* Upload Photo Section */}
          <View className="my-4">
            <ThemedText className="font-bold mb-2">Upload Foto</ThemedText>
            <TouchableOpacity
              onPress={pickImage}
              className="border-2 border-dashed border-gray-400 rounded-xl p-6 items-center"
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  className=" rounded-lg bg"
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={AddImage}
                  className=" mb-2"
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Nama Lengkap */}
          <View className="mb-1">
            <ThemedText className="text-sm mb-2">Nama Lengkap</ThemedText>
            <TextInputCustom
              name="title"
              control={controlQuestion}
              placeholder="Masukkan Nama Orang Tersebut"
              value={title}
              onChangeText={setTitle}
              className="bg-gray-50 rounded-full"
              leftIcon="person-outline"
            />
          </View>

          {/* Hubungan */}
          <View className="mb-1">
            <ThemedText className="text-sm mb-2">Hubungan</ThemedText>
            <TextInputCustom
              name="relationship"
              control={controlQuestion}
              placeholder="Masukkan Hubungan"
              value={relationship}
              onChangeText={setRelationship}
              className="bg-gray-50 rounded-full"
              leftIcon="people-outline"
            />
          </View>

          {/* Tanggal Lahir */}
          <View className="mb-1">
            <ThemedText className="text-sm mb-2">Tanggal Lahir</ThemedText>
            <TextInputCustom
              name="birthDate"
              control={controlQuestion}
              placeholder="Masukkan Tanggal Lahir"
              value={birthDate}
              onChangeText={setBirthDate}
              className="bg-gray-50 rounded-full"
              leftIcon="calendar-outline"
            />
          </View>

          {/* Kota Domisili */}
          <View className="mb-6">
            <ThemedText className="text-sm mb-2">Kota Domisili</ThemedText>
            <TextInputCustom
              name="city"
              control={controlQuestion}
              placeholder="Masukkan Nama Kota Domisili"
              value={city}
              onChangeText={setCity}
              className="bg-gray-50 rounded-full"
              leftIcon="location-outline"
            />
          </View>

          {/* Display Added Questions Section */}
          {(selectedQuestions.length > 0 || customQuestions.length > 0) && (
            <View className="mb-6">
              <ThemedText className="font-bold mb-4">Informasi Tambahan</ThemedText>
              
              {/* Display Selected Questions */}
              {selectedQuestions.map((q, index) => (
                <View key={`selected-${index}`} className="mb-4 bg-gray-50 p-4 rounded-lg">
                  <ThemedText className="font-semibold mb-2">{q.question}</ThemedText>
                  <TextInputCustom
                    name={`selected-answer-${index}`}
                    control={controlQuestion}
                    placeholder="Masukkan jawaban"
                    value={q.answer}
                    onChangeText={(text) => handleAnswerChange(q.id, q.question, text)}
                    className="bg-white rounded-full"
                  />
                </View>
              ))}

              {/* Display Custom Questions */}
              {customQuestions.map((q, index) => (
                <View key={`custom-${index}`} className="mb-4 bg-gray-50 p-4 rounded-lg">
                  <View className="flex-row justify-between items-center mb-2">
                    <ThemedText className="font-semibold">{q.question}</ThemedText>
                    <TouchableOpacity
                      onPress={() => {
                        const newQuestions = customQuestions.filter((_, i) => i !== index);
                        setCustomQuestions(newQuestions);
                      }}
                    >
                      <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  <ThemedText className="text-gray-600">{q.answer}</ThemedText>
                </View>
              ))}
            </View>
          )}
          {/* Simpan Data Button */}
          <TouchableOpacity
            onPress={handleSaveGuessMe}
            disabled={isCreating}
            className={`p-4 rounded-full mb-4 ${
              isCreating ? "bg-gray-400" : "bg-teal-500"
            }`}
          >
            {isCreating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <ThemedText className="text-white text-center font-semibold">
                Simpan Data
              </ThemedText>
            )}
          </TouchableOpacity>
          {/* Tambah Informasi Button */}
          <TouchableOpacity
            onPress={() => handleSnapPress(0)}
            className="p-4 rounded-full border border-teal-500 mb-4"
          >
            <ThemedText className="text-teal-500 text-center font-semibold">
              + Tambah Informasi Lainnya
            </ThemedText>
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
            Tambah Informasi Lainnya
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
              Tambahkan Informasi
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