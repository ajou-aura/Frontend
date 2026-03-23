import { Chip } from "@/src/components/common/Chip";
import { SelectionModal } from "@/src/components/common/SelectionModal";
import { collegeOptions, departmentGroups, departmentNameMap } from "@/src/constants/departments";
import { colors, radii, spacing } from "@/src/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DepartmentSelectorProps = {
  departments: string[];
  loading: boolean;
  onAddDepartment: (code: string) => Promise<void>;
  onRemoveDepartment: (code: string) => Promise<void>;
};

export function DepartmentSelector({
  departments,
  loading,
  onAddDepartment,
  onRemoveDepartment
}: DepartmentSelectorProps) {
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [modalType, setModalType] = useState<"college" | "department" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const options = useMemo(
    () =>
      (departmentGroups[selectedCollege] ?? []).map((departmentCode) => ({
        value: departmentCode,
        label: departmentNameMap[departmentCode] ?? departmentCode
      })),
    [selectedCollege]
  );

  const busy = loading || submitting;

  async function handleAdd() {
    if (!selectedDepartment) {
      return;
    }

    setSubmitting(true);
    try {
      await onAddDepartment(selectedDepartment);
      setSelectedCollege("");
      setSelectedDepartment("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(code: string) {
    setSubmitting(true);
    try {
      await onRemoveDepartment(code);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Pressable
          style={styles.field}
          disabled={busy}
          onPress={() => setModalType("college")}
        >
          <Text style={[styles.fieldText, !selectedCollege && styles.placeholder]}>
            {selectedCollege || "단과대 선택"}
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        </Pressable>

        <View style={styles.row}>
          <Pressable
            style={[styles.field, styles.flexField]}
            disabled={busy || !selectedCollege}
            onPress={() => setModalType("department")}
          >
            <Text style={[styles.fieldText, !selectedDepartment && styles.placeholder]}>
              {selectedDepartment
                ? departmentNameMap[selectedDepartment] ?? selectedDepartment
                : "학과 선택"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
          </Pressable>
          <Pressable
            style={[styles.addButton, (!selectedDepartment || busy) && styles.disabledButton]}
            disabled={!selectedDepartment || busy}
            onPress={handleAdd}
          >
            <Text style={styles.addButtonText}>추가</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>내 학과</Text>
        {departments.length === 0 ? (
          <Text style={styles.emptyText}>등록된 학과가 없습니다.</Text>
        ) : (
          <View style={styles.chips}>
            {departments.map((departmentCode) => (
              <View key={departmentCode} style={styles.selectedChip}>
                <Text style={styles.selectedChipText}>
                  {departmentNameMap[departmentCode] ?? departmentCode}
                </Text>
                <Pressable onPress={() => handleRemove(departmentCode)} disabled={busy}>
                  <Ionicons name="close-circle" size={18} color={colors.auraBlue} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </View>

      <SelectionModal
        visible={modalType === "college"}
        title="단과대 선택"
        options={collegeOptions.map((college) => ({ value: college, label: college }))}
        onClose={() => setModalType(null)}
        onSelect={(college) => {
          setSelectedCollege(college);
          setSelectedDepartment("");
        }}
      />
      <SelectionModal
        visible={modalType === "department"}
        title="학과 선택"
        options={options}
        onClose={() => setModalType(null)}
        onSelect={setSelectedDepartment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    gap: spacing.lg
  },
  inputGroup: {
    gap: spacing.sm
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  field: {
    minHeight: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F1F1F1",
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  flexField: {
    flex: 1
  },
  fieldText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "500"
  },
  placeholder: {
    color: colors.textMuted
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
  listSection: {
    gap: spacing.sm
  },
  listTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  selectedChip: {
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
  selectedChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  }
});
