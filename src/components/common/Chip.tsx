import { colors, radii, spacing } from "@/src/theme/tokens";
import { Pressable, StyleSheet, Text } from "react-native";

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  disabled?: boolean;
};

export function Chip({ label, active = false, onPress, disabled }: ChipProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.chip, active && styles.active, disabled && styles.disabled]}
    >
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.chip,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6
  },
  active: {
    backgroundColor: colors.auraBlue
  },
  disabled: {
    opacity: 0.5
  },
  label: {
    color: colors.chipText,
    fontSize: 12,
    fontWeight: "700"
  },
  activeLabel: {
    color: colors.surface
  }
});
