import { colors, radii, shadow, spacing } from "@/src/theme/tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";

type TabItem = {
  label: string;
  content: React.ReactNode;
};

type CollapsibleTabsProps = {
  title: string;
  items: TabItem[];
  openIndex: number | null;
  onTabClick: (index: number | null) => void;
};

export function CollapsibleTabs({
  title,
  items,
  openIndex,
  onTabClick
}: CollapsibleTabsProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.tabs}>
          {items.map((item, index) => {
            const active = openIndex === index;
            return (
              <Pressable
                key={item.label}
                style={[styles.tabButton, active && styles.activeTabButton]}
                onPress={() => onTabClick(active ? null : index)}
              >
                <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {openIndex !== null ? <View style={styles.body}>{items[openIndex]?.content}</View> : null}
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tabButton: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: 5
  },
  activeTabButton: {
    backgroundColor: colors.auraBlue,
    borderColor: colors.auraBlue
  },
  tabLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700"
  },
  activeTabLabel: {
    color: colors.surface
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg
  }
});
