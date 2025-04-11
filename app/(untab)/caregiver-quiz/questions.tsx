import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

type ScreenType = 'questions' | 'work-info' | 'clock-test' | 'results';

const questions = [
  {
    id: 1,
    title: "Apa motivasi utama Anda menjadi caregiver?",
    type: "single",
    options: [
      { id: 1, title: "Ingin membantu orang lain", selected: false },
      { id: 2, title: "Sebagai pekerjaan tetap", selected: false },
      { id: 3, title: "Bagian dari keluarga saya", selected: false },
      { id: 4, title: "Alasan lainnya", selected: false }
    ]
  },
  {
    id: 2,
    title: "Seberapa nyaman Anda dalam merawat orang dengan kebutuhan khusus?",
    type: "single",
    options: [
      { id: 1, title: "Sangat nyaman", selected: false },
      { id: 2, title: "Cukup nyaman", selected: false },
      { id: 3, title: "Kurang nyaman", selected: false },
      { id: 4, title: "Tidak nyaman sama sekali", selected: false }
    ]
  },
  {
    id: 3,
    title: "Dalam situasi sulit, bagaimana Anda biasanya bereaksi?",
    type: "single",
    options: [
      { id: 1, title: "Tetap tenang dan mencari solusi", selected: false },
      { id: 2, title: "Mencari bantuan dari orang lain", selected: false },
      { id: 3, title: "Sering panik dan bingung", selected: false },
      { id: 4, title: "Menghindari masalah", selected: false }
    ]
  }
];

