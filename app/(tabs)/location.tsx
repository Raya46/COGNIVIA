import React from "react";
import { View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Circle } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

const LocationPage = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Peta */}
      <View className="mt-4 mx-4 rounded-lg overflow-hidden">
        <View className="mt-4 p-2 border border-teal-500 rounded-tl-lg rounded-tr-lg">
          <ThemedText className="text-center text-teal-500 font-semibold">
            Anda Berada di Zona Aman
          </ThemedText>
        </View>
        <View className="relative shadow-lg">
          <MapView
            style={{ width: "100%", height: 400 }}
            initialRegion={{
              latitude: -6.1849,
              longitude: 106.8223,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {/* Area Lingkaran */}
            <Circle
              center={{ latitude: -6.1849, longitude: 106.8223 }}
              radius={500}
              strokeColor="rgba(0, 150, 136, 0.5)"
              fillColor="rgba(0, 150, 136, 0.2)"
            />

            {/* Marker */}
            <Marker
              coordinate={{ latitude: -6.1849, longitude: 106.8223 }}
              title="Slipi"
              description="Kec. Palmerah, Kota Jakarta Barat, DKI Jakarta"
            />
          </MapView>

          {/* location info card */}
          <View className="absolute bottom-5 left-10 right-10 bg-white shadow-lg rounded-lg p-4">
            <ThemedText className="text-lg font-semibold">Slipi</ThemedText>
            <ThemedText className="text-gray-500">
              Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta
            </ThemedText>
          </View>
        </View>
      </View>

      <View className="my-4"></View>
      {/* Status Jarak */}
      <View className="mt-4 mx-4 bg-teal-100 p-3 rounded-lg">
        <ThemedText className="text-center text-teal-600 font-semibold">
          500 Meter dari batas zona
        </ThemedText>
      </View>

      {/* Tombol Floating Call */}
      <View className="flex flex-row items-center absolute bottom-16 right-6 gap-3">
        <TouchableOpacity className="bg-gray-300 p-3 rounded-lg items-center">
          <ThemedText className="text-gray-700">
            Lakukan Panggilan darurat jika tersesat
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity className=" bg-teal-500 w-14 h-14 rounded-full items-center justify-center shadow-lg">
          <Ionicons name="call-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LocationPage;
