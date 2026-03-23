import { EmptyState } from "@/src/components/common/EmptyState";
import { ErrorState } from "@/src/components/common/ErrorState";
import { LoadingState } from "@/src/components/common/LoadingState";
import { ScreenShell } from "@/src/components/common/ScreenShell";
import { AppBar } from "@/src/components/navigation/AppBar";
import { NoticeCard } from "@/src/components/notice/NoticeCard";
import { listNoticeBookmarks, setNoticeBookmark } from "@/src/features/bookmarks/api";
import { notify } from "@/src/lib/toast";
import { colors, spacing } from "@/src/theme/tokens";
import type { Notice } from "@/src/types/notices";
import { openExternalUrl } from "@/src/utils/browser";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";

type GroupedBookmarks = {
  key: string;
  label: string;
  items: Notice[];
};

function normalizeType(type: string) {
  return type.toLowerCase().split(".")[0];
}

const labelMap: Record<string, string> = {
  general: "일반",
  scholarship: "장학",
  dormitory: "생활관",
  department: "학과"
};

export function BookmarkScreen() {
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());

  const loadBookmarks = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const nextItems = await listNoticeBookmarks();
      setItems(nextItems);
      setBookmarkIds(new Set(nextItems.map((notice) => String(notice.id))));
    } catch (caught: any) {
      setError(caught?.message ?? "북마크 목록을 불러오지 못했습니다.");
      setItems([]);
      setBookmarkIds(new Set());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBookmarks();
    }, [loadBookmarks])
  );

  const sections = useMemo<GroupedBookmarks[]>(() => {
    const grouped = new Map<string, Notice[]>();

    items.forEach((notice) => {
      const type = normalizeType(notice.type);
      grouped.set(type, [...(grouped.get(type) ?? []), notice]);
    });

    return ["general", "scholarship", "dormitory", "department"]
      .map((type) => ({
        key: type,
        label: labelMap[type] ?? type,
        items: grouped.get(type) ?? []
      }))
      .filter((section) => section.items.length > 0);
  }, [items]);

  async function handleToggleBookmark(id: string, next: boolean) {
    try {
      await setNoticeBookmark(id, next);
      await loadBookmarks();
    } catch {
      notify.error("북마크 처리에 실패했습니다.");
      await loadBookmarks();
    }
  }

  return (
    <ScreenShell
      header={<AppBar />}
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadBookmarks();
            }}
          />
        )
      }}
    >
      {sections.map((section) => (
        <View key={section.key} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.label}</Text>
          <View style={styles.list}>
            {section.items.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                bookmarked={bookmarkIds.has(notice.id)}
                onToggleBookmark={handleToggleBookmark}
                onPress={(nextNotice) => openExternalUrl(nextNotice.link)}
                showTypeTag
              />
            ))}
          </View>
        </View>
      ))}

      {loading ? <LoadingState overlay /> : null}
      {!loading && error ? (
        <ErrorState message={error} onRetry={() => void loadBookmarks()} />
      ) : null}
      {!loading && !error && items.length === 0 ? (
        <EmptyState message="북마크한 공지사항이 없습니다." />
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginLeft: spacing.lg,
    marginBottom: spacing.sm
  },
  list: {
    gap: 10
  }
});
