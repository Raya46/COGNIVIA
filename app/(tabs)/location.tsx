import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/AuthContext";
import { getAllPatients, useUpdateSafeZone } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

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
      try {
        let safezoneData: SafeZone;
        if (typeof patient.safezone === "string") {
          safezoneData = JSON.parse(patient.safezone);
        } else {
          safezoneData = patient.safezone;
        }

        if (
          safezoneData &&
          typeof safezoneData.latitude === "number" &&
          typeof safezoneData.longitude === "number" &&
          typeof safezoneData.radius === "number"
        ) {
          const region = {
            latitude: safezoneData.latitude,
            longitude: safezoneData.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          };

          setNewSafeZone({
            latitude: safezoneData.latitude,
            longitude: safezoneData.longitude,
            radius: safezoneData.radius,
          });

          mapRef.current?.animateToRegion(region, 1000);

          const address = await getAddressFromCoordinates(
            safezoneData.latitude,
            safezoneData.longitude
          );
          if (address) {
            setSelectedLocationAddress(address);
          }
        }
      } catch (error) {
        console.error("Error parsing safezone data:", error);
        Alert.alert("Error", "Gagal memuat data zona aman");
      }
    } else {
      setNewSafeZone({
        latitude: 0,
        longitude: 0,
        radius: 500,
      });
      setSelectedLocationAddress({
        name: "",
        district: "",
        city: "",
        province: "",
      });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="rounded-lg overflow-hidden">
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
              {/* Marker posisi pengguna saat ini (baik caregiver maupun penderita) */}
              {location?.coords && (
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title="Lokasi Anda"
                  description="Posisi Anda saat ini"
                >
                  <View className="bg-blue-500 p-2 rounded-full">
                    <Ionicons name="person" size={16} color="white" />
                  </View>
                </Marker>
              )}

              {/* Safe Zone untuk penderita */}
              {!isCaregiver && SAFE_ZONE && (
                <>
                  <Circle
                    center={{
                      latitude: SAFE_ZONE.latitude,
                      longitude: SAFE_ZONE.longitude,
                    }}
                    radius={SAFE_ZONE.radius}
                    strokeColor="rgba(0, 150, 136, 0.5)"
                    fillColor="rgba(0, 150, 136, 0.2)"
                  />
                  <Marker
                    coordinate={{
                      latitude: SAFE_ZONE.latitude,
                      longitude: SAFE_ZONE.longitude,
                    }}
                    title="Zona Aman"
                    description="Pusat zona aman"
                  >
                    <View className="bg-teal-500 p-2 rounded-full">
                      <Ionicons name="home" size={16} color="white" />
                    </View>
                  </Marker>
                </>
              )}

              {/* Safe Zone untuk pasien yang dipilih (caregiver) */}
              {isCaregiver &&
                selectedPatient?.safezone &&
                selectedPatient.safezone.latitude &&
                selectedPatient.safezone.longitude &&
                selectedPatient.safezone.radius && (
                  <>
                    <Circle
                      center={{
                        latitude: Number(selectedPatient.safezone.latitude),
                        longitude: Number(selectedPatient.safezone.longitude),
                      }}
                      radius={Number(selectedPatient.safezone.radius)}
                      strokeColor="rgba(255, 165, 0, 0.5)"
                      fillColor="rgba(255, 165, 0, 0.2)"
                    />
                    <Marker
                      coordinate={{
                        latitude: Number(selectedPatient.safezone.latitude),
                        longitude: Number(selectedPatient.safezone.longitude),
                      }}
                      title={`${selectedPatient.username}'s Safe Zone`}
                      description="Current safe zone center"
                    >
                      <View className="bg-orange-500 p-2 rounded-full">
                        <Ionicons name="home" size={16} color="white" />
                      </View>
                    </Marker>
                  </>
                )}

              {/* Marker untuk lokasi yang sedang diedit */}
              {isCaregiver && isEditingZone && selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  title="New Safe Zone"
                  description="Long press to change location"
                >
                  <View className="bg-yellow-500 p-2 rounded-full">
                    <Ionicons name="location" size={16} color="white" />
                  </View>
                </Marker>
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

          {location?.coords && (
            <View
              className={`absolute top-14 left-4 right-4 z-10 px-4 py-3 rounded-lg text-center ${
                inSafeZone
                  ? "bg-teal-100"
                  : "bg-orange-100 border border-red-300"
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <View className="flex flex-row items-center gap-3">
                <Ionicons name="alert-circle-outline" size={24} color={"red"} />
                <ThemedText
                  className={`text-center font-semibold ${
                    inSafeZone ? "text-teal-600" : "text-orange-600"
                  }`}
                >
                  {inSafeZone
                    ? `Anda berada di pusat zona aman`
                    : `Anda berada di luar batas zona aman`}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Status Jarak */}
      {isCaregiver ? (
        <View>
          <View
            className="absolute -top-10 p-4 w-full"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(5px)",
            }}
          >
            <View className="flex flex-row items-center justify-between">
              <ThemedText className="text-2xl font-bold text-gray-800">
                {isEditingZone && selectedLocation
                  ? selectedLocationAddress.name
                  : selectedPatient?.safezone
                  ? selectedLocationAddress.name
                  : "No location selected"}
              </ThemedText>
              <Ionicons
                name="notifications-outline"
                size={24}
                className="bg-teal-500 rounded-full p-2 self-end"
                color={"#fff"}
              />
            </View>

            <View className="flex flex-row items-center justify-between w-full">
              <ThemedText className="text-gray-600 flex-1">
                {isEditingZone && selectedLocation
                  ? `${selectedLocationAddress.district}, ${selectedLocationAddress.city}, ${selectedLocationAddress.province}`
                  : selectedPatient?.safezone
                  ? `${selectedLocationAddress.district}, ${selectedLocationAddress.city}, ${selectedLocationAddress.province}`
                  : "Select a patient and location"}
              </ThemedText>
            </View>
          </View>
          <View className="mt-10 p-4">
            <View className="mb-4">
              <TextInput
                placeholder="Enter radius in meters"
                value={String(newSafeZone.radius)}
                keyboardType="numeric"
                className="border border-gray-300 rounded-lg p-4"
                onChangeText={(text) =>
                  setNewSafeZone((prev) => ({
                    ...prev,
                    radius: Number(text) || 0,
                  }))
                }
              />
            </View>
            <ThemedText className="mb-3">Choose Patient</ThemedText>
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
              </Picker>
            </View>

            {location?.coords && (
              <View
                className={`px-4 my-2 py-3 rounded-lg text-center ${
                  inSafeZone
                    ? "bg-teal-100"
                    : "bg-orange-100 border border-red-300"
                }`}
              >
                <View className="flex flex-row items-center gap-3">
                  <Ionicons
                    name="alert-circle-outline"
                    size={24}
                    color={"red"}
                  />
                  <ThemedText
                    className={`text-center font-semibold ${
                      inSafeZone ? "text-teal-600" : "text-orange-600"
                    }`}
                  >
                    {inSafeZone
                      ? `Anda berada di pusat zona aman`
                      : `Anda berada di luar batas zona aman`}
                  </ThemedText>
                </View>
              </View>
            )}

            <View className="my-3">
              <TouchableOpacity
                onPress={() => {
                  if (isEditingZone) {
                    updateSafeZone();
                  } else {
                    setIsEditingZone(true);
                  }
                }}
                className="bg-teal-500 rounded-full px-3 py-4"
              >
                <ThemedText className="text-white text-center">
                  {isEditingZone ? "Save Safe Zone" : "Edit Safe Zone"}
                </ThemedText>
              </TouchableOpacity>
              {isEditingZone && (
                <View className="mt-2">
                  <ThemedText className="text-center text-gray-600">
                    Long press on map to set safe zone center
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>
      ) : null}

      {/* Tombol Floating Call */}
      <View className="flex flex-row items-center justify-center px-4 w-full">
        <TouchableOpacity
          className={`${
            !inSafeZone && location?.coords ? "bg-orange-500" : "bg-teal-500"
          } p-3 w-full items-center justify-center shadow-lg rounded-full`}
          onPress={handleEmergencyCall}
        >
          <View className="flex flex-row items-center justify-center gap-2">
            <Ionicons name="call-outline" size={28} color="white" />
            <ThemedText className="text-white">Hubungi Sekarang</ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LocationPage;
