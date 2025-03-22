import { View, TextInput, TextInputProps } from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Control, Controller } from "react-hook-form";

interface TextInputCustomProps extends TextInputProps {
  placeholder: string;
  showable?: boolean;
  padding?: string;
  name: string;
  control: Control<any>;
  onComplete?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onSubmitEditing?: () => void;
}

const TextInputCustom = ({
  placeholder,
  showable,
  padding,
  name,
  control,
  onComplete,
  maxLength,
  keyboardType,
  value,
  onChangeText,
  leftIcon,
  onSubmitEditing,
  ...props
}: TextInputCustomProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View
      className={`${padding} my-2 rounded-lg border border-gray-300 flex flex-row justify-between items-center p-2 py-3 pr-4`}
    >
      {leftIcon && (
        <Ionicons name={leftIcon} size={24} color="gray" className="ml-2" />
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value: fieldValue } }) => (
          <TextInput
            placeholder={placeholder}
            value={value !== undefined ? value : fieldValue}
            onChangeText={(text) => {
              onChange(text);
              onChangeText?.(text);
            }}
            onSubmitEditing={onSubmitEditing}
            secureTextEntry={showable && !showPassword}
            className="px-2 w-full h-full text-base flex-auto"
            {...props}
          />
        )}
      />
      {showable && (
        <Ionicons
          name={showPassword ? "eye-off" : "eye"}
          size={24}
          color="#E2E8F0"
          onPress={() => setShowPassword(!showPassword)}
          className="flex-auto"
        />
      )}
    </View>
  );
};

export default TextInputCustom;
