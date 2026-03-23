import { colors, radii, spacing } from "@/src/theme/tokens";
import type { Keyword } from "@/src/types/settings";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type KeywordControllerProps = {
  keywords: Keyword[];
  loading: boolean;
  onAddKeyword: (phrase: string) => Promise<void>;
  onRemoveKeyword: (id: number) => Promise<void>;
};

export function KeywordController({
  keywords,
  loading,
  onAddKeyword,
  onRemoveKeyword
}: KeywordControllerProps) {
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const busy = loading || submitting;

  async function handleAdd() {
    const phrase = input.trim();
    if (!phrase) {
      return;
    }

    setSubmitting(true);
    try {
      await onAddKeyword(phrase);
      setInput("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: number) {
    setSubmitting(true);
    try {
      await onRemoveKeyword(id);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="키워드를 입력하세요"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          editable={!busy}
          onSubmitEditing={handleAdd}
        />
        <Pressable
          style={[styles.addButton, (!input.trim() || busy) && styles.disabledButton]}
          onPress={handleAdd}
          disabled={!input.trim() || busy}
        >
          <Text style={styles.addButtonText}>추가</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>내 키워드</Text>
      <View style={styles.chips}>
        {keywords.map((keyword) => (
          <View key={keyword.id} style={styles.keywordChip}>
            <Text style={styles.keywordText}>{keyword.phrase}</Text>
            <Pressable onPress={() => handleRemove(keyword.id)} disabled={busy}>
              <Ionicons name="close-circle" size={18} color={colors.auraBlue} />
            </Pressable>
          </View>
        ))}
      </View>
      {keywords.length === 0 && !loading ? (
        <Text style={styles.emptyText}>등록된 키워드가 없습니다.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    gap: spacing.md
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center"
  },
  input: {
    flex: 1,
    minHeight: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F1F1F1",
    paddingHorizontal: spacing.md,
    color: colors.text
  },
  addButton: {
    minHeight: 42,
    borderRadius: radii.sm,
    backgroundColor: "#4773D2",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg
  },
  disabledButton: {
    opacity: 0.45
  },
  addButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "700"
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  keywordChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.auraBlue,
    backgroundColor: "#F3F7FF",
    paddingLeft: spacing.md,
    paddingRight: 6,
    paddingVertical: 6
  },
  keywordText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500"
  }
});
