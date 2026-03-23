import { colors, spacing } from "@/src/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type EmptyStateProps = {
  message: string;
};

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="document-text-outline" size={28} color={colors.textSubtle} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxxl
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600"
  }
});
