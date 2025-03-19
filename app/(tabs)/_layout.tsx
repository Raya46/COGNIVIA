import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router, Tabs } from "expo-router";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";

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

export default function Layout() {
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
        const newPath = FileSystem.documentDirectory + fileName;

        await FileSystem.copyAsync({
          from: selectedImageUri,
          to: newPath,
        });

        router.push({
          pathname: "/(untab)/posting",
          params: { selectedImage: newPath },
        });
      } catch (error) {
        console.error("Error copying image:", error);
      }
    }
  };
  return (
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
                // handleSnapPress(0);
                pickImage();
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
