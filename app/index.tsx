import { LoadingState } from "@/src/components/common/LoadingState";
import { restoreWebCookieSession } from "@/src/lib/auth/service";
import { useAuth } from "@/src/lib/auth/useAuth";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, SafeAreaView, StyleSheet } from "react-native";
import { colors } from "@/src/theme/tokens";

export default function IndexPage() {
  const auth = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ signUp?: string; signup?: string }>();
  const [processingWebRedirect, setProcessingWebRedirect] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const rawSignUp = params.signUp ?? params.signup;
    if (typeof rawSignUp !== "string") {
      return;
    }

    setProcessingWebRedirect(true);
    void restoreWebCookieSession(rawSignUp.toLowerCase() === "true").then((restored) => {
      if (!restored) {
        router.replace("/login");
        return;
      }

      router.replace(rawSignUp.toLowerCase() === "true" ? "/select-department" : "/notice");
    }).finally(() => {
      setProcessingWebRedirect(false);
    });
  }, [params.signUp, params.signup, router]);

  if (!auth.hydrated || auth.bootstrapping || processingWebRedirect) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="세션 확인 중" />
      </SafeAreaView>
    );
  }

  if (!auth.session) {
    return <Redirect href="/login" />;
  }

  if (auth.needsOnboarding) {
    return <Redirect href="/select-department" />;
  }

  return <Redirect href="/notice" />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  }
});
