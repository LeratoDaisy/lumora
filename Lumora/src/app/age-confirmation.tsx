import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/lumora-ui';
import {
  CheckOption,
  InlineError,
  OnboardingStep,
  StepContinue,
} from '@/components/onboarding-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboarding-context';

export default function AgeConfirmationScreen() {
  const { loadError } = useOnboarding();
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  function submit() {
    if (!confirmed) {
      setError('Please confirm that you are 18 or older to continue.');
      return;
    }
    router.push('./role-selection');
  }

  return (
    <OnboardingStep
      step={4}
      total={8}
      title="A quick confirmation"
      description="Lumora is designed for adults aged 18 and older."
      onBack={() => router.back()}>
      <View style={styles.content}>
        <Card>
          <Text style={styles.notice}>Age confirmation</Text>
          <CheckOption
            checked={confirmed}
            onPress={() => {
              setConfirmed((current) => !current);
              setError('');
            }}>
            I confirm that I am 18 years or older.
          </CheckOption>
        </Card>
        {error ? <InlineError>{error}</InlineError> : null}
        {loadError ? <InlineError>{loadError}</InlineError> : null}
        <StepContinue onPress={submit}>Continue</StepContinue>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  notice: {
    color: LumoraColors.primary,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
