import type { PropsWithChildren } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';

import { ActionButton, Brand, Page } from '@/components/lumora-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useLumoraColors, useThemedStyles } from '@/contexts/appearance-context';

export function OnboardingStep({
  step,
  total,
  title,
  description,
  onBack,
  children,
}: PropsWithChildren<{
  step: number;
  total: number;
  title: string;
  description: string;
  onBack: () => void;
}>) {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  const progress = `${Math.max(0, Math.min(100, (step / total) * 100))}%` as `${number}%`;
  return (
    <Page>
      <View style={styles.top}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
          <Text style={styles.backText}>‹  Back</Text>
        </Pressable>
        <Brand compact />
      </View>
      <Text style={styles.stepCount}>STEP {step} OF {total}</Text>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: total, now: step }}
        style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: progress, backgroundColor: colors.primary },
          ]}
        />
      </View>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {children}
    </Page>
  );
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'sentences',
  autoComplete,
  textContentType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'name' | 'email' | 'password' | 'new-password' | 'given-name' | 'off';
  textContentType?: 'name' | 'emailAddress' | 'password' | 'newPassword' | 'givenName' | 'none';
}) {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? <InlineError>{error}</InlineError> : null}
    </View>
  );
}

export function CheckOption({
  checked,
  onPress,
  children,
  error,
}: PropsWithChildren<{
  checked: boolean;
  onPress: () => void;
  error?: string;
}>) {
  const styles = useThemedStyles(baseStyles);
  return (
    <View style={styles.checkWrap}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={onPress}
        style={({ pressed }) => [styles.checkRow, pressed && styles.pressed]}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={styles.checkLabel}>{children}</Text>
      </Pressable>
      {error ? <InlineError>{error}</InlineError> : null}
    </View>
  );
}

export function ChoiceCard({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(baseStyles);
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceCard,
        selected && styles.choiceSelected,
        pressed && styles.pressed,
      ]}>
      <View style={styles.choiceCopy}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceDescription}>{description}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

export function InlineError({ children }: PropsWithChildren) {
  const styles = useThemedStyles(baseStyles);
  return <Text style={styles.error}>{children}</Text>;
}

export function StepContinue({
  children = 'Continue',
  onPress,
  disabled,
}: {
  children?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <ActionButton onPress={onPress} disabled={disabled}>
      {children}
    </ActionButton>
  );
}

const baseStyles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  backButton: {
    minHeight: 44,
    minWidth: 72,
    justifyContent: 'center',
  },
  backText: {
    color: LumoraColors.primary,
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  stepCount: {
    color: LumoraColors.primary,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  progressTrack: {
    height: 4,
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: '#E9DFE8',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  heading: {
    gap: 8,
  },
  title: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.serif,
    fontSize: 34,
    fontWeight: '600',
    lineHeight: 42,
  },
  description: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 23,
  },
  field: {
    gap: 8,
  },
  label: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LumoraColors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: LumoraColors.primaryText,
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
  inputError: {
    borderColor: LumoraColors.error,
  },
  error: {
    color: LumoraColors.error,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  checkWrap: {
    gap: 4,
  },
  checkRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    height: 22,
    width: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LumoraColors.secondaryText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: LumoraColors.primary,
    borderColor: LumoraColors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  checkLabel: {
    flex: 1,
    color: LumoraColors.primaryText,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  choiceCard: {
    minHeight: 72,
    padding: 16,
    borderWidth: 1,
    borderColor: LumoraColors.border,
    borderRadius: 12,
    backgroundColor: LumoraColors.warmSurface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  choiceSelected: {
    borderColor: LumoraColors.primary,
    backgroundColor: '#F0E7F0',
  },
  choiceCopy: {
    flex: 1,
    gap: 4,
  },
  choiceTitle: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  choiceDescription: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  radio: {
    height: 22,
    width: 22,
    borderWidth: 1,
    borderColor: LumoraColors.secondaryText,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: LumoraColors.primary,
  },
  radioDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: LumoraColors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
});
