export const colors = {
  accent: "#D9480F",
  accentPressed: "#B93C0C",
  accentSoft: "#FFEDD5",
  background: "#FFFDF9",
  surface: "#FFFFFF",
  surfaceMuted: "#F5F1EA",
  border: "#E7DFD4",
  text: "#1F1B16",
  textMuted: "#6B6259",
  danger: "#B42318",
  success: "#217A4B",
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const sizes = {
  avatarSm: 32,
  avatarMd: 44,
  avatarLg: 72,
  controlHeight: 48,
  cardMaxWidth: 420,
  contentMaxWidth: 960,
  sidebarWidth: 248,
} as const;

export const borders = {
  none: 0,
  thin: 1,
  focus: 2,
  focusOffset: 2,
} as const;

export const breakpoints = {
  wide: 768,
} as const;

export const opacity = {
  disabled: 0.6,
  pressed: 0.85,
} as const;

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  heading: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  sizes,
  borders,
  breakpoints,
  opacity,
  typography,
} as const;
