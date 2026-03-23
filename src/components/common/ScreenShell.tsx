import { colors, layout } from "@/src/theme/tokens";
import { PropsWithChildren, ReactNode } from "react";
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenShellProps = PropsWithChildren<{
  header?: ReactNode;
  scrollProps?: ScrollViewProps;
}>;

export function ScreenShell({ header, children, scrollProps }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {header}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        {...scrollProps}
      >
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    flex: 1
  },
  content: {
    paddingBottom: layout.tabBarHeight + 20
  },
  inner: {
    width: "100%",
    maxWidth: layout.maxWidth,
    alignSelf: "center",
    paddingHorizontal: 10
  }
});
