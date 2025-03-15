import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions, TouchableOpacity, StyleSheet, View } from "react-native";

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
                // Tambahkan logika ketika tombol add ditekan
                alert("Add button pressed!");
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
