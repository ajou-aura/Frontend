import { LoadingState } from "@/src/components/common/LoadingState";
import { useAuth } from "@/src/lib/auth/useAuth";
import { colors, layout } from "@/src/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";

export default function TabsLayout() {
  const auth = useAuth();

  if (!auth.hydrated || auth.bootstrapping) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState message="화면 준비 중" />
      </SafeAreaView>
    );
  }

  if (!auth.session) {
    return <Redirect href="/login" />;
  }

  if (auth.needsOnboarding) {
    return <Redirect href="/select-department" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.auraBlue,
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          height: layout.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopColor: "#EEEEEE"
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700"
        }
      }}
    >
      <Tabs.Screen
        name="notice"
        options={{
          title: "홈",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="bookmark"
        options={{
          title: "북마크",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "star" : "star-outline"}
              size={24}
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "설정",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={24} color={color} />
          )
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  }
});
