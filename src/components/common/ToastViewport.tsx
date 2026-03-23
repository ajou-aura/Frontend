import { dismissToast, getToasts, subscribeToasts } from "@/src/lib/toast";
import { colors, radii, spacing } from "@/src/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSyncExternalStore } from "react";

const toneMap = {
  success: { background: "#E8F8ED", color: colors.success, icon: "checkmark-circle" },
  error: { background: "#FCEDEC", color: colors.danger, icon: "alert-circle" },
  warn: { background: "#FFF6E8", color: colors.warning, icon: "warning" },
  info: { background: "#EEF5FF", color: colors.auraBlue, icon: "information-circle" }
} as const;

export function ToastViewport() {
  const insets = useSafeAreaInsets();
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { top: insets.top + spacing.sm }]}
    >
      {toasts.map((toast) => {
        const tone = toneMap[toast.tone];
        return (
          <Pressable
            key={toast.id}
            style={[styles.toast, { backgroundColor: tone.background }]}
            onPress={() => dismissToast(toast.id)}
          >
            <Ionicons name={tone.icon} size={18} color={tone.color} />
            <Text style={[styles.message, { color: tone.color }]}>{toast.message}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 40,
    gap: spacing.sm
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700"
  }
});
