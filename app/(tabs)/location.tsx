import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Button,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Circle } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import * as Location from "expo-location";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/supabase/supabase";
import { Picker } from "@react-native-picker/picker";
import { getAllPatients, useUpdateSafeZone } from "@/hooks/useUser";

interface AddressType {
  name: string;
  district: string;
  city: string;
  province: string;
}

interface SafeZone {
  latitude: number;
  longitude: number;
  radius: number;
}

interface Patient {
  id: string;
  username: string;
  safezone: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

const LocationPage = () => {
  const { userData } = useAuth();
  const { patients, isLoading } = getAllPatients();
  const isCaregiver = userData?.role === "caregiver";
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [newSafeZone, setNewSafeZone] = useState<SafeZone>({
    latitude: 0,
    longitude: 0,
    radius: 500,
  });
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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
  const mapRef = useRef<MapView>(null);
  const SAFE_ZONE = useMemo(
    () => ({
      latitude: -6.1849,
      longitude: 106.8223,
      radius: 500,
    }),
    []
  );

  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371e3;
      const a1 = (lat1 * Math.PI) / 180;
      const a2 = (lat2 * Math.PI) / 180;
      const d1 = ((lat2 - lat1) * Math.PI) / 180;
      const dk = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(d1 / 2) * Math.sin(d1 / 2) +
        Math.cos(a1) * Math.cos(a2) * Math.sin(dk / 2) * Math.sin(dk / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  const getAddressFromCoordinates = useCallback(
    async (latitude: number, longitude: number) => {
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode.length > 0) {
          const locationData = reverseGeocode[0];
          const newAddress = {
            name:
              locationData.name ||
              locationData.street ||
              "Lokasi Tidak Diketahui",
            district: locationData.district || locationData.subregion || "",
            city: locationData.city || "",
            province: locationData.region || "",
          };
          return newAddress;
        }
        return null;
      } catch (error) {
        console.error("Error getting address:", error);
        return null;
      }
    },
    []
  );

  const [selectedLocationAddress, setSelectedLocationAddress] =
    useState<AddressType>({
      name: "",
      district: "",
      city: "",
      province: "",
    });

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

  useEffect(() => {
    if (location?.coords) {
      checkSafeZone();
    }
  }, [location, checkSafeZone]);

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

  const updateSafeZoneMutation = useUpdateSafeZone();

  const updateSafeZone = async () => {
    if (!selectedPatient || !selectedLocation) {
      Alert.alert("Error", "Please select a location first");
      return;
    }

    if (!newSafeZone.radius || newSafeZone.radius <= 0) {
      Alert.alert("Error", "Please enter a valid radius");
      return;
    }

    try {
      await updateSafeZoneMutation.mutateAsync({
        userId: selectedPatient.id,
        safeZone: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          radius: newSafeZone.radius,
        },
      });

      Alert.alert("Success", "Safe zone updated successfully");
      setIsEditingZone(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update safe zone");
    }
  };

