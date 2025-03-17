import { router, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  Image,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { ThemedText } from "@/components/ThemedText";
import { useCallback, useRef, useState } from "react";

const { height } = Dimensions.get("window");
const tabBarHeight = height * 0.08;

// Komponen untuk tombol Add
const AddButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.addButton} onPress={onPress}>
      <View style={styles.addButtonInner}>
        <Ionicons name="add" size={36} color="white" />
      </View>
    </TouchableOpacity>
  );
};

const dummyImages = [
  { id: "1", url: "https://picsum.photos/200/200?random=1" },
  { id: "2", url: "https://picsum.photos/200/200?random=2" },
  { id: "3", url: "https://picsum.photos/200/200?random=3" },
  { id: "4", url: "https://picsum.photos/200/200?random=4" },
  { id: "5", url: "https://picsum.photos/200/200?random=5" },
  { id: "6", url: "https://picsum.photos/200/200?random=6" },
  { id: "7", url: "https://picsum.photos/200/200?random=6" },
  { id: "8", url: "https://picsum.photos/200/200?random=6" },
  { id: "9", url: "https://picsum.photos/200/200?random=6" },
  { id: "10", url: "https://picsum.photos/200/200?random=6" },
];

const ImageGrid = ({
  onImageSelect,
}: {
  onImageSelect: (imageUrl: string) => void;
}) => {
  return (
    <FlatList
      data={dummyImages}
      numColumns={3}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="flex-1 m-1 aspect-square"
          onPress={() => onImageSelect(item.url)}
        >
          <Image
            source={{ uri: item.url }}
            className="w-full h-full rounded-md"
          />
        </TouchableOpacity>
      )}
    />
  );
};

export default function Layout() {
  const sheetRef = useRef<BottomSheet>(null);
  const [isOpen, setIsOpen] = useState(true);
  const snapPoints = ["60%"];
  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
    setIsOpen(true);
  }, []);
  const handleImageSelect = useCallback((imageUrl: string) => {
    sheetRef.current?.close();
    setTimeout(() => {
      router.push({
        pathname: "/(untab)/posting",
        params: { selectedImage: imageUrl },
      });
    }, 300);
  }, []);
  return (
    <GestureHandlerRootView>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#2A9E9E",
          tabBarInactiveTintColor: "#B1D7D8",
          animation: "none",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            height: tabBarHeight,
            paddingBottom: height * 0.015,
            paddingTop: height * 0.01,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="guess-me"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "book" : "book-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        {/* Tombol Add di tengah */}
        <Tabs.Screen
          name="add"
          options={{
            tabBarButton: (props) => (
              <AddButton
                onPress={() => {
                  // router.push("/(untab)/posting");
                  handleSnapPress(0);
                }}
              />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              // Mencegah navigasi default
              e.preventDefault();
            },
          }}
        />
        <Tabs.Screen
          name="location"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "location" : "location-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        onClose={() => setIsOpen(false)}
        index={-1}
      >
        <BottomSheetView>
          <ThemedText className="text-center font-bold text-lg">
            Tambahkan Foto
          </ThemedText>
          <View className="flex flex-row justify-between mx-3 items-center">
            <Ionicons name="close-outline" size={24} />
            <View className="flex flex-row gap-3 my-3">
              <View className="bg-[#B1D7D8] rounded-l-full rounded-r-full px-6 py-1">
                <ThemedText className="text-[#008B8B]">Foto</ThemedText>
              </View>
              <View className="bg-[#B1D7D8] rounded-l-full rounded-r-full px-6 py-1">
                <ThemedText className="text-[#008B8B]">Album</ThemedText>
              </View>
            </View>
            <Ionicons name="ellipsis-vertical" size={24} />
          </View>
          <ImageGrid onImageSelect={handleImageSelect} />
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    top: -(height * 0.03),
    left: 20,
    justifyContent: "center",
    alignItems: "center",
    width: height * 0.06,
    height: height * 0.06,
  },
  addButtonInner: {
    width: height * 0.07,
    height: height * 0.07,
    borderRadius: height * 0.04,
    backgroundColor: "#2A9E9E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
