import { departmentNameMap } from "@/src/constants/departments";
import { colors, layout, radii, shadow, spacing } from "@/src/theme/tokens";
import type { Notice } from "@/src/types/notices";
import { formatNoticeDate, isNew } from "@/src/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type NoticeCardProps = {
  notice: Notice;
  bookmarked: boolean;
  onToggleBookmark: (id: string, next: boolean) => void | Promise<void>;
  onPress: (notice: Notice) => void;
  showTypeTag?: boolean;
};

function getDepartmentLabel(notice: Notice) {
  if (!notice.department || notice.department === "none") {
    return departmentNameMap[notice.type] ?? "";
  }

  if (notice.department === "관리자") {
    return departmentNameMap[notice.type] ?? "";
  }

  return notice.department;
}

export function NoticeCard({
  notice,
  bookmarked,
  onToggleBookmark,
  onPress,
  showTypeTag = false
}: NoticeCardProps) {
  const departmentLabel = getDepartmentLabel(notice);

  return (
    <View style={styles.card}>
      <View style={styles.ribbon} />
      <Pressable style={styles.body} onPress={() => onPress(notice)}>
        <Text style={styles.title} numberOfLines={2}>
          {notice.title}
        </Text>
        <View style={styles.tags}>
          {showTypeTag ? (
            <Text style={[styles.tag, styles.typeTag]}>
              #{departmentNameMap[notice.type] ?? notice.type}
            </Text>
          ) : null}
          {isNew(notice.date, 1) ? <Text style={styles.todayTag}>#오늘</Text> : null}
          {notice.category && notice.category !== "none" ? (
            <Text style={styles.tag}>#{notice.category}</Text>
          ) : null}
          {departmentLabel ? <Text style={styles.tag}>#{departmentLabel}</Text> : null}
        </View>
      </Pressable>
      <View style={styles.side}>
        <Pressable
          style={styles.bookmarkButton}
          onPress={() => onToggleBookmark(notice.id, !bookmarked)}
        >
          <Ionicons
            name={bookmarked ? "heart" : "heart-outline"}
            size={24}
            color={bookmarked ? colors.danger : "#C0C5CF"}
          />
        </Pressable>
        <Text style={styles.date}>{formatNoticeDate(notice.date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: layout.cardMinHeight,
    flexDirection: "row",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden",
    ...shadow.card
  },
  ribbon: {
    width: 14,
    backgroundColor: colors.auraBlue
  },
  body: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.lg
  },
  title: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  tag: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "500"
  },
  typeTag: {
    color: colors.auraBlue
  },
  todayTag: {
    color: colors.auraBlue,
    fontSize: 12,
    fontWeight: "600"
  },
  side: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingRight: 18,
    minWidth: 72
  },
  bookmarkButton: {
    padding: 2
  },
  date: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: "500"
  }
});
