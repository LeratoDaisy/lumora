import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card } from '@/components/lumora-ui';
import { OnboardingStep } from '@/components/onboarding-ui';
import { Fonts, LumoraColors } from '@/constants/theme';

export default function VerificationScreen() {
  return (
    <OnboardingStep
      step={2}
      total={8}
      title="Check your email"
      description="Normally, a verification link would be sent to the email address you entered."
      onBack={() => router.back()}>
      <Card style={styles.card}>
        <View style={styles.mark}>
          <Text style={styles.markText}>✉</Text>
        </View>
        <Text style={styles.title}>This is a demo</Text>
        <Text style={styles.copy}>
          No email has been sent. Continue to the next step to preview the rest of onboarding.
        </Text>
        <ActionButton onPress={() => router.push('./personal-details')}>Continue for demo</ActionButton>
      </Card>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
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
