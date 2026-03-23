import { DepartmentSelector } from "@/src/components/settings/DepartmentSelector";
import {
  NotificationPreferences,
  type NotificationPreferencesHandle
} from "@/src/components/settings/NotificationPreferences";
import {
  addDepartment,
  listDepartments,
  listKeywords,
  removeDepartment
} from "@/src/features/settings/api";
import { completeOnboarding } from "@/src/lib/auth/service";
import { useAuth } from "@/src/lib/auth/useAuth";
import { notify } from "@/src/lib/toast";
import { colors, radii, spacing } from "@/src/theme/tokens";
import type { Keyword } from "@/src/types/settings";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

export function SelectDepartmentScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const generalRef = useRef<NotificationPreferencesHandle>(null);
  const scholarshipRef = useRef<NotificationPreferencesHandle>(null);
  const dormitoryRef = useRef<NotificationPreferencesHandle>(null);
  const departmentRef = useRef<NotificationPreferencesHandle>(null);

  useEffect(() => {
    if (!auth.hydrated) {
      return;
    }

    if (!auth.session) {
      router.replace("/login");
      return;
    }

    if (!auth.needsOnboarding) {
      router.replace("/notice");
    }
  }, [auth.hydrated, auth.needsOnboarding, auth.session, router]);

  useEffect(() => {
    if (!auth.session || !auth.needsOnboarding) {
      return;
    }

    void refreshData();
  }, [auth.needsOnboarding, auth.session]);

  async function refreshData() {
    setLoading(true);
    try {
      const [nextDepartments, nextKeywords] = await Promise.all([
        listDepartments(),
        listKeywords()
      ]);
      setDepartments(nextDepartments);
      setKeywords(nextKeywords);
    } finally {
      setLoading(false);
    }
  }

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

  async function handleComplete() {
    try {
      await Promise.all([
        generalRef.current?.save?.(),
        scholarshipRef.current?.save?.(),
        dormitoryRef.current?.save?.(),
        departments.length > 0 ? departmentRef.current?.save?.() : Promise.resolve()
      ]);
      await completeOnboarding();
      router.replace("/notice");
    } catch {
      notify.error("온보딩 저장에 실패했습니다.");
    }
  }

  const hasDepartments = departments.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>앱의 기본값을 설정해주세요</Text>
            <Text style={styles.subtitle}>
              기본 설정은 이후에 설정창에서 변경할 수 있습니다.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>학과 설정</Text>
            <DepartmentSelector
              departments={departments}
              loading={loading}
              onAddDepartment={handleAddDepartment}
              onRemoveDepartment={handleRemoveDepartment}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 알림 설정</Text>
            <View style={styles.preferenceBlock}>
              <Text style={styles.preferenceTitle}>일반 공지 알림</Text>
              <NotificationPreferences
                ref={generalRef}
                allKeywords={keywords}
                loading={loading}
                category="general"
              />
            </View>
            <View style={styles.preferenceBlock}>
              <Text style={styles.preferenceTitle}>장학 공지 알림</Text>
              <NotificationPreferences
                ref={scholarshipRef}
                allKeywords={keywords}
                loading={loading}
                category="scholarship"
              />
            </View>
            <View style={styles.preferenceBlock}>
              <Text style={styles.preferenceTitle}>생활관 공지 알림</Text>
              <NotificationPreferences
                ref={dormitoryRef}
                allKeywords={keywords}
                loading={loading}
                category="dormitory"
              />
            </View>
            <View style={styles.preferenceBlock}>
              <Text style={styles.preferenceTitle}>학과 공지 알림</Text>
              {!hasDepartments ? (
                <Text style={styles.disabledText}>학과를 먼저 등록해주세요.</Text>
              ) : (
                <NotificationPreferences
                  ref={departmentRef}
                  allKeywords={keywords}
                  loading={loading}
                  category={departments[0]}
                />
              )}
            </View>
          </View>

          <Pressable style={styles.button} onPress={handleComplete}>
            <Text style={styles.buttonText}>설정 완료</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5"
  },
  content: {
    padding: spacing.xl
  },
  inner: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center"
  },
  header: {
    marginBottom: spacing.xxxl,
    paddingHorizontal: 10
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.xl,
    marginBottom: spacing.xl
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  preferenceBlock: {
    borderTopWidth: 1,
    borderTopColor: "#F0F2F5",
    paddingTop: spacing.xl,
    marginTop: spacing.xl
  },
  preferenceTitle: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md
  },
  disabledText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500"
  },
  button: {
    borderRadius: radii.sm,
    backgroundColor: colors.auraBlue,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: spacing.sm,
    marginBottom: 50
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700"
  }
});
