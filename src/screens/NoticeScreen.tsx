import { Chip } from "@/src/components/common/Chip";
import { ChipCollapse } from "@/src/components/common/ChipCollapse";
import { EmptyState } from "@/src/components/common/EmptyState";
import { ErrorState } from "@/src/components/common/ErrorState";
import { LoadingState } from "@/src/components/common/LoadingState";
import { ScreenShell } from "@/src/components/common/ScreenShell";
import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { AppBar } from "@/src/components/navigation/AppBar";
import { NoticeCard } from "@/src/components/notice/NoticeCard";
import { departmentNameMap } from "@/src/constants/departments";
import {
  DEFAULT_GLOBAL_TAGS,
  MATCH_OPTIONS,
  NOTICE_TABS,
  type MatchMode,
  type NoticeTabKey
} from "@/src/constants/notice";
import {
  listNoticeBookmarks,
  setNoticeBookmark
} from "@/src/features/bookmarks/api";
import { fetchNoticePage } from "@/src/features/notices/api";
import {
  listDepartments,
  listGlobalKeywords,
  listKeywords
} from "@/src/features/settings/api";
import { notify } from "@/src/lib/toast";
import { colors, radii, spacing } from "@/src/theme/tokens";
import type { Notice } from "@/src/types/notices";
import type { Keyword } from "@/src/types/settings";
import { openExternalUrl } from "@/src/utils/browser";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";

function mapTagsToIds(tags: string[], keywords: Keyword[]) {
  return tags
    .map((tag) => keywords.find((keyword) => keyword.phrase === tag)?.id)
    .filter((id): id is number => typeof id === "number")
    .join(",");
}

