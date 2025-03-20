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
  ...props
}: TextInputCustomProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <View
        className={`${padding} my-2 rounded-lg border border-gray-300 flex flex-row justify-between items-center p-2 py-3 pr-4 `}
      >
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
              secureTextEntry={showable && !showPassword}
              className=" px-2 w-full h-full text-base flex-shrink"
            />
          )}
        />
        {showable && (
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="#E2E8F0"
            onPress={() => setShowPassword(!showPassword)}
            className="flex-auto "
          />
        )}
      </View>
    </>
  );
};

export default TextInputCustom;
