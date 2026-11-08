import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Heading, Page, SectionLabel } from '@/components/lumora-ui';
import { Fonts } from '@/constants/theme';
import {
  useAppearance,
  useLumoraColors,
  useThemedStyles,
  type AppearancePreference,
} from '@/contexts/appearance-context';
import { ScalePressable } from '@/components/scale-pressable';

const appearanceOptions: { value: AppearancePreference; title: string; detail: string }[] = [
  { value: 'light', title: 'Light', detail: 'Use Lumora’s light palette.' },
  { value: 'dark', title: 'Dark', detail: 'Use Lumora’s darker palette.' },
  { value: 'system', title: 'System', detail: 'Follow your device appearance.' },
];

export default function SettingsScreen() {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  const { appearance, resolvedAppearance, error, setAppearance } = useAppearance();

  return (
    <Page>
      <ScalePressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹  Back</Text>
      </ScalePressable>
      <Heading title="Settings" description="Make Lumora feel comfortable for you." />

      <View style={styles.section}>
        <SectionLabel>APPEARANCE</SectionLabel>
        <Card style={styles.card}>
          <Text style={styles.title}>Choose an appearance</Text>
          <View style={styles.options}>
            {appearanceOptions.map((option) => {
              const selected = appearance === option.value;
              return (
                <ScalePressable
                  key={option.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => void setAppearance(option.value)}
                  scaleTo={0.98}
                  style={[
                    styles.option,
                    selected && {
                      borderColor: colors.primary,
                      backgroundColor: colors.selectedSurface,
                    },
                  ]}>
                  <View
                    style={[
                      styles.radio,
                      selected && { borderColor: colors.primary },
                    ]}>
                    {selected ? (
                      <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />
                    ) : null}
                  </View>
                  <View style={styles.optionCopy}>
                    <Text style={styles.title}>{option.title}</Text>
                    <Text style={styles.copy}>{option.detail}</Text>
                  </View>
                </ScalePressable>
              );
            })}
          </View>
          <Text style={styles.copy}>
            Currently showing {resolvedAppearance} appearance. Your choice is saved on this device.
          </Text>
          {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionLabel>ACCOUNT SETTINGS</SectionLabel>
        <Card style={styles.card}>
          <Text style={styles.title}>Account access</Text>
          <Text style={styles.copy}>
            Sign-in and email settings are not connected yet. Your profile information is stored on this device.
          </Text>
        </Card>
      </View>
    </Page>
  );
}

const baseStyles = StyleSheet.create({
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    gap: 8,
  },
  card: {
    padding: 16,
  },
  title: {
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  copy: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  options: {
    gap: 8,
  },
  option: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9DFE8',
    borderRadius: 12,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
  radio: {
    height: 22,
    width: 22,
    borderWidth: 1,
    borderColor: '#6E6670',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
  },
  error: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
});
