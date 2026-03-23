export const colors = {
  auraBlue: "#4A6DDB",
  auraSky: "#7CC2F4",
  background: "#F7F8FA",
  surface: "#FFFFFF",
  surfaceMuted: "#F0F3F7",
  surfaceSoft: "#EEF5FF",
  border: "#E6E8ED",
  borderStrong: "#D0D5DD",
  text: "#1A1B1F",
  textStrong: "#111827",
  textMuted: "#81838A",
  textSubtle: "#8D96A8",
  chip: "#EEF1F6",
  chipText: "#667085",
  success: "#16A34A",
  danger: "#EF4C43",
  warning: "#F59E0B",
  overlay: "rgba(255,255,255,0.72)"
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 14,
  pill: 999
} as const;

export const layout = {
  maxWidth: 420,
  tabBarHeight: 64,
  cardMinHeight: 76
} as const;

export const shadow = {
  card: {
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  }
} as const;
