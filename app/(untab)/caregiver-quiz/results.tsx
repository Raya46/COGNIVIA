import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemedText } from "@/components/ThemedText";
import Svg, { Circle } from "react-native-svg";

// Komponen CircularProgress
const CircularProgress = ({ level }: { level: number }) => {
  const size = Dimensions.get("window").width * 0.4; // 40% dari lebar layar
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (level / 5) * circumference; // level 5 adalah maksimum
  const progressColor = getProgressColor(level);

  return (
    <View className="items-center justify-center">
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <View className="absolute items-center">
        <ThemedText
          className="text-3xl font-bold"
          style={{ color: progressColor }}
        >
          {level}
        </ThemedText>
        <ThemedText className="text-sm text-gray-600">dari 5</ThemedText>
      </View>
    </View>
  );
};

// Fungsi untuk menentukan warna berdasarkan level
const getProgressColor = (level: number) => {
  if (level <= 1) return "#10B981"; // Hijau untuk level rendah
  if (level <= 2) return "#3B82F6"; // Biru untuk level ringan
  if (level <= 3) return "#F59E0B"; // Kuning untuk level sedang
  if (level <= 4) return "#EF4444"; // Merah untuk level tinggi
  return "#DC2626"; // Merah tua untuk level sangat tinggi
};

export default function QuizResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const analysisResult = params.analysisResult
    ? JSON.parse(params.analysisResult as string)
    : null;

  const getLevelDescription = (level: number) => {
    const descriptions = {
      0: "Tidak ada indikasi demensia",
      1: "Indikasi sangat ringan",
      2: "Demensia ringan",
      3: "Demensia sedang",
      4: "Demensia menengah-berat",
      5: "Demensia berat",
    };
    return descriptions[level] || "Level tidak teridentifikasi";
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          headerTitle: "Hasil Analisis",
          headerShadowVisible: false,
        }}
      />

      <ScrollView className="flex-1 px-4 py-6">
        {analysisResult ? (
          <View className="space-y-6">
            <View className="bg-teal-50 p-4 rounded-lg">
              <ThemedText className="text-xl font-bold text-teal-800 mb-4 text-center">
                Level Demensia
              </ThemedText>

              {/* Circular Progress */}
              <View className="items-center mb-4">
                <CircularProgress
                  level={analysisResult.dementiaAssessment.level}
                />
              </View>

              <ThemedText className="text-lg text-teal-700 text-center mt-4">
                {getLevelDescription(analysisResult.dementiaAssessment.level)}
              </ThemedText>
            </View>

            <View className="space-y-4 p-3">
              <ThemedText className="text-lg font-bold">
                Gejala Utama:
              </ThemedText>
              {analysisResult.dementiaAssessment.mainSymptoms.map(
                (symptom: string, index: number) => (
                  <ThemedText key={index} className="text-gray-700">
                    • {symptom}
                  </ThemedText>
                )
              )}
            </View>

            <View className="space-y-4 p-3">
              <ThemedText className="text-lg font-bold">
                Evaluasi Caregiver:
              </ThemedText>
              <ThemedText>
                {analysisResult.caregiverEvaluation.perawatDiperiksa}
              </ThemedText>
              <ThemedText>
                {analysisResult.caregiverEvaluation.penyandangDitest}
              </ThemedText>
              <ThemedText>
                {analysisResult.caregiverEvaluation.aksesFaskes}
              </ThemedText>
            </View>

            <View className="space-y-4 p-3">
              <ThemedText className="text-lg font-bold">
                Rekomendasi Tindakan:
              </ThemedText>
              {analysisResult.summary.urgentActions.map(
                (action: string, index: number) => (
                  <ThemedText key={index} className="text-gray-700">
                    • {action}
                  </ThemedText>
                )
              )}
            </View>

            {analysisResult.careNeeds.requiresMedicalAttention && (
              <View className="bg-red-50 p-4 rounded-lg">
                <ThemedText className="text-red-800 font-bold">
                  ⚠️ Memerlukan Perhatian Medis
                </ThemedText>
                <ThemedText className="text-red-700 mt-2">
                  Disarankan untuk segera melakukan konsultasi dengan tenaga
                  medis profesional.
                </ThemedText>
              </View>
            )}
          </View>
        ) : (
          <View className="items-center justify-center py-8">
            <ThemedText className="text-gray-600 text-center">
              Hasil analisis tidak tersedia
            </ThemedText>
          </View>
        )}

        <TouchableOpacity
          className="w-full bg-teal-500 rounded-lg py-4 px-6 mt-8"
          onPress={() => router.replace("/home")}
        >
          <ThemedText className="text-white text-center font-semibold text-lg">
            Kembali ke Beranda
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
