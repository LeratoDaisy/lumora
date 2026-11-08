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
    text: '#F4EEF5',
    background: '#1C1920',
    backgroundElement: '#29242E',
    backgroundSelected: '#3A3040',
    textSecondary: '#C0B5C4',
  },
} as const;

export const LightLumoraColors = {
  primary: '#8A6A96',
  secondary: '#D8B7C9',
  softSurface: '#F8F3F7',
  warmSurface: '#FFF8F0',
  primaryText: '#2E2830',
  secondaryText: '#6E6670',
  success: '#4F7A62',
  error: '#B64B58',
  border: '#E9DFE8',
  selectedSurface: '#F0E7F0',
  inputSurface: '#FFFFFF',
  onPrimary: '#FFFFFF',
  tabSurface: '#FFFFFF',
} as const;

export const DarkLumoraColors = {
  primary: '#C4A5D0',
  secondary: '#806B87',
  softSurface: '#1C1920',
  warmSurface: '#29242E',
  primaryText: '#F4EEF5',
  secondaryText: '#C0B5C4',
  success: '#9CC6A8',
  error: '#F0939B',
  border: '#48404C',
  selectedSurface: '#3A3040',
  inputSurface: '#221E26',
  onPrimary: '#211B25',
  tabSurface: '#241F28',
} as const;

export type LumoraPalette = {
  [Key in keyof typeof LightLumoraColors]: string;
};
export const LumoraColors = LightLumoraColors;

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
