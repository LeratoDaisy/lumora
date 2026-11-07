/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2E2830',
    background: '#F8F3F7',
    backgroundElement: '#FFF8F0',
    backgroundSelected: '#EBDDEB',
    textSecondary: '#6E6670',
  },
  dark: {
    text: '#2E2830',
    background: '#F8F3F7',
    backgroundElement: '#FFF8F0',
    backgroundSelected: '#EBDDEB',
    textSecondary: '#6E6670',
  },
} as const;

export const LumoraColors = {
  primary: '#8A6A96',
  secondary: '#D8B7C9',
  softSurface: '#F8F3F7',
  warmSurface: '#FFF8F0',
  primaryText: '#2E2830',
  secondaryText: '#6E6670',
  success: '#4F7A62',
  error: '#B64B58',
  border: '#E9DFE8',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
