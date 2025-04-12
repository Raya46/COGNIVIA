import { Text, type TextProps, StyleSheet } from "react-native";

export type ThemedTextProps = TextProps & {
  type?: "default" | "title" | "semibold" | "medium" | "link"; // Add more types as needed
};

export function ThemedText({
  style,
  type = "default", // Default type
  ...rest
}: ThemedTextProps) {
  let fontFamilyStyle;
  switch (type) {
    case "title":
      fontFamilyStyle = styles.bold;
      break;
    case "semibold":
      fontFamilyStyle = styles.semiBold;
      break;
    case "medium":
      fontFamilyStyle = styles.medium;
    case "default":
    default:
      fontFamilyStyle = styles.regular; // Default to Regular
  }

  return (
    <Text
      style={[
        fontFamilyStyle,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Define styles for different font weights using the names from useFonts
  regular: {
    fontFamily: "Manrope_400Regular", // Match the name used in useFonts
  },
  medium: {
    fontFamily: "Manrope_500Medium",
  },
  semiBold: {
    fontFamily: "Manrope_600SemiBold",
  },
  bold: {
    fontFamily: "Manrope_700Bold",
  },
  extraBold: {
    fontFamily: "Manrope_800ExtraBold",
  },
});
