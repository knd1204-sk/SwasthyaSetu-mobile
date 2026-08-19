export const colors = {
  primary: '#0F6E5C',
  primaryLight: '#E7F3EF',
  text: '#1C2B2A',
  background: '#F7F6F3',
  accent: '#C9754A',
  signalBlue: '#3B7A9E',
  honeyGold: '#E3A857',
  white: '#FFFFFF',
  border: '#D4D9D7',
  textMuted: '#6B7A78',
  error: '#C9754A',
  success: '#0F6E5C',
  skeleton: '#E7F3EF',
  card: '#FFFFFF',
  shadow: 'rgba(15, 110, 92, 0.08)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
} as const;

export const typography = {
  heading: {
    fontFamily: 'System',
    fontWeight: '700' as const,
  },
  body: {
    fontFamily: 'System',
    fontWeight: '400' as const,
  },
  mono: {
    fontFamily: 'System',
    fontWeight: '500' as const,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  typography,
  shadows,
};

export type Theme = typeof theme;
