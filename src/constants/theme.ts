export const COLORS = {
  // 基础
  background: '#FFF8F0',
  surface: '#FFFFFF',
  text: '#2D2D2D',
  textSecondary: '#8E8E93',
  border: '#E5E5EA',

  // 情感色
  moodAngry: '#FF6B6B',
  moodHappy: '#4ECDC4',
  moodNeutral: '#C7C7CC',

  // 功能色
  primary: '#FF8C42',
  primaryLight: '#FFF0E0',
  danger: '#FF3B30',
  warning: '#FF9500',
  warningBg: '#FFF0E0',

  // 日历
  calendarToday: '#FF8C42',
  calendarDot: '#D1D1D6',
};

export const FONTS = {
  title: 28,
  subtitle: 20,
  body: 16,
  caption: 14,
  small: 12,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const MOOD_COLORS: Record<string, string> = {
  angry: COLORS.moodAngry,
  happy: COLORS.moodHappy,
  neutral: COLORS.moodNeutral,
};
