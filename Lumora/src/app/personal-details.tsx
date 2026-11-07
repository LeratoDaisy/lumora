import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { FormField, InlineError, OnboardingStep, StepContinue } from '@/components/onboarding-ui';
import { useOnboarding } from '@/contexts/onboarding-context';

export default function PersonalDetailsScreen() {
  const { profile, saveProfile } = useOnboarding();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [preferredName, setPreferredName] = useState(profile.preferredName);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  function isAdult(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return false;
    }
    const today = new Date();
    let age = today.getFullYear() - year;
    if (
      today.getMonth() < month - 1 ||
      (today.getMonth() === month - 1 && today.getDate() < day)
    ) {
      age -= 1;
    }
    return age >= 18;
  }

  async function submit() {
    if (!firstName.trim()) {
      setError('Enter your first name.');
      return;
    }
    if (!dateOfBirth.trim()) {
      setError('Enter your date of birth.');
      return;
    }
    if (!isAdult(dateOfBirth.trim())) {
      setError('Enter a valid date of birth showing that you are 18 or older.');
      return;
    }

    setError('');
    setSaveError('');
    setSaving(true);
    try {
      await saveProfile({
        firstName: firstName.trim(),
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
      title="A little about you"
      description="Share only the details needed to personalize your demo space."
      onBack={() => router.back()}>
      <View style={{ gap: 16 }}>
        <FormField
          label="First name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Your first name"
          autoComplete="given-name"
          textContentType="givenName"
          autoCapitalize="words"
        />
        <FormField
          label="Preferred name (optional)"
          value={preferredName}
          onChangeText={setPreferredName}
          placeholder="What should we call you?"
          autoCapitalize="words"
        />
        <FormField
          label="Date of birth"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />
        {error || saveError ? <InlineError>{error || saveError}</InlineError> : null}
        <StepContinue onPress={submit} disabled={saving}>
          {saving ? 'Saving…' : 'Continue'}
        </StepContinue>
      </View>
    </OnboardingStep>
  );
}
