import { colors, radii, shadow, spacing } from "@/src/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CollapsibleCardProps = PropsWithChildren<{
  title: string;
  defaultOpen?: boolean;
}>;

export function CollapsibleCard({
  title,
  children,
  defaultOpen = false
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.card}>
      <Pressable style={styles.header} onPress={() => setOpen((value) => !value)}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadow.card
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: 18
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg
  }
});
