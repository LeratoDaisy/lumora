import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ChoiceCard, InlineError, OnboardingStep, StepContinue } from '@/components/onboarding-ui';
import { useOnboarding, type UserRole } from '@/contexts/onboarding-context';

const roles: { title: UserRole; description: string }[] = [
  {
    title: 'Patient',
    description: 'Owns the Lumora Space and controls who is invited.',
  },
  {
    title: 'Family Member',
    description: 'Can participate in the space and create memories.',
  },
  {
    title: 'Caregiver',
    description: 'Invited-only. Can participate, but cannot create memories or invite others.',
  },
];

export default function RoleSelectionScreen() {
  const { profile, saveProfile } = useOnboarding();
  const [role, setRole] = useState<UserRole | null>(profile.role);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!role) {
      setError('Choose the role that best describes you.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await saveProfile({ role });
      router.push('./illness-category');
    } catch (saveFailure) {
      setError(
        saveFailure instanceof Error
          ? `We couldn't save your choice. ${saveFailure.message}`
          : "We couldn't save your choice. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStep
      step={5}
      total={8}
      title="What brings you here?"
      description="Your role determines what you can do in a Lumora Space."
      onBack={() => router.back()}>
      <View style={{ gap: 12 }}>
        {roles.map((item) => (
          <ChoiceCard
            key={item.title}
            title={item.title}
            description={item.description}
            selected={role === item.title}
            onPress={() => {
              setRole(item.title);
              setError('');
            }}
          />
        ))}
        {error ? <InlineError>{error}</InlineError> : null}
        <StepContinue onPress={submit} disabled={saving}>
          {saving ? 'Saving…' : 'Continue'}
        </StepContinue>
      </View>
    </OnboardingStep>
  );
}
