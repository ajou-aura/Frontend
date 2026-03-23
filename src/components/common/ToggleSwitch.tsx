import { colors, spacing } from "@/src/theme/tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  leftLabel?: string;
  rightLabel?: string;
};

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  leftLabel,
  rightLabel
}: ToggleSwitchProps) {
  const hasSideLabels = Boolean(leftLabel || rightLabel);

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {hasSideLabels ? (
        <>
          {leftLabel ? (
            <Text style={[styles.sideLabel, !checked && styles.activeSideLabel]}>
              {leftLabel}
            </Text>
          ) : null}
          <Pressable
            onPress={() => !disabled && onChange(!checked)}
            style={[styles.track, checked && styles.checkedTrack]}
          >
            <View style={[styles.thumb, checked && styles.checkedThumb]} />
          </Pressable>
          {rightLabel ? (
            <Text style={[styles.sideLabel, checked && styles.activeSideLabel]}>
              {rightLabel}
            </Text>
          ) : null}
        </>
      ) : (
        <>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          <Pressable
            onPress={() => !disabled && onChange(!checked)}
            style={[styles.track, checked && styles.checkedTrack]}
          >
            <View style={[styles.thumb, checked && styles.checkedThumb]} />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  disabled: {
    opacity: 0.5
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  },
  sideLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600"
  },
  activeSideLabel: {
    color: colors.text
  },
  track: {
    width: 44,
    height: 24,
    borderRadius: 24,
    justifyContent: "center",
    backgroundColor: "#CCCCCC",
    paddingHorizontal: 2
  },
  checkedTrack: {
    backgroundColor: colors.auraBlue
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: colors.surface
  },
  checkedThumb: {
    alignSelf: "flex-end"
  }
});
