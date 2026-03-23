import { colors, radii, spacing } from "@/src/theme/tokens";
import type { UserProfile } from "@/src/types/auth";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type AccountInfoCardProps = {
  profile: UserProfile | null;
  departmentsLabel: string;
};

export function AccountInfoCard({
  profile,
  departmentsLabel
}: AccountInfoCardProps) {
  if (!profile) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={32} color={colors.auraBlue} />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>이름</Text>
          <Text style={styles.value}>{profile.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>이메일</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>학과</Text>
          <Text style={styles.value}>{departmentsLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0EFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    flex: 1
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10
  },
  label: {
    width: 56,
    marginRight: 15,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "500"
  },
  value: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "500"
  }
});