export function NoticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ noticeLink?: string }>();

  const [tab, setTab] = useState<NoticeTabKey>("general");
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [globalTags, setGlobalTags] = useState<string[]>(DEFAULT_GLOBAL_TAGS);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [matchMode, setMatchMode] = useState<MatchMode>("any");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChips = useMemo(() => {
    const phrases = keywords.map((keyword) => keyword.phrase.trim()).filter(Boolean);
    return Array.from(new Set(phrases.length > 0 ? phrases : globalTags));
  }, [globalTags, keywords]);

  const selectedGlobalIds = useMemo(
    () => mapTagsToIds(selectedTags.filter((tag) => globalTags.includes(tag)), keywords),
    [globalTags, keywords, selectedTags]
  );

  const selectedPersonalIds = useMemo(
    () => mapTagsToIds(selectedTags.filter((tag) => !globalTags.includes(tag)), keywords),
    [globalTags, keywords, selectedTags]
  );

  const fetchLookups = useCallback(async () => {
    const [nextDepartments, nextKeywords, nextGlobalKeywords] = await Promise.all([
      listDepartments(),
      listKeywords(),
      listGlobalKeywords().catch(() => [])
    ]);

    setDepartments(nextDepartments);
    setSelectedDepartment((current) =>
      current && nextDepartments.includes(current) ? current : nextDepartments[0] ?? ""
    );
    setKeywords(nextKeywords);
    setGlobalTags(
      nextGlobalKeywords.length > 0
        ? Array.from(
            new Set(
              nextGlobalKeywords
                .map((keyword) => keyword.phrase.trim())
                .filter(Boolean)
            )
          )
        : DEFAULT_GLOBAL_TAGS
    );
  }, []);

  const fetchBookmarks = useCallback(async () => {
    try {
      const items = await listNoticeBookmarks();
      setBookmarkIds(new Set(items.map((notice) => String(notice.id))));
    } catch {
      setBookmarkIds(new Set());
    }
  }, []);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const type =
        tab === "department" ? selectedDepartment || undefined : tab;
      const pageData = await fetchNoticePage({
        page,
        size: 10,
        type,
        search: searchQuery.trim() || undefined,
        globalIds: selectedGlobalIds,
        personalIds: selectedPersonalIds,
        match: matchMode
      });

      setNotices(pageData.content ?? []);
      setTotalPages(pageData.totalPages ?? 1);
    } catch (caught: any) {
      setError(caught?.message ?? "공지 불러오기에 실패했습니다.");
      setNotices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    matchMode,
    page,
    searchQuery,
    selectedDepartment,
    selectedGlobalIds,
    selectedPersonalIds,
    tab
  ]);

  useFocusEffect(
    useCallback(() => {
      void fetchLookups();
      void fetchBookmarks();
    }, [fetchBookmarks, fetchLookups])
  );

  useEffect(() => {
    void fetchLookups();
    void fetchBookmarks();
  }, [fetchBookmarks, fetchLookups]);

  useEffect(() => {
    void fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    if (!params.noticeLink) {
      return;
    }

    void openExternalUrl(params.noticeLink);
    router.replace("/notice");
  }, [params.noticeLink, router]);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
    setPage(0);
  }

  async function handleToggleBookmark(id: string, next: boolean) {
    const key = String(id);

    setBookmarkIds((current) => {
      const nextSet = new Set(current);
      if (next) {
        nextSet.add(key);
      } else {
        nextSet.delete(key);
      }
      return nextSet;
    });

    try {
      await setNoticeBookmark(id, next);
    } catch {
      setBookmarkIds((current) => {
        const nextSet = new Set(current);
        if (next) {
          nextSet.delete(key);
        } else {
          nextSet.add(key);
        }
        return nextSet;
      });
      notify.error("북마크 처리에 실패했습니다.");
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    void Promise.all([fetchLookups(), fetchBookmarks(), fetchNotices()]);
  }

  return (
    <ScreenShell
      header={
        <AppBar
          showSearch
          searchOpen={searchOpen}
          searchValue={searchQuery}
          onToggleSearch={() => setSearchOpen(true)}
          onCloseSearch={() => {
            setSearchOpen(false);
            setSearchQuery("");
            setPage(0);
          }}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setPage(0);
          }}
        />
      }
      scrollProps={{
        refreshControl: (
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        )
      }}
    >
      <View style={styles.tabs}>
        {NOTICE_TABS.map((noticeTab) => {
          const active = tab === noticeTab.key;
          return (
            <Pressable
              key={noticeTab.key}
              style={[styles.tabButton, active && styles.activeTabButton]}
              onPress={() => {
                setTab(noticeTab.key);
                setPage(0);
              }}
            >
              <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>
                {noticeTab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {tab === "department" && departments.length > 0 ? (
        <ChipCollapse>
          <View style={styles.chips}>
            {departments.map((departmentCode) => (
              <Chip
                key={departmentCode}
                label={`#${departmentNameMap[departmentCode] ?? departmentCode}`}
                active={selectedDepartment === departmentCode}
                onPress={() => {
                  setSelectedDepartment(departmentCode);
                  setPage(0);
                }}
              />
            ))}
          </View>
        </ChipCollapse>
      ) : null}

      <ChipCollapse>
        <SegmentedControl
          options={MATCH_OPTIONS}
          value={matchMode}
          onChange={(nextMode) => {
            setMatchMode(nextMode);
            setPage(0);
          }}
        />
        <View style={styles.chips}>
          {allChips.map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              active={selectedTags.includes(tag)}
              onPress={() => toggleTag(tag)}
            />
          ))}
        </View>
      </ChipCollapse>

      <View style={styles.list}>
        {notices.map((notice) => (
          <NoticeCard
            key={notice.id}
            notice={notice}
            bookmarked={bookmarkIds.has(notice.id)}
            onToggleBookmark={handleToggleBookmark}
            onPress={(nextNotice) => openExternalUrl(nextNotice.link)}
          />
        ))}
      </View>

      {loading ? <LoadingState overlay /> : null}
      {!loading && error ? (
        <ErrorState message={error} onRetry={() => void fetchNotices()} />
      ) : null}
      {!loading && !error && notices.length === 0 ? (
        <EmptyState message="공지사항이 없습니다." />
      ) : null}

      {totalPages > 1 ? (
        <View style={styles.pagination}>
          <Pressable
            style={[styles.pageArrow, page <= 0 && styles.disabledPageButton]}
            disabled={page <= 0}
            onPress={() => setPage((current) => Math.max(0, current - 1))}
          >
            <Text style={styles.pageArrowText}>‹</Text>
          </Pressable>
          <View style={styles.pageNumbers}>
            {Array.from({ length: Math.min(6, totalPages) }).map((_, index) => {
              const start = Math.floor(page / 6) * 6;
              const pageIndex = start + index;
              if (pageIndex >= totalPages) {
                return null;
              }

              const active = page === pageIndex;
              return (
                <Pressable key={pageIndex} onPress={() => setPage(pageIndex)}>
                  <Text style={[styles.pageNumber, active && styles.activePageNumber]}>
                    {pageIndex + 1}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            style={[
              styles.pageArrow,
              page >= totalPages - 1 && styles.disabledPageButton
            ]}
            disabled={page >= totalPages - 1}
            onPress={() =>
              setPage((current) => Math.min(totalPages - 1, current + 1))
            }
          >
            <Text style={styles.pageArrowText}>›</Text>
          </Pressable>
        </View>
      ) : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECF3"
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 3,
    borderBottomColor: "transparent"
  },
  activeTabButton: {
    borderBottomColor: colors.auraBlue
  },
  tabLabel: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "700"
  },
  activeTabLabel: {
    color: colors.auraBlue
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  list: {
    gap: 10,
    marginTop: spacing.md
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl
  },
  pageArrow: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  disabledPageButton: {
    opacity: 0.4
  },
  pageArrowText: {
    color: colors.textSubtle,
    fontSize: 18,
    fontWeight: "700"
  },
  pageNumbers: {
    flexDirection: "row",
    gap: spacing.lg
  },
  pageNumber: {
    color: colors.chipText,
    fontSize: 14,
    fontWeight: "700"
  },
  activePageNumber: {
    color: colors.auraBlue
  }
});
