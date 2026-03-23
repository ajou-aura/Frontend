import type { ConfigContext, ExpoConfig } from "expo/config";

const trim = (value?: string) => (value ?? "").trim();

export default ({ config }: ConfigContext): ExpoConfig => {
  const explicitApiBaseUrl = trim(process.env.EXPO_PUBLIC_API_BASE_URL);
  const apiScheme = trim(process.env.EXPO_PUBLIC_API_SCHEME) || "http";
  const apiPort = trim(process.env.EXPO_PUBLIC_API_PORT) || "8080";
  const androidEmulatorHost =
    trim(process.env.EXPO_PUBLIC_API_ANDROID_EMULATOR_HOST) || "10.0.2.2";
  const iosSimulatorHost =
    trim(process.env.EXPO_PUBLIC_API_IOS_SIMULATOR_HOST) || "localhost";
  const webHost = trim(process.env.EXPO_PUBLIC_API_WEB_HOST) || "localhost";
  const deviceHost = trim(process.env.EXPO_PUBLIC_API_DEVICE_HOST);
  const aboutPageUrl = trim(process.env.EXPO_PUBLIC_ABOUT_PAGE_URL);

  return {
    ...config,
    name: "AURA",
    slug: "aura-rn",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "aura",
    userInterfaceStyle: "light",
    icon: "./assets/images/icon.png",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#f7f8fa"
    },
    ios: {
      bundleIdentifier: "kr.ai.code0.aura",
      supportsTablet: true
    },
    android: {
      package: "kr.ai.code0.aura",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      predictiveBackGestureEnabled: false
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      "expo-dev-client",
      [
        "expo-font",
        {
          fonts: [
            "./node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf"
          ]
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      explicitApiBaseUrl,
      apiScheme,
      apiPort,
      androidEmulatorHost,
      iosSimulatorHost,
      webHost,
      deviceHost,
      aboutPageUrl
    }
  };
};
