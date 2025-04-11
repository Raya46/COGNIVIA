import React, { useState, useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import CLogo from "@/assets/images/C.png"; // Import logo yang sudah ada

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Selamat Datang di Cognivia",
    description:
      "Aplikasi pendamping untuk membantu penderita demensia dan caregiver",
  },
  {
    id: "2",
    title: "Kelola Aktivitas",
    description: "Catat dan atur jadwal aktivitas harian dengan mudah",
  },
  {
    id: "3",
    title: "Mulai Perjalanan",
    description: "Bergabung sekarang untuk pengalaman yang lebih baik",
  },
];

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const renderItem = ({ item }: { item: (typeof slides)[0] }) => {
    return (
      <View
        style={{ width }}
        className="items-center justify-center px-4 h-full"
      >
        {/* Logo */}
        <View className="mb-6">
          <Image
            source={CLogo}
            style={{
              width: 120,
              height: 120,
              resizeMode: "contain",
            }}
            className="rounded-xl"
          />
        </View>

        <View className="items-center mt-8">
          <ThemedText className="text-2xl font-bold text-center mb-4">
            {item.title}
          </ThemedText>
          <ThemedText className="text-base text-gray-600 text-center px-4">
            {item.description}
          </ThemedText>
        </View>
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const renderPagination = () => {
    return (
      <View className="flex-row justify-center space-x-2 mt-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full ${
              currentIndex === index ? "w-6 bg-teal-500" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </View>
    );
  };

  const renderButtons = () => {
    if (currentIndex === slides.length - 1) {
      return (
        <View className="w-full px-4 space-y-4">
          <TouchableOpacity
            onPress={() => router.replace("/login")}
            className="bg-teal-500 py-4 rounded-lg"
          >
            <ThemedText className="text-white text-center font-semibold">
              Masuk
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/register")}
            className="bg-white border border-teal-500 py-4 rounded-lg"
          >
            <ThemedText className="text-teal-500 text-center font-semibold">
              Daftar
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View className="w-full px-4 flex-row justify-between">
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          className="py-4"
        >
          <ThemedText className="text-gray-500">Lewati</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} className="py-4">
          <ThemedText className="text-teal-500 font-semibold">
            Selanjutnya
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
        />

        {renderPagination()}

        <View className="mb-8 mt-4">{renderButtons()}</View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
