import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import React from "react";
import { Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Page = () => {
  return (
    <SafeAreaView>
      <ThemedText>login</ThemedText>
      <Button title="Register" onPress={() => router.push("/register")} />
      <Button title="login" onPress={() => router.push("/home")} />
    </SafeAreaView>
  );
};

export default Page;
