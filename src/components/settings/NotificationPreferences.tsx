import { Chip } from "@/src/components/common/Chip";
import { ChipCollapse } from "@/src/components/common/ChipCollapse";
import { LoadingState } from "@/src/components/common/LoadingState";
import { ToggleSwitch } from "@/src/components/common/ToggleSwitch";
import { departmentNameMap } from "@/src/constants/departments";
import {
  getTypeMode,
  listKeywordSubscriptions,
  saveKeywordSubscriptions,
  setTypeMode
} from "@/src/features/settings/api";
import { syncNotificationSubscriptions } from "@/src/lib/notifications/service";
import { notify } from "@/src/lib/toast";
import { colors, radii, spacing } from "@/src/theme/tokens";
import type { Keyword, SubscriptionMode } from "@/src/types/settings";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const categoryLabelMap: Record<string, string> = {
  general: "일반 공지사항",
  scholarship: "장학 공지사항",
  dormitory: "생활관 공지사항"
};

export type NotificationPreferencesHandle = {
  save: () => Promise<void>;
};

type NotificationPreferencesProps = {
  allKeywords: Keyword[];
  loading: boolean;
  category: string;
  isDepartment?: boolean;
  departments?: string[];
};

export const NotificationPreferences = forwardRef<
  NotificationPreferencesHandle,
  NotificationPreferencesProps
