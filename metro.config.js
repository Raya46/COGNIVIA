const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

// Dapatkan config default
const config = getDefaultConfig(__dirname);

// Terapkan konfigurasi NativeWind dan Reanimated secara berurutan
const windConfig = withNativeWind(config, { input: "./global.css" });
const finalConfig = wrapWithReanimatedMetroConfig(windConfig);

// Export konfigurasi final
module.exports = finalConfig;
