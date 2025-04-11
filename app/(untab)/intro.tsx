import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';

export default function IntroScreen() {
  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View className="flex-1">
        <Image
          source={require('../../assets/images/caregiver-patient.png')}
          className="w-full h-[500px]"
          resizeMode="cover"
        />
        
        <View className="absolute bottom-0 left-0 right-0 px-4 rounded-t-2xl items-center bg-white pt-6">
          <Image
            source={require('../../assets/images/C.png')}
            className="w-[70px] h-[70px] mb-5 rounded-xl"
            resizeMode="contain"
          />        
          <Text className="text-2xl font-bold text-center mb-4 text-gray-800">
            Seberapa Siap Kamu {'\n'}Merawat dengan Hati?
          </Text>

          <Text className="text-base text-center text-gray-600 mb-8 leading-6">
            Mulailah dengan kuis ini untuk mengevaluasi kesejahteraan dan kesiapanmu. Ini adalah langkah pertama menuju perawatan yang lebih baik.
          </Text>

          <TouchableOpacity 
            className="w-9/12 bg-[#2A9D8F] py-3 rounded-xl mb-12"
            onPress={() => {}}
          >
            <Text className="text-white text-lg font-bold text-center">Mulai</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}