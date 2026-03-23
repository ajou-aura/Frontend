import { colors, radii, shadow, spacing } from "@/src/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type ChipCollapseProps = PropsWithChildren<{
  defaultOpen?: boolean;
}>;

export function ChipCollapse({
  children,
  defaultOpen = false
}: ChipCollapseProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.container}>
      {open ? <View style={styles.body}>{children}</View> : null}
      <Pressable style={styles.toggle} onPress={() => setOpen((value) => !value)}>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#EDF0F4",
    borderRadius: radii.lg,
    overflow: "hidden",
    marginTop: spacing.md,
    ...shadow.card
  },
  body: {
    paddingHorizontal: 10,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md
  },
  toggle: {
    alignItems: "center",
    justifyContent: "center",
    height: 35
  }
});
