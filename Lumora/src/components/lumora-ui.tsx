import type { PropsWithChildren, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, LumoraColors } from '@/constants/theme';

export function Page({ children }: PropsWithChildren) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.page}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.brand}>
      <View style={[styles.brandMark, compact && styles.brandMarkCompact]}>
        <Text style={[styles.brandLetter, compact && styles.brandLetterCompact]}>L</Text>
      </View>
      <Text style={[styles.brandName, compact && styles.brandNameCompact]}>Lumora</Text>
    </View>
  );
}

export function Heading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <View style={styles.heading}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.pageTitle}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ActionButton({
  children,
  secondary = false,
  onPress,
  disabled,
  style,
}: PropsWithChildren<{
  secondary?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}>) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.secondaryButton : styles.primaryButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>
        {children}
      </Text>
    </Pressable>
  );
}

export function SectionLabel({ children }: PropsWithChildren) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyMark}>
        <Text style={styles.emptyMarkText}>✦</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LumoraColors.softSurface,
  },
  page: {
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 620,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LumoraColors.primary,
  },
  brandMarkCompact: {
    height: 32,
    width: 32,
  },
  brandLetter: {
    color: '#FFFFFF',
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 28,
  },
  brandLetterCompact: {
    fontSize: 19,
    lineHeight: 22,
  },
  brandName: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.serif,
    fontSize: 26,
    fontWeight: '600',
  },
  brandNameCompact: {
    fontSize: 22,
  },
  heading: {
    gap: 8,
  },
  eyebrow: {
    color: LumoraColors.primary,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pageTitle: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.serif,
    fontSize: 36,
    fontWeight: '600',
    lineHeight: 42,
  },
  description: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    padding: 20,
    gap: 12,
    borderRadius: 12,
    backgroundColor: LumoraColors.warmSurface,
    borderWidth: 1,
    borderColor: LumoraColors.border,
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: LumoraColors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: LumoraColors.primary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: LumoraColors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.55,
  },
  sectionLabel: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 28,
    gap: 12,
  },
  emptyMark: {
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0E7F0',
  },
  emptyMarkText: {
    color: LumoraColors.primary,
    fontSize: 22,
  },
  emptyTitle: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDescription: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 300,
  },
});
