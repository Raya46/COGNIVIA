import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Circle } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import * as Location from "expo-location";

interface AddressType {
  name: string;
  district: string;
  city: string;
  province: string;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const LocationPage = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [address, setAddress] = useState<AddressType>({
    name: "",
    district: "",
    city: "",
    province: "",
  });
  const [distance, setDistance] = useState<number>(0);
  const [inSafeZone, setInSafeZone] = useState<boolean>(false);

  // Constants untuk zona aman
  const SAFE_ZONE = useMemo(
    () => ({
      latitude: -6.1849,
      longitude: 106.8223,
      radius: 500, // dalam meter
    }),
    []
  );

  // Fungsi untuk mengukur jarak antara 2 koordinat (Haversine formula)
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371e3; // radius bumi dalam meter
      const a1 = (lat1 * Math.PI) / 180;
      const a2 = (lat2 * Math.PI) / 180;
      const d1 = ((lat2 - lat1) * Math.PI) / 180;
      const dk = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(d1 / 2) * Math.sin(d1 / 2) +
        Math.cos(a1) * Math.cos(a2) * Math.sin(dk / 2) * Math.sin(dk / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // dalam meter
    },
    []
  );

  // Fungsi untuk mendapatkan alamat dari koordinat
  const getAddressFromCoordinates = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode.length > 0) {
          const locationData = reverseGeocode[0];
          setAddress({
            name:
              locationData.name ||
              locationData.street ||
              "Lokasi Tidak Diketahui",
            district: locationData.district || locationData.subregion || "",
            city: locationData.city || "",
            province: locationData.region || "",
          });
        }
      } catch (error) {
        console.error("Error getting address:", error);
      }
    },
    []
  );

  // Cek apakah pengguna berada di zona aman
  const checkSafeZone = useCallback(() => {
    if (!location?.coords) return false;

    const dist = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      SAFE_ZONE.latitude,
      SAFE_ZONE.longitude
    );

    setDistance(Math.round(dist));
    const isInZone = dist <= SAFE_ZONE.radius;
    setInSafeZone(isInZone);
    return isInZone;
  }, [location, SAFE_ZONE, calculateDistance]);

  // Effect untuk memeriksa zona aman saat lokasi berubah
  useEffect(() => {
    if (location?.coords) {
      checkSafeZone();
    }
  }, [location, checkSafeZone]);

  // Effect untuk meminta izin dan mendapatkan lokasi
  useEffect(() => {
    let isMounted = true;

    const getLocationPermission = async () => {
      if (!isMounted) return;

      setLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setErrorMsg("Izin akses lokasi ditolak");
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setLocation(currentLocation);
          if (currentLocation?.coords) {
            await getAddressFromCoordinates(
              currentLocation.coords.latitude,
              currentLocation.coords.longitude
            );
          }
        }
      } catch (error: any) {
        console.error("Error getting location:", error);
        if (isMounted) {
          setErrorMsg("Gagal mendapatkan lokasi: " + error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getLocationPermission();

    return () => {
      isMounted = false;
    };
  }, [getAddressFromCoordinates]);

  // Fungsi untuk memuat ulang lokasi
  const refreshLocation = useCallback(async () => {
    setLoading(true);
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation);

      if (currentLocation?.coords) {
        await getAddressFromCoordinates(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      }
    } catch (error: any) {
      console.error("Error refreshing location:", error);
      Alert.alert("Error", "Gagal memperbarui lokasi");
    } finally {
      setLoading(false);
    }
  }, [getAddressFromCoordinates]);

  // Fungsi untuk memanggil panggilan darurat
  const handleEmergencyCall = useCallback(() => {
    Alert.alert(
      "Panggilan Darurat",
      "Apakah Anda yakin ingin melakukan panggilan darurat?",
      [
        {
          text: "Tidak",
          style: "cancel",
        },
        {
          text: "Ya",
          onPress: () => {
            // Implementasi panggilan darurat (gunakan library lain jika perlu)
            console.log("Melakukan panggilan darurat");
          },
        },
      ]
    );
  }, []);

  const initialRegion = useMemo(() => {
    if (location?.coords) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    return null;
  }, [location]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Peta */}
      <View className="mt-4 mx-4 rounded-lg overflow-hidden">
        <View className="mt-4 p-2 border border-teal-500 rounded-tl-lg rounded-tr-lg relative">
          {loading ? (
            <ActivityIndicator size="small" color="#2A9E9E" />
          ) : errorMsg ? (
            <ThemedText className="text-center text-red-500">
              {errorMsg}
            </ThemedText>
          ) : (
            <ThemedText className="text-center text-teal-500 font-semibold">
              {inSafeZone
                ? "Anda Berada di Zona Aman"
                : "Anda Berada di Luar Zona Aman"}
            </ThemedText>
          )}

          {/* Tombol refresh lokasi */}
          <TouchableOpacity
            className="absolute right-2 top-1.5"
            onPress={refreshLocation}
            disabled={loading}
          >
            <Ionicons
              name="refresh-outline"
              size={24}
              color={loading ? "#ccc" : "#2A9E9E"}
            />
          </TouchableOpacity>
        </View>

        <View className="relative shadow-lg">
          {loading ? (
            <View
              style={{ width: "100%", height: 400 }}
              className="items-center justify-center bg-gray-100"
            >
              <ActivityIndicator size="large" color="#2A9E9E" />
              <ThemedText className="mt-2 text-gray-500">
                Memuat lokasi...
              </ThemedText>
            </View>
          ) : location?.coords ? (
            <MapView
              style={{ width: "100%", height: 400 }}
              initialRegion={initialRegion ?? undefined}
            >
              {/* Area Zona Aman */}
              <Circle
                center={{
                  latitude: SAFE_ZONE.latitude,
                  longitude: SAFE_ZONE.longitude,
                }}
                radius={SAFE_ZONE.radius}
                strokeColor="rgba(0, 150, 136, 0.5)"
                fillColor="rgba(0, 150, 136, 0.2)"
              />

              {/* Marker Zona Aman */}
              <Marker
                coordinate={{
                  latitude: SAFE_ZONE.latitude,
                  longitude: SAFE_ZONE.longitude,
                }}
                title="Zona Aman"
                description="Batas area yang aman"
                pinColor="green"
              >
                <View className="bg-teal-500 p-2 rounded-full">
                  <Ionicons name="home" size={16} color="white" />
                </View>
              </Marker>

              {/* Marker Lokasi User */}
              <Marker
                coordinate={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                }}
                title={address.name}
                description={`${address.district}, ${address.city}`}
              >
                <View className="bg-blue-500 p-2 rounded-full">
                  <Ionicons name="person" size={16} color="white" />
                </View>
              </Marker>
            </MapView>
          ) : (
            <View
              style={{ width: "100%", height: 400 }}
              className="items-center justify-center bg-gray-100"
            >
              <Ionicons name="location-outline" size={48} color="#aaa" />
              <ThemedText className="mt-2 text-gray-500">
                Lokasi tidak tersedia
              </ThemedText>
            </View>
          )}

          {/* Location info card */}
          {location?.coords && (
            <View className="absolute bottom-5 left-10 right-10 bg-white shadow-lg rounded-lg p-4">
              <ThemedText className="text-lg font-semibold">
                {address.name}
              </ThemedText>
              <ThemedText className="text-gray-500">
                {address.district}, {address.city}, {address.province}
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      <View className="my-4"></View>

      {/* Status Jarak */}
      {location?.coords && (
        <View
          className={`mt-4 mx-4 p-3 rounded-lg ${
            inSafeZone ? "bg-teal-100" : "bg-orange-100"
          }`}
        >
          <ThemedText
            className={`text-center font-semibold ${
              inSafeZone ? "text-teal-600" : "text-orange-600"
            }`}
          >
            {inSafeZone
              ? `Anda berada ${distance} Meter dari pusat zona aman`
              : `Anda berada ${
                  distance - SAFE_ZONE.radius
                } Meter di luar batas zona aman`}
          </ThemedText>
        </View>
      )}

      {/* Tombol Floating Call */}
      <View className="flex flex-row items-center absolute bottom-16 right-6 gap-3">
        <TouchableOpacity
          className={`${
            !inSafeZone && location?.coords ? "bg-orange-200" : "bg-gray-300"
          } p-3 rounded-lg items-center`}
        >
          <ThemedText
            className={`${
              !inSafeZone && location?.coords
                ? "text-orange-700"
                : "text-gray-700"
            }`}
          >
            Lakukan Panggilan darurat jika tersesat
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          className={`${
            !inSafeZone && location?.coords ? "bg-orange-500" : "bg-teal-500"
          } w-14 h-14 rounded-full items-center justify-center shadow-lg`}
          onPress={handleEmergencyCall}
        >
          <Ionicons name="call-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LocationPage;
