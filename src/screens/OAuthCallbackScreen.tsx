import { completeNativeOAuth } from "@/src/lib/auth/service";
import { getAuthState } from "@/src/lib/auth/store";
import { notify } from "@/src/lib/toast";
import { colors, spacing } from "@/src/theme/tokens";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";

export function OAuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    status?: string;
    message?: string;
  }>();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) {
      return;
    }

    handled.current = true;

    (async () => {
      if (params.code) {
        try {
          const nextRoute = await completeNativeOAuth(params.code);
          router.replace(nextRoute);
          return;
        } catch {
          const auth = getAuthState();
          if (auth.session) {
            router.replace(auth.needsOnboarding ? "/select-department" : "/notice");
            return;
          }
          notify.error("로그인 처리에 실패했습니다.");
        }
      } else {
        notify.error(params.message ?? "로그인을 완료하지 못했습니다.");
      }

      router.replace("/login");
    })();
  }, [params.code, params.message, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ActivityIndicator color={colors.auraBlue} />
        <Text style={styles.message}>로그인 처리 중입니다.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600"
  }
});
