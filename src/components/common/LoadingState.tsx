import { colors, spacing } from "@/src/theme/tokens";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

type LoadingStateProps = {
  message?: string;
  overlay?: boolean;
};

export function LoadingState({
  message = "로딩 중",
  overlay = false
}: LoadingStateProps) {
  return (
    <View style={[styles.container, overlay && styles.overlay]}>
      <ActivityIndicator color={colors.auraBlue} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xxl
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    zIndex: 10
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600"
  }
});
