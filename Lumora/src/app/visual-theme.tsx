import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, SectionLabel } from '@/components/lumora-ui';
import { OnboardingStep } from '@/components/onboarding-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboarding-context';

const accents = {
  Cancer: LumoraColors.primary,
  'Chronic illness': '#6E8275',
  Other: '#738098',
  'Prefer not to say': LumoraColors.primary,
} as const;

export default function VisualThemeScreen() {
  const { profile } = useOnboarding();
  const accent = accents[profile.illnessCategory];

  return (
    <OnboardingStep
      step={7}
      total={8}
      title="A look that feels calm"
      description="Your category gently tints the accent in this preview. The Lumora palette and every feature stay the same."
      onBack={() => router.back()}>
      <Card style={styles.preview}>
        <Text style={styles.previewLabel}>PREVIEW</Text>
        <View style={styles.sampleCard}>
          <View style={[styles.sampleMark, { backgroundColor: accent }]} />
          <View style={styles.sampleCopy}>
            <Text style={styles.sampleTitle}>A moment to keep</Text>
            <Text style={styles.sampleText}>Warm, gentle, and still Lumora.</Text>
          </View>
        </View>
        <View style={styles.swatches}>
          <View style={[styles.swatch, { backgroundColor: accent }]} />
          <View style={[styles.swatch, { backgroundColor: LumoraColors.secondary }]} />
          <View style={[styles.swatch, { backgroundColor: LumoraColors.warmSurface }]} />
        </View>
        <SectionLabel>{profile.illnessCategory}</SectionLabel>
      </Card>
      <ActionButton onPress={() => router.push('./space')}>Continue</ActionButton>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  preview: {
    gap: 16,
  },
  previewLabel: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sampleCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LumoraColors.border,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sampleMark: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sampleCopy: {
    gap: 4,
  },
  sampleTitle: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.serif,
    fontSize: 18,
    fontWeight: '600',
  },
  sampleText: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  swatches: {
    flexDirection: 'row',
    gap: 8,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LumoraColors.border,
  },
});