export default function QuizScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('questions');
  const [answers, setAnswers] = useState<{[key: number]: number[]}>({});
  const [workPlace, setWorkPlace] = useState('');
  const [experience, setExperience] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleOptionSelect = (questionId: number, optionId: number) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      const question = questions[currentStep];
      
      if (question.type === "multiple") {
        if (currentAnswers.includes(optionId)) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter(id => id !== optionId)
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, optionId]
          };
        }
      } else {
        return {
          ...prev,
          [questionId]: [optionId]
        };
      }
    });
  };

  const handleNext = () => {
    if (currentScreen === 'questions') {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentScreen('work-info');
      }
    } else if (currentScreen === 'work-info') {
      if (workPlace && experience) {
        setCurrentScreen('clock-test');
      }
    } else if (currentScreen === 'clock-test') {
      if (imageUri) {
        setCurrentScreen('results');
      }
    } else if (currentScreen === 'results') {
      router.push('/home');
    }
  };

  const handleBack = () => {
    if (currentScreen === 'questions') {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      } else {
        router.back();
      }
    } else if (currentScreen === 'work-info') {
      setCurrentScreen('questions');
      setCurrentStep(questions.length - 1);
    } else if (currentScreen === 'clock-test') {
      setCurrentScreen('work-info');
    }
  };

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
      }
    }
  };

  const getProgressWidth = () => {
    if (currentScreen === 'questions') {
      return ((currentStep + 1) / questions.length) * 33;
    } else if (currentScreen === 'work-info') {
      return 66;
    } else if (currentScreen === 'clock-test') {
      return 100;
    }
    return 100;
  };

  const isNextEnabled = () => {
    if (currentScreen === 'questions') {
      const currentAnswers = answers[questions[currentStep].id] || [];
      return currentAnswers.length > 0;
    } else if (currentScreen === 'work-info') {
      return workPlace.trim() !== '' && experience.trim() !== '';
    } else if (currentScreen === 'clock-test') {
      return imageUri !== null;
    }
    return true;
  };

  const renderContent = () => {
    switch (currentScreen) {
      case 'questions':
        return (
          <View className="flex-1 bg-white rounded-t-3xl">
            <ScrollView className="flex-1 p-4 pb-24">
              <Text className="text-2xl font-bold text-center mt-2 mb-8">
                {questions[currentStep].title}
              </Text>
      
              <View className="flex-row flex-wrap justify-between">
                {questions[currentStep].options.map((option) => {
                  const isSelected = (answers[questions[currentStep].id] || []).includes(option.id);
                  return (
                    <TouchableOpacity
                      key={option.id}
                      className={`w-[48%] p-4 rounded-lg border mb-4 ${
                        isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                      }`}
                      onPress={() => handleOptionSelect(questions[currentStep].id, option.id)}
                    >
                      <Text className={`text-center ${
                        isSelected ? 'text-teal-700 font-medium' : 'text-gray-700'
                      }`}>
                        {option.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
      
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
              <TouchableOpacity
                className={`w-full rounded-lg py-4 ${
                  isNextEnabled() ? 'bg-teal-500' : 'bg-gray-300'
                }`}
                onPress={handleNext}
                disabled={!isNextEnabled()}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  {currentStep === questions.length - 1 ? 'Continue' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
        case 'work-info':
          return (
            <View className="flex-1 bg-white rounded-t-3xl">
              <ScrollView className="flex-1 px-4 pb-24">
                <Text className="text-2xl font-bold text-center mt-2 mb-8">
                  Kesiapan Sebagai Caregiver
                </Text>
        
                <View className="space-y-4">
                  <Text className="text-gray-700 text-base mb-2">
                    Jelaskan pengalaman dan kesiapan Anda dalam merawat pasien demensia:
                  </Text>
                  <TextInput
                    className="w-full border border-gray-300 rounded-lg p-4 text-gray-700 min-h-[100px]"
                    placeholder="Ceritakan pengalaman Anda dalam merawat pasien (jika ada), pemahaman Anda tentang demensia, dan bagaimana Anda akan menangani tantangan dalam merawat pasien demensia..."
                    value={workPlace}
                    onChangeText={setWorkPlace}
                    multiline={true}
                    textAlignVertical="top"
                    numberOfLines={8}
                    placeholderTextColor="#9CA3AF"
                  />
        
                  <Text className="text-gray-700 text-base mb-2 mt-6">
                    Berapa tahun pengalaman Anda dalam bidang caregiving?
                  </Text>
                  <TextInput
                    className="w-full border border-gray-300 rounded-lg p-4 text-gray-700"
                    placeholder="Contoh: 2"
                    value={experience}
                    onChangeText={setExperience}
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </ScrollView>
        
              <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <TouchableOpacity
                  className={`w-full rounded-lg py-4 ${
                    workPlace && experience ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                  onPress={handleNext}
                  disabled={!workPlace || !experience}
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
      
      case 'clock-test':
        return (
          <View className="flex-1 bg-white rounded-t-3xl">
            <ScrollView className="flex-1 px-4 pb-24">
              <Text className="text-2xl font-bold text-center mt-2 mb-8">
                Upload Foto Clock Test
              </Text>
      
              <TouchableOpacity
                onPress={pickImage}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 items-center justify-center"
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    className="w-full h-40 rounded-lg"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="items-center">
                    <Ionicons name="camera" size={48} color="#0D9488" />
                    <Text className="text-teal-600 text-center mt-4">
                      Upload hasil foto clock test yang dilakukan
                    </Text>
                    <Text className="text-teal-600 text-center">
                      dengan penyandang photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
      
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
              <TouchableOpacity
                className={`w-full rounded-lg py-4 ${
                  imageUri ? 'bg-teal-500' : 'bg-gray-300'
                }`}
                onPress={handleNext}
                disabled={!imageUri}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

        case 'results':
          return (
            <View className="flex-1 bg-white rounded-t-3xl">
              <View className="flex-1 px-4 pb-24 justify-center items-center">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-center mb-4">
                    Terima Kasih!
                  </Text>
                  <Text className="text-gray-600 text-center mb-8 px-4">
                    Jawaban Anda telah kami terima. Tim kami akan menghubungi Anda untuk proses selanjutnya.
                  </Text>
                </View>
              </View>
        
              <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <TouchableOpacity
                  className="w-full rounded-lg py-4 bg-teal-500"
                  onPress={() => router.push('/home')}
                >
                  <Text className="text-white text-center font-semibold text-lg">
                    Mulai
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
    }
  };

  return (
    <View className="flex-1 bg-teal-500">
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View className="pt-12 px-4 bg-teal-500">
        <View className="flex-row items-center mb-4">
          {currentScreen !== 'results' && (
            <TouchableOpacity 
              onPress={handleBack}
              className="p-2 -ml-2"
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          <View className="flex-1 items-center">
            <View className="w-1/3 h-2 mr-3 bg-[#161818] rounded-full overflow-hidden">
              <View 
                className="h-full bg-white"
                style={{ width: `${getProgressWidth()}%` }}
              />
            </View>
          </View>
        </View>
      </View>

      {renderContent()}
    </View>
  );
}