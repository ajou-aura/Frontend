import { beginGoogleLogin } from "@/src/lib/auth/service";
import { useAuth } from "@/src/lib/auth/useAuth";
import { notify } from "@/src/lib/toast";
import { colors, spacing } from "@/src/theme/tokens";
import { parseLinkQuery } from "@/src/utils/browser";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";

const GoogleIcon = () => (
  <View style={styles.googleIcon}>
    <Text style={styles.googleIconText}>G</Text>
  </View>
);

export function LoginScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.hydrated || !auth.session) {
      return;
    }

    router.replace(auth.needsOnboarding ? "/select-department" : "/notice");
  }, [auth.hydrated, auth.needsOnboarding, auth.session, router]);

  async function handleLogin() {
    setSubmitting(true);

    try {
      const result = await beginGoogleLogin();

      if ("type" in result && result.type === "success" && "url" in result && result.url) {
        const params = parseLinkQuery(result.url) as Record<string, string | string[]>;
        router.replace({
          pathname: "/oauth-callback",
          params: Object.fromEntries(
            Object.entries(params).map(([key, value]) => [key, String(value)])
          )
        });
        return;
      }

      if ("type" in result && (result.type === "cancel" || result.type === "dismiss")) {
        notify.info("로그인이 취소되었습니다.");
      }
    } catch {
      notify.error("로그인 화면을 열 수 없습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.welcome}>환영합니다</Text>
          <Text style={styles.logo}>AURA</Text>
          <Text style={styles.introduction}>
            아주대학교 공지사항을 알림으로 받아보세요.
          </Text>

          <Pressable
            style={[styles.googleButton, submitting && styles.disabledButton]}
            onPress={handleLogin}
            disabled={submitting}
          >
            <GoogleIcon />
            <Text style={styles.googleButtonText}>Google로 로그인</Text>
          </Pressable>

          <Text style={styles.subText}>아주대학교 계정으로만 로그인 가능합니다.</Text>
        </View>

        <Text style={styles.footer}>
          이 애플리케이션은 아주대학교 공식 사업과 무관합니다.
        </Text>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  welcome: {
    color: "#6B7280",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  logo: {
    color: colors.auraBlue,
    fontSize: 72,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 12
  },
  introduction: {
    color: "#4B5563",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 28
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginBottom: spacing.sm
  },
  disabledButton: {
    opacity: 0.55
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  googleIconText: {
    color: "#4285F4",
    fontSize: 18,
    fontWeight: "900"
  },
  googleButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "700"
  },
  subText: {
    color: "#77828C",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center"
  },
  footer: {
    color: "#77828C",
    fontSize: 14,
    textAlign: "center"
  }
});
