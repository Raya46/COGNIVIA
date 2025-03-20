import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { ScrollView, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Image sources - Replace these with your actual image paths/URLs
const imageSources = [
  'https://images.pexels.com/photos/768473/pexels-photo-768473.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1028704/pexels-photo-1028704.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/392018/pexels-photo-392018.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2079234/pexels-photo-2079234.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/239581/pexels-photo-239581.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/894549/pexels-photo-894549.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/38276/tree-sunset-nature-flowers-38276.jpeg?auto=compress&cs=tinysrgb&w=600',
];

const Page = () => {
  return (
    <SafeAreaView className="bg-white">
      <ScrollView>
        <View className="flex-row items-center justify-between px-5 pt-2">
          <ThemedText className="text-2xl font-bold">Profile</ThemedText>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="notifications-outline" size={24} color="#008B8B" />
          </TouchableOpacity>
        </View>

        <View className="px-5 pt-5">
          <View className="flex flex-row items-center mb-5">
            <View className="w-20 h-20 mr-5 overflow-hidden rounded-full">
              <View className="w-20 h-20 rounded-full bg-sky-300" />
            </View>
            <View className="flex-1">
              <ThemedText className="text-lg font-bold">Hadiano Sutomo</ThemedText>
              <ThemedText className="mt-1 text-gray-500">"Bahagia itu sederhana"</ThemedText>
              <View className="flex flex-row items-center mt-1">
                <Ionicons name="location" size={14} color="gray" />
                <ThemedText className="ml-1 text-gray-500">Bandung, Indonesia</ThemedText>
              </View>
            </View>
          </View>

          <View className="flex flex-row items-center justify-between mb-3">
            <ThemedText className="text-lg font-bold">Jadwal</ThemedText>
            <TouchableOpacity>
              <ThemedText className="text-teal-500">Detail</ThemedText>
            </TouchableOpacity>
          </View>

          <View className="px-4 py-3 mb-3 bg-gray-100 rounded-lg">
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-start">
                <View className="w-2 h-2 mt-1 mr-2 bg-teal-500 rounded-full" />
                <View>
                  <ThemedText className="font-bold">Sarapan & Latihan otak</ThemedText>
                  <ThemedText className="text-gray-500">Kegiatan</ThemedText>
                </View>
              </View>
              <View className="flex flex-row items-center">
                <ThemedText className="mr-2">7:30</ThemedText>
                <Ionicons name="chevron-down" size={20} color="gray" />
              </View>
            </View>
          </View>

          <View className="px-4 py-3 mb-3 bg-gray-100 rounded-lg">
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-start">
                <View className="w-2 h-2 mt-1 mr-2 bg-pink-500 rounded-full" />
                <View>
                  <ThemedText className="font-bold">Minum obat (pagi)</ThemedText>
                  <ThemedText className="text-gray-500">Rutinitas</ThemedText>
                </View>
              </View>
              <View className="flex flex-row items-center">
                <ThemedText className="mr-2">9:00</ThemedText>
                <Ionicons name="chevron-down" size={20} color="gray" />
              </View>
            </View>
          </View>

          <View className="px-4 py-3 mb-3 bg-gray-100 rounded-lg">
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-start">
                <View className="w-2 h-2 mt-1 mr-2 bg-teal-500 rounded-full" />
                <View>
                  <ThemedText className="font-bold">Jalan Pagi di Taman</ThemedText>
                  <ThemedText className="text-gray-500">Kegiatan</ThemedText>
                </View>
              </View>
              <View className="flex flex-row items-center">
                <ThemedText className="mr-2">10:00</ThemedText>
                <Ionicons name="chevron-down" size={20} color="gray" />
              </View>
            </View>
          </View>

          <View className="px-4 py-3 mb-3 bg-gray-100 rounded-lg">
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-start">
                <View className="w-2 h-2 mt-1 mr-2 bg-pink-500 rounded-full" />
                <View>
                  <ThemedText className="font-bold">Minum Obat (sore)</ThemedText>
                  <ThemedText className="text-gray-500">Rutinitas</ThemedText>
                </View>
              </View>
              <View className="flex flex-row items-center">
                <ThemedText className="mr-2">17.30</ThemedText>
                <Ionicons name="chevron-down" size={20} color="gray" />
              </View>
            </View>
          </View>

          <ThemedText className="mt-5 mb-3 text-lg font-bold">Postingan</ThemedText>

          <View className="flex flex-row flex-wrap">
            {imageSources.map((source, index) => (
              <Image
                key={index}
                source={{ uri: source }}
                style={{
                  width: '30%', // Adjust for 3-column grid
                  height: 100, // Adjust as needed
                  marginBottom: 8,
                  marginRight: '3.33%', // Add spacing between columns
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Page;
