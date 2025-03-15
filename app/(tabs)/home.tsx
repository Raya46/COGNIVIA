import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Page = () => {
  return (
    <SafeAreaView>
      <ThemedText className="text-3xl font-bold">home</ThemedText>
    </SafeAreaView>
  );
};

export default Page;
