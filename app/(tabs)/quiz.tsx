import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import StartQuiz from "@/assets/images/hospital-family-visit.png";

export default function QuizScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View className="flex-1 items-center justify-between px-4 pb-8">
        <View className="flex-1 items-center justify-center">
          <Image
            source={StartQuiz}
            className="w-72 h-72"
            resizeMode="contain"
          />
          
          <Text className="text-2xl font-bold text-center mt-6 mb-2">
            Kuis Singkat untuk Calon Caregiver
          </Text>
          
          <Text className="text-gray-600 text-center px-4 mb-8">
            Tes ini akan menguji pengetahuan dasar Anda sebagai caregiver. Harap jawab dengan jujur dan teliti.
          </Text>
        </View>

        <TouchableOpacity 
        className="w-full bg-teal-500 rounded-full py-4 px-6"
        onPress={() => router.push('/(untab)/caregiver-quiz/questions')}
      >
        <Text className="text-white text-center font-semibold text-lg">
          Mulai Kuis
        </Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}