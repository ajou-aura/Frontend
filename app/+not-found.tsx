import { Link } from "expo-router";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import { colors, spacing } from "@/src/theme/tokens";

export default function NotFoundPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>페이지를 찾을 수 없습니다.</Text>
      <Link href="/notice" style={styles.link}>
        공지 화면으로 돌아가기
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.background
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700"
  },
  link: {
    color: colors.auraBlue,
    fontSize: 15,
    fontWeight: "700"
  }
});
