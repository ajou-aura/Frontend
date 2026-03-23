import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

export async function openExternalUrl(url: string): Promise<void> {
  if (!url) {
    return;
  }

  if (Platform.OS === "web") {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  await WebBrowser.openBrowserAsync(url, {
    showTitle: true,
    controlsColor: "#4A6DDB"
  });
}

export function parseLinkQuery(url: string) {
  return Linking.parse(url).queryParams ?? {};
}
