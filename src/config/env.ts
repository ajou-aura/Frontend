import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

type ResolutionReason =
  | "explicit"
  | "android-emulator"
  | "ios-simulator"
  | "web-preview"
  | "physical-device"
  | "expo-host-fallback";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

const trim = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const normalizeApiBaseUrl = (value: string) => {
  const withoutSlash = stripTrailingSlash(value);
  return withoutSlash.endsWith("/api") ? withoutSlash : `${withoutSlash}/api`;
};

const extractHost = (value: string) =>
  value
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0]
    .trim();

const getExpoHostCandidate = () => {
  const manifest2 = (Constants as unknown as {
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  }).manifest2;
  const manifest = (Constants as unknown as {
    manifest?: { debuggerHost?: string };
    expoGoConfig?: { debuggerHost?: string };
  }).manifest;

  const candidates = [
    trim(
      (
        Constants.expoConfig as unknown as {
          hostUri?: string;
        } | null
      )?.hostUri
    ),
    trim(manifest2?.extra?.expoClient?.hostUri),
    trim(manifest?.debuggerHost),
    trim(
      (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } })
        .expoGoConfig?.debuggerHost
    )
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const host = extractHost(candidate);
    if (host) {
      return host;
    }
  }

  return "";
};

function resolveApiBaseUrl() {
  const explicit =
    trim(process.env.EXPO_PUBLIC_API_BASE_URL) || trim(extra.explicitApiBaseUrl);
  if (explicit) {
    return {
      apiBaseUrl: normalizeApiBaseUrl(explicit),
      apiResolution: "explicit" as const
    };
  }

  const apiScheme =
    trim(process.env.EXPO_PUBLIC_API_SCHEME) || trim(extra.apiScheme) || "http";
  const apiPort =
    trim(process.env.EXPO_PUBLIC_API_PORT) || trim(extra.apiPort) || "8080";
  const androidEmulatorHost =
    trim(process.env.EXPO_PUBLIC_API_ANDROID_EMULATOR_HOST) ||
    trim(extra.androidEmulatorHost) ||
    "10.0.2.2";
  const iosSimulatorHost =
    trim(process.env.EXPO_PUBLIC_API_IOS_SIMULATOR_HOST) ||
    trim(extra.iosSimulatorHost) ||
    "localhost";
  const webHost =
    trim(process.env.EXPO_PUBLIC_API_WEB_HOST) || trim(extra.webHost) || "localhost";
  const deviceHost =
    trim(process.env.EXPO_PUBLIC_API_DEVICE_HOST) || trim(extra.deviceHost);
  const expoHost = getExpoHostCandidate();

  let host = webHost;
  let apiResolution: ResolutionReason = "web-preview";

  if (Platform.OS === "android" && !Device.isDevice) {
    host = androidEmulatorHost;
    apiResolution = "android-emulator";
  } else if (Platform.OS === "ios" && !Device.isDevice) {
    host = iosSimulatorHost;
    apiResolution = "ios-simulator";
  } else if (Platform.OS === "web") {
    host =
      webHost ||
      (typeof window !== "undefined" ? window.location.hostname : "localhost");
    apiResolution = "web-preview";
  } else if (deviceHost) {
    host = deviceHost;
    apiResolution = "physical-device";
  } else if (expoHost) {
    host = expoHost;
    apiResolution = "expo-host-fallback";
  }

  return {
    apiBaseUrl: normalizeApiBaseUrl(`${apiScheme}://${host}:${apiPort}`),
    apiResolution
  };
}

const resolved = resolveApiBaseUrl();
const aboutPageUrl =
  trim(process.env.EXPO_PUBLIC_ABOUT_PAGE_URL) || trim(extra.aboutPageUrl);

if (__DEV__) {
  console.info(
    `[env] Resolved API base URL: ${resolved.apiBaseUrl} (${resolved.apiResolution})`
  );
}

export const env = {
  apiBaseUrl: resolved.apiBaseUrl,
  apiResolution: resolved.apiResolution,
  aboutPageUrl
} as const;
