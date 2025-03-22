import ProfileCard from "@/components/ProfileCard";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { useGetGuessMeDetail } from "@/hooks/useGuessMe";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GuessMeDetail = () => {
  const params = useLocalSearchParams();
  const { userData } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const { guessMeDetail, isLoading } = useGetGuessMeDetail(
    params.id as string,
    userData?.id
  );

  useEffect(() => {
    // Parse questions from params or use from API
    if (params.questions_data) {
      try {
        const parsedQuestions = JSON.parse(
          decodeURIComponent(params.questions_data as string)
        );
        setQuestions(parsedQuestions);
      } catch (error) {
        console.error("Error parsing questions:", error);
      }
    } else if (guessMeDetail && guessMeDetail.questions) {
      setQuestions(guessMeDetail.questions);
    }
  }, [params.questions_data, guessMeDetail]);

  const handleStartQuiz = () => {
    if (questions && questions.length > 0) {
      // Pastikan questions_data sudah terenkode dengan benar
      const questionsData = encodeURIComponent(JSON.stringify(questions));

      router.push({
        pathname: "/guess-me-action/kuis",
        params: {
          id: params.id as string,
          title: params.title as string,
          image_url: params.image_url as string,
          questions_data: questionsData,
        },
      });
    } else {
      Alert.alert("Peringatan", "Tidak ada pertanyaan untuk guess me ini");
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
            Guess Me
          </ThemedText>
          <Ionicons
            name="help-circle-outline"
            size={24}
            color="black"
            className="ml-auto"
          />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#2A9E9E" className="my-8" />
        ) : (
          <>
            {/* Profile Card */}
            <ProfileCard
              image_url={params.image_url as string}
              title={params.title as string}
              questionsLength={questions.length}
            />

            {/* Detail Informasi */}
            <View className="bg-white p-4 rounded-xl shadow-lg mt-6">
              <ThemedText className="text-lg font-semibold mb-3">
                Pertanyaan
              </ThemedText>

              {questions && questions.length > 0 ? (
                questions.map((item, index) => (
                  <View
                    key={index}
                    className="mb-3 pb-3 border-b border-gray-200"
                  >
                    <ThemedText className="font-semibold text-gray-800">
                      {index + 1}. {item.question}
                    </ThemedText>
                    <View className="ml-4 mt-1">
                      {item.answers && item.answers.length > 0 ? (
                        item.answers.map((ans: any, ansIndex: number) => (
                          <ThemedText key={ansIndex} className="text-gray-600">
                            Jawaban: {ans.answer}
                          </ThemedText>
                        ))
                      ) : (
                        <ThemedText className="text-gray-400 italic">
                          Belum ada jawaban
                        </ThemedText>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <ThemedText className="text-gray-500 italic">
                  Tidak ada pertanyaan untuk Guess Me ini
                </ThemedText>
              )}
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              className="bg-teal-500 p-3 rounded-lg mt-6"
              onPress={handleStartQuiz}
            >
              <ThemedText className="text-white text-center font-semibold">
                Mulai Kuis Guess Me
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-teal-500 p-3 rounded-lg mt-2 mb-4"
              onPress={() => router.back()}
            >
              <ThemedText className="text-teal-500 text-center font-semibold">
                Kembali
              </ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuessMeDetail;
