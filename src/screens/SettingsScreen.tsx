import { env } from "@/src/config/env";
import { ScreenShell } from "@/src/components/common/ScreenShell";
import { CollapsibleCard } from "@/src/components/common/CollapsibleCard";
import { CollapsibleTabs } from "@/src/components/common/CollapsibleTabs";
import { LoadingState } from "@/src/components/common/LoadingState";
import { AppBar } from "@/src/components/navigation/AppBar";
import { AccountInfoCard } from "@/src/components/settings/AccountInfoCard";
import { DepartmentSelector } from "@/src/components/settings/DepartmentSelector";
import { KeywordController } from "@/src/components/settings/KeywordController";
import { NotificationPreferences } from "@/src/components/settings/NotificationPreferences";
import { departmentNameMap } from "@/src/constants/departments";
import {
  addDepartment,
  addKeyword,
  listDepartments,
  listKeywords,
  removeDepartment,
  removeKeyword
} from "@/src/features/settings/api";
import { logout, refreshProfile } from "@/src/lib/auth/service";
import { useAuth } from "@/src/lib/auth/useAuth";
import { notify } from "@/src/lib/toast";
import { initNotifications, requestPermission, registerForPushToken } from "@/src/lib/notifications/service";
import { colors, spacing } from "@/src/theme/tokens";
import type { Keyword } from "@/src/types/settings";
import { openExternalUrl } from "@/src/utils/browser";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export function SettingsScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const departmentsLabel = useMemo(() => {
    if (departments.length === 0) {
      return "등록된 학과가 없습니다.";
    }

    return departments.map((code) => departmentNameMap[code] ?? code).join(", ");
  }, [departments]);

  const refreshData = useCallback(async () => {
    setLoading(true);

    try {
      const [nextDepartments, nextKeywords] = await Promise.all([
        listDepartments(),
        listKeywords(),
        refreshProfile().catch(() => null)
      ]);
      setDepartments(nextDepartments);
      setKeywords(nextKeywords);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshData();
      
      // FCM 토큰 발급 (푸시 알림 테스트용)
      void (async () => {
        try {
          const permission = await requestPermission();
          if (permission === "granted") {
            const token = await registerForPushToken();
            if (token) {
              console.log("⭐ FCM TOKEN:", token);
            }
          }
        } catch (e) {
          console.error("FCM token error:", e);
        }
      })();
    }, [refreshData])
  );

  async function handleAddDepartment(code: string) {
    try {
      await addDepartment(code);
      notify.success("학과 등록에 성공했습니다.");
      await refreshData();
    } catch (error: any) {
      notify.error(error?.message ?? "학과 등록에 실패했습니다.");
    }
  }

  async function handleRemoveDepartment(code: string) {
    try {
      await removeDepartment(code);
      notify.warn("학과를 제거했습니다.");
      await refreshData();
    } catch (error: any) {
      notify.error(error?.message ?? "학과 제거에 실패했습니다.");
    }
  }

  async function handleAddKeyword(phrase: string) {
    try {
      await addKeyword(phrase);
      notify.success("키워드를 등록했습니다.");
      await refreshData();
    } catch (error: any) {
      notify.error(error?.message ?? "키워드 등록에 실패했습니다.");
    }
  }

  async function handleRemoveKeyword(id: number) {
    try {
      await removeKeyword(id);
      notify.warn("키워드를 제거했습니다.");
      await refreshData();
    } catch (error: any) {
      notify.error(error?.message ?? "키워드 제거에 실패했습니다.");
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <ScreenShell header={<AppBar />}>
      <AccountInfoCard profile={auth.profile} departmentsLabel={departmentsLabel} />

      <CollapsibleCard title="학과 설정">
        <DepartmentSelector
          departments={departments}
          loading={loading}
          onAddDepartment={handleAddDepartment}
          onRemoveDepartment={handleRemoveDepartment}
        />
      </CollapsibleCard>

      <CollapsibleCard title="키워드 설정">
        <KeywordController
          keywords={keywords}
          loading={loading}
          onAddKeyword={handleAddKeyword}
          onRemoveKeyword={handleRemoveKeyword}
        />
      </CollapsibleCard>

      <CollapsibleTabs
        title="알림 설정"
        openIndex={openIndex}
        onTabClick={setOpenIndex}
        items={[
          {
            label: "일반",
            content: (
              <NotificationPreferences
                allKeywords={keywords}
                loading={loading}
                category="general"
              />
            )
          },
          {
            label: "장학",
            content: (
              <NotificationPreferences
                allKeywords={keywords}
                loading={loading}
                category="scholarship"
              />
            )
          },
          {
            label: "생활관",
            content: (
              <NotificationPreferences
                allKeywords={keywords}
                loading={loading}
                category="dormitory"
              />
            )
          },
          {
            label: "학과",
            content: (
              <NotificationPreferences
                allKeywords={keywords}
                loading={loading}
                category="department"
                isDepartment
                departments={departments}
              />
            )
          }
        ]}
      />

      {env.aboutPageUrl ? (
        <Pressable style={styles.ghostButton} onPress={() => openExternalUrl(env.aboutPageUrl)}>
          <Text style={styles.ghostButtonText}>앱 소개</Text>
        </Pressable>
      ) : null}

      <Pressable style={styles.ghostButton} onPress={handleLogout}>
        <Text style={styles.ghostButtonText}>로그아웃</Text>
      </Pressable>

      {loading ? <LoadingState overlay /> : null}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  ghostButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginBottom: spacing.md
  },
  ghostButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  }
});
