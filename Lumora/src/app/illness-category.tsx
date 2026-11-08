import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { ChoiceCard, InlineError, OnboardingStep, StepContinue } from '@/components/onboarding-ui';
import {
  useOnboarding,
  type IllnessCategory,
} from '@/contexts/onboarding-context';

const categories: { title: IllnessCategory; description: string }[] = [
  { title: 'Cancer', description: 'An optional choice used only for the onboarding preview.' },
  { title: 'Chronic illness', description: 'An optional choice used only for the onboarding preview.' },
  { title: 'Other', description: 'An optional choice used only for the onboarding preview.' },
  { title: 'Prefer not to say', description: 'Keep the standard Lumora preview.' },
];

export default function IllnessCategoryScreen() {
  const { profile, saveProfile } = useOnboarding();
  const [category, setCategory] = useState<IllnessCategory>(profile.illnessCategory);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    setError('');
    setSaving(true);
    try {
      await saveProfile({ illnessCategory: category });
      router.push('./visual-theme');
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
      step={6}
      total={8}
      title="Choose a category"
      description="This optional choice only influences a small visual accent. It does not change your role, permissions, or app features. You can also prefer not to say."
      onBack={() => router.back()}>
      <View style={{ gap: 12 }}>
        {categories.map((item) => (
          <ChoiceCard
            key={item.title}
            title={item.title}
            description={item.description}
            selected={category === item.title}
            onPress={() => setCategory(item.title)}
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
