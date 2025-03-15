import { Text, type TextProps, StyleSheet } from "react-native";

export type ThemedTextProps = TextProps;

export function ThemedText({ style, ...rest }: ThemedTextProps) {
  return <Text style={styles.regular} {...rest} />;
}

const styles = StyleSheet.create({
  regular: {
    fontFamily: "Montserrat",
  },
});
