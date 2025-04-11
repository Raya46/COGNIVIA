import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
export default function QuizResultsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          headerTitle: "",
          headerShadowVisible: false,
        }}
      />

      <View className="flex-1 px-4 justify-center items-center">
        <Text className="text-2xl font-bold text-center mb-4">
          Terima Kasih!
        </Text>
        <Text className="text-gray-600 text-center mb-8 px-4">
          Jawaban Anda telah kami terima. Tim kami akan menghubungi Anda untuk proses selanjutnya.
        </Text>

        <TouchableOpacity
          className="w-full bg-teal-500 rounded-full py-4 px-6"
          onPress={() => router.push('/home' as any)}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Mulai
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 