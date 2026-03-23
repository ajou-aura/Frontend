import { LoadingState } from "@/src/components/common/LoadingState";
import { notify } from "@/src/lib/toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { colors } from "@/src/theme/tokens";

export default function AuthErrorPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ message?: string }>();

  useEffect(() => {
    notify.error(params.message ?? "아주대학교 계정으로만 로그인 가능합니다.");
    router.replace("/login");
  }, [params.message, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LoadingState message="로그인 화면으로 이동 중" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  }
});
