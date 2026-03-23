import { colors, spacing } from "@/src/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type AppBarProps = {
  showSearch?: boolean;
  searchOpen?: boolean;
  searchValue?: string;
  onToggleSearch?: () => void;
  onCloseSearch?: () => void;
  onSearchChange?: (value: string) => void;
};

export function AppBar({
  showSearch = false,
  searchOpen = false,
  searchValue = "",
  onToggleSearch,
  onCloseSearch,
  onSearchChange
}: AppBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        <View style={styles.side} />
        <Text style={styles.logo}>AURA</Text>
        {showSearch ? (
          <Pressable style={styles.iconButton} onPress={onToggleSearch}>
            <Ionicons
              name={searchOpen ? "search" : "search-outline"}
              size={22}
              color="#575757"
            />
          </Pressable>
        ) : (
          <View style={styles.side} />
        )}
      </View>
      {showSearch && searchOpen ? (
        <View style={styles.searchRow}>
          <TextInput
            placeholder="검색어 입력"
            placeholderTextColor={colors.textMuted}
            value={searchValue}
            onChangeText={onSearchChange}
            style={styles.input}
          />
          <Pressable style={styles.closeButton} onPress={onCloseSearch}>
            <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: spacing.md
  },
  side: {
    width: 32,
    height: 32
  },
  logo: {
    color: colors.auraBlue,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 18,
    paddingBottom: spacing.md
  },
  input: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  }
});
