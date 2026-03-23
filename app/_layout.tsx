import { ToastViewport } from "@/src/components/common/ToastViewport";
import { initializeAuth } from "@/src/lib/auth/service";
import {
  getInitialNotificationRoutePayload,
  listenForNotificationOpen
} from "@/src/lib/notifications/service";
import { colors } from "@/src/theme/tokens";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    void initializeAuth();
  }, []);

  useEffect(() => {
    let active = true;

    void getInitialNotificationRoutePayload().then((payload) => {
      if (!active || !payload?.link) {
        return;
      }

      router.replace({
        pathname: "/notice",
        params: {
          noticeLink: payload.link
        }
      });
    });

    const unsubscribe = listenForNotificationOpen((payload) => {
      if (!payload.link) {
        return;
      }

      router.push({
        pathname: "/notice",
        params: {
          noticeLink: payload.link
        }
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="oauth-callback" />
          <Stack.Screen name="select-department" />
          <Stack.Screen name="auth/error" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <ToastViewport />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
