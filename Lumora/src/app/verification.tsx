import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card } from '@/components/lumora-ui';
import { OnboardingStep } from '@/components/onboarding-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';

export default function VerificationScreen() {
  const styles = useThemedStyles(baseStyles);
  return (
    <OnboardingStep
      step={2}
      total={8}
      title="Email verification"
      description="Email verification is not connected yet. No email was sent; you can continue setting up your Lumora profile."
      onBack={() => router.back()}>
      <Card style={styles.card}>
        <View style={styles.mark}>
          <Text style={styles.markText}>✉</Text>
        </View>
        <Text style={styles.title}>Continue setting up your space</Text>
        <Text style={styles.copy}>
          Your profile information stays on this device until account access is available.
        </Text>
        <ActionButton onPress={() => router.push('./personal-details')}>Continue</ActionButton>
      </Card>
    </OnboardingStep>
  );
}

const baseStyles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  mark: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: '#F0E7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: LumoraColors.primary,
    fontSize: 25,
  },
  title: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '600',
  },
  copy: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