>(function NotificationPreferences(
  {
    allKeywords,
    loading,
    category,
    isDepartment = false,
    departments = []
  },
  ref
) {
  const [initialIds, setInitialIds] = useState<number[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [enabled, setEnabled] = useState(false);
  const [keywordMode, setKeywordMode] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [modeLoading, setModeLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const effectiveCategory = useMemo(() => {
    if (isDepartment) {
      return selectedDept;
    }

    return category;
  }, [category, isDepartment, selectedDept]);

  useEffect(() => {
    if (!isDepartment) {
      return;
    }

    if (departments.length === 0) {
      setSelectedDept("");
      return;
    }

    setSelectedDept((current) =>
      current && departments.includes(current) ? current : departments[0]
    );
  }, [departments, isDepartment]);

  useEffect(() => {
    if (!effectiveCategory) {
      setModeLoading(false);
      return;
    }

    let cancelled = false;
    setModeLoading(true);

    (async () => {
      try {
        const [mode, subscribedIds] = await Promise.all([
          getTypeMode(effectiveCategory),
          listKeywordSubscriptions(effectiveCategory)
        ]);

        if (cancelled) {
          return;
        }

        setEnabled(mode === "ALL" || mode === "KEYWORD");
        setKeywordMode(mode === "KEYWORD");
        setInitialIds(subscribedIds);
        setSelectedIds(new Set(subscribedIds));
      } catch {
        if (cancelled) {
          return;
        }

        setEnabled(false);
        setKeywordMode(false);
        setInitialIds([]);
        setSelectedIds(new Set());
      } finally {
        if (!cancelled) {
          setModeLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [effectiveCategory]);

  useEffect(() => {
    const validKeywordIds = new Set(allKeywords.map((keyword) => keyword.id));
    setSelectedIds((current) => {
      const next = new Set<number>();
      current.forEach((keywordId) => {
        if (validKeywordIds.has(keywordId)) {
          next.add(keywordId);
        }
      });
      return next;
    });
  }, [allKeywords]);

  const targetLabel = useMemo(() => {
    if (isDepartment || category.startsWith("department.")) {
      const departmentCode = effectiveCategory || category;
      return departmentNameMap[departmentCode] ?? "학과 공지사항";
    }

    return categoryLabelMap[category] ?? category;
  }, [category, effectiveCategory, isDepartment]);

  const summaryText = useMemo(() => {
    if (!enabled) {
      return `${targetLabel}의 알림을 받지 않습니다.`;
    }

    if (keywordMode) {
      return `${targetLabel}의 선택한 키워드가 포함된 알림만 받습니다.`;
    }

    return `${targetLabel}의 모든 알림을 받습니다.`;
  }, [enabled, keywordMode, targetLabel]);

  const nextIds = useMemo(() => Array.from(selectedIds), [selectedIds]);
  const changed = useMemo(() => {
    const left = JSON.stringify([...initialIds].sort((a, b) => a - b));
    const right = JSON.stringify([...nextIds].sort((a, b) => a - b));
    return left !== right;
  }, [initialIds, nextIds]);

  async function persistMode(nextEnabled: boolean, nextKeywordMode: boolean) {
    if (!effectiveCategory) {
      return;
    }

    const nextMode: Exclude<SubscriptionMode, null> = !nextEnabled
      ? "NONE"
      : nextKeywordMode
        ? "KEYWORD"
        : "ALL";

    await setTypeMode(effectiveCategory, nextMode);
    await syncNotificationSubscriptions();
  }

  async function handleToggleEnabled(nextValue: boolean) {
    const previous = enabled;
    setEnabled(nextValue);

    try {
      await persistMode(nextValue, keywordMode);
    } catch {
      setEnabled(previous);
      notify.error("알림 설정 변경에 실패했습니다.");
    }
  }

  async function handleToggleKeywordMode(nextValue: boolean) {
    const previous = keywordMode;
    setKeywordMode(nextValue);

    try {
      await persistMode(enabled, nextValue);
    } catch {
      setKeywordMode(previous);
      notify.error("알림 설정 변경에 실패했습니다.");
    }
  }

  function toggleKeyword(keywordId: number) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(keywordId)) {
        next.delete(keywordId);
      } else {
        next.add(keywordId);
      }
      return next;
    });
  }

  async function save() {
    if (!effectiveCategory) {
      return;
    }

    setSaving(true);
    try {
      await saveKeywordSubscriptions(initialIds, nextIds, effectiveCategory);
      setInitialIds(nextIds);
      await syncNotificationSubscriptions();
      notify.success("키워드 구독 설정이 저장되었습니다.");
    } catch {
      notify.error("구독 설정 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  useImperativeHandle(ref, () => ({
    save
  }));

  const busy = loading || modeLoading || saving;

  return (
    <View style={styles.container}>
      {busy ? <LoadingState overlay /> : null}

      {isDepartment ? (
        <ChipCollapse defaultOpen>
          <View style={styles.chips}>
            {departments.map((departmentCode) => (
              <Chip
                key={departmentCode}
                label={departmentNameMap[departmentCode] ?? departmentCode}
                active={selectedDept === departmentCode}
                onPress={() => setSelectedDept(departmentCode)}
              />
            ))}
          </View>
        </ChipCollapse>
      ) : null}

      <View style={styles.switchRow}>
        <ToggleSwitch label="알림" checked={enabled} onChange={handleToggleEnabled} />
        <ToggleSwitch
          leftLabel="전체"
          rightLabel="키워드"
          checked={keywordMode}
          onChange={handleToggleKeywordMode}
          disabled={!enabled}
        />
      </View>

      <Text style={styles.summary}>{summaryText}</Text>

      {enabled && keywordMode ? (
        <View style={styles.keywordSection}>
          <View style={styles.keywordHeader}>
            <Text style={styles.keywordTitle}>키워드 구독</Text>
            <Text style={styles.keywordDescription}>
              등록된 키워드 중에서 알림을 받길 원하는 것만 선택하세요.
            </Text>
          </View>

          <View style={styles.bulkRow}>
            <Pressable
              style={styles.bulkButton}
              onPress={() => setSelectedIds(new Set(allKeywords.map((keyword) => keyword.id)))}
              disabled={allKeywords.length === 0 || busy}
            >
              <Text style={styles.bulkButtonText}>전체 선택</Text>
            </Pressable>
            <Pressable
              style={styles.bulkButton}
              onPress={() => setSelectedIds(new Set())}
              disabled={selectedIds.size === 0 || busy}
            >
              <Text style={styles.bulkButtonText}>전체 해제</Text>
            </Pressable>
            <Text style={styles.selectionText}>
              선택 {selectedIds.size} / 전체 {allKeywords.length}
            </Text>
          </View>

          <View style={styles.chips}>
            {allKeywords.map((keyword) => {
              const active = selectedIds.has(keyword.id);
              return (
                <Pressable
                  key={keyword.id}
                  style={[styles.toggleChip, active && styles.activeToggleChip]}
                  onPress={() => toggleKeyword(keyword.id)}
                  disabled={busy}
                >
                  <View
                    style={[
                      styles.toggleIndicator,
                      active && styles.activeToggleIndicator
                    ]}
                  />
                  <Text style={[styles.toggleChipText, active && styles.activeToggleChipText]}>
                    {keyword.phrase}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {allKeywords.length === 0 && !loading ? (
            <Text style={styles.emptyText}>등록된 키워드가 없습니다.</Text>
          ) : null}

          {ref ? null : (
            <View style={styles.saveRow}>
              <Pressable
                style={[styles.bulkButton, (!changed || busy) && styles.disabledButton]}
                disabled={!changed || busy}
                onPress={save}
              >
                <Text style={styles.bulkButtonText}>
                  {saving ? "저장 중…" : "변경사항 저장"}
                </Text>
              </Pressable>
              {!changed ? <Text style={styles.saveHint}>변경된 내용이 없습니다.</Text> : null}
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    gap: spacing.md,
    position: "relative"
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  summary: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18
  },
  keywordSection: {
    gap: spacing.md
  },
  keywordHeader: {
    gap: 6
  },
  keywordTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  keywordDescription: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18
  },
  bulkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm
  },
  bulkButton: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6
  },
  disabledButton: {
    opacity: 0.45
  },
  bulkButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700"
  },
  selectionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  toggleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.pill,
    backgroundColor: "#F0F3F7",
    paddingHorizontal: spacing.md,
    paddingVertical: 6
  },
  activeToggleChip: {
    backgroundColor: "#EEF5FF",
    borderWidth: 2,
    borderColor: colors.auraBlue
  },
  toggleIndicator: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: "#CCCCCC"
  },
  activeToggleIndicator: {
    backgroundColor: colors.auraBlue
  },
  toggleChipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600"
  },
  activeToggleChipText: {
    color: colors.auraBlue
  },
  saveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.sm
  },
  saveHint: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500"
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500"
  }
});
