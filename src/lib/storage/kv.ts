import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const memoryFallback = new Map<string, string>();

function getWebStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export async function getStoredValue(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    const storage = getWebStorage();
    return storage?.getItem(key) ?? memoryFallback.get(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

export async function setStoredValue(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    const storage = getWebStorage();
    if (storage) {
      storage.setItem(key, value);
      return;
    }

    memoryFallback.set(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function removeStoredValue(key: string): Promise<void> {
  if (Platform.OS === "web") {
    const storage = getWebStorage();
    storage?.removeItem(key);
    memoryFallback.delete(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}
