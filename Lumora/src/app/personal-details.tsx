import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { FormField, InlineError, OnboardingStep, StepContinue } from '@/components/onboarding-ui';
import { useOnboarding } from '@/contexts/onboarding-context';

export default function PersonalDetailsScreen() {
  const { profile, saveProfile } = useOnboarding();
  const [preferredName, setPreferredName] = useState(profile.preferredName);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    setError('');
    setSaveError('');
    setSaving(true);
    try {
      await saveProfile({
        preferredName: preferredName.trim(),
      });
      router.push('./age-confirmation');
    } catch (saveFailure) {
      setSaveError(
        saveFailure instanceof Error
          ? `We couldn't save your details. ${saveFailure.message}`
          : "We couldn't save your details. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStep
      step={3}
      total={8}
      title="How should we address you?"
      description="Your first name is saved from the previous step. Add a preferred name if you would like."
      onBack={() => router.back()}>
      <View style={{ gap: 16 }}>
        <FormField
          label="Preferred name (optional)"
          value={preferredName}
          onChangeText={setPreferredName}
          placeholder="What should we call you?"
          autoCapitalize="words"
        />
        {error || saveError ? <InlineError>{error || saveError}</InlineError> : null}
        <StepContinue onPress={submit} disabled={saving}>
          {saving ? 'Saving…' : 'Continue'}
        </StepContinue>
      </View>
    </OnboardingStep>
  );
}
