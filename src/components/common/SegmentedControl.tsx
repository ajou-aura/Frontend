import { colors, radii, spacing } from "@/src/theme/tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SegmentOption<T extends string> = {
  key: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled = false
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            disabled={disabled}
            style={[styles.segment, active && styles.activeSegment]}
            onPress={() => onChange(option.key)}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm
  },
  segment: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surface
  },
  activeSegment: {
    backgroundColor: colors.auraBlue,
    borderColor: colors.auraBlue
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700"
  },
  activeLabel: {
    color: colors.surface
  }
});