  const handleMapLongPress = async (event: any) => {
    if (isEditingZone && selectedPatient) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setSelectedLocation({ latitude, longitude });
      setNewSafeZone((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));

      const address = await getAddressFromCoordinates(latitude, longitude);
      if (address) {
        setSelectedLocationAddress(address);
      }

      Alert.alert("Success", "Location selected for new safe zone");
    }
  };

  const handlePatientChange = async (itemValue: string) => {
    const patient = patients?.find((p) => p.id === itemValue);
    setSelectedPatient(patient || null);

    if (patient?.safezone) {
      let safezoneData: SafeZone;
      try {
        safezoneData =
          typeof patient.safezone === "string"
            ? JSON.parse(patient.safezone)
            : patient.safezone;

        const region = {
          latitude: safezoneData.latitude,
          longitude: safezoneData.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        };
        mapRef.current?.animateToRegion(region, 1000);

        setNewSafeZone({
          latitude: safezoneData.latitude,
          longitude: safezoneData.longitude,
          radius: safezoneData.radius,
        });

        const address = await getAddressFromCoordinates(
          safezoneData.latitude,
          safezoneData.longitude
        );
        if (address) {
          setSelectedLocationAddress(address);
        }
      } catch (error) {
        console.error("Error parsing safezone data:", error);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-4 rounded-lg overflow-hidden">
        <View className="p-2 border border-teal-500 rounded-tl-lg rounded-tr-lg relative">
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
              ref={mapRef}
              style={{ width: "100%", height: 400 }}
              initialRegion={initialRegion ?? undefined}
              onLongPress={handleMapLongPress}
            >
              {/* Default Safe Zone Circle */}
              {SAFE_ZONE && (
                <Circle
                  center={{
                    latitude: SAFE_ZONE.latitude,
                    longitude: SAFE_ZONE.longitude,
                  }}
                  radius={SAFE_ZONE.radius}
                  strokeColor="rgba(0, 150, 136, 0.5)"
                  fillColor="rgba(0, 150, 136, 0.2)"
                />
              )}

              {/* Selected Location Marker */}
              {isEditingZone && selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  title="New Safe Zone"
                  description="Long press to change location"
                  pinColor="yellow"
                >
                  <View className="bg-yellow-500 p-2 rounded-full">
                    <Ionicons name="location" size={16} color="white" />
                  </View>
                </Marker>
              )}

              {/* Selected Patient's Safe Zone */}
              {selectedPatient?.safezone &&
                selectedPatient.safezone.latitude &&
                selectedPatient.safezone.longitude && (
                  <>
                    <Circle
                      center={{
                        latitude: selectedPatient.safezone.latitude,
                        longitude: selectedPatient.safezone.longitude,
                      }}
                      radius={selectedPatient.safezone.radius}
                      strokeColor="rgba(255, 165, 0, 0.5)"
                      fillColor="rgba(255, 165, 0, 0.2)"
                    />
                    <Marker
                      coordinate={{
                        latitude: selectedPatient.safezone.latitude,
                        longitude: selectedPatient.safezone.longitude,
                      }}
                      title={`${selectedPatient.username}'s Safe Zone`}
                      description="Current safe zone center"
                      pinColor="orange"
                    >
                      <View className="bg-orange-500 p-2 rounded-full">
                        <Ionicons name="home" size={16} color="white" />
                      </View>
                    </Marker>
                  </>
                )}
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
          <View className="absolute bottom-5 left-10 right-10 bg-white shadow-lg rounded-lg p-4">
            <ThemedText className="text-lg font-semibold">
              {isEditingZone && selectedLocation
                ? selectedLocationAddress.name
                : selectedPatient?.safezone
                ? selectedLocationAddress.name
                : "No location selected"}
            </ThemedText>
            <ThemedText className="text-gray-500">
              {isEditingZone && selectedLocation
                ? `${selectedLocationAddress.district}, ${selectedLocationAddress.city}, ${selectedLocationAddress.province}`
                : selectedPatient?.safezone
                ? `${selectedLocationAddress.district}, ${selectedLocationAddress.city}, ${selectedLocationAddress.province}`
                : "Select a patient and location"}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Status Jarak */}
      {isCaregiver ? (
        <View className="p-4">
          <ThemedText>Choose Patient</ThemedText>
          <View className="mb-2 border border-gray-300 rounded-lg">
            <Picker
              selectedValue={selectedPatient?.id}
              onValueChange={handlePatientChange}
            >
              <Picker.Item label="Select Patient" value="" />
              {patients?.map((item) => (
                <Picker.Item
                  label={item.username}
                  value={item.id}
                  key={item.id}
                />
              ))}
              {/* Patients will be populated here */}
            </Picker>
          </View>

          {selectedPatient && (
            <View className="mb-2">
              <Button
                title={isEditingZone ? "Save Safe Zone" : "Edit Safe Zone"}
                onPress={() => {
                  if (isEditingZone) {
                    updateSafeZone();
                  } else {
                    setIsEditingZone(true);
                  }
                }}
              />
              {isEditingZone && (
                <View className="mt-2">
                  <Text>Long press on map to set safe zone center</Text>
                </View>
              )}
            </View>
          )}
        </View>
      ) : null}
      {location?.coords && isCaregiver ? (
        <View className="mx-3">
          <ThemedText>Safezone Radius</ThemedText>
          <TextInput
            placeholder="Radius (meters)"
            value={String(newSafeZone.radius)}
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg py-4 px-3"
            onChangeText={(text) =>
              setNewSafeZone((prev) => ({
                ...prev,
                radius: Number(text),
              }))
            }
          />
        </View>
      ) : (
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
      <View className="flex flex-row items-center absolute bottom-0 right-2 gap-3">
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
