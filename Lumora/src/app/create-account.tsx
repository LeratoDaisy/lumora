import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/lumora-ui';
import {
  FormField,
  InlineError,
  OnboardingStep,
  StepContinue,
} from '@/components/onboarding-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';
import { useOnboarding } from '@/contexts/onboarding-context';

type FieldErrors = {
  fullName?: string;
  email?: string;
};

export default function CreateAccountScreen() {
  const styles = useThemedStyles(baseStyles);
  const { saveProfile } = useOnboarding();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    const nextErrors: FieldErrors = {};
    if (!fullName.trim()) nextErrors.fullName = 'Enter your full name.';
    if (!email.trim()) {
      nextErrors.email = 'Enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaveError('');
    setSaving(true);
    try {
      await saveProfile({ firstName: fullName.trim().split(/\s+/)[0] });
      router.push('./verification');
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
      step={1}
      total={8}
      title="Create your profile"
      description="Start with the basics. Email setup is not connected yet, so your email is not sent or stored."
      onBack={() => router.back()}>
      <View style={styles.form}>
        <FormField
          label="Full name"
          value={fullName}
          onChangeText={(value) => {
            setFullName(value);
            setErrors((current) => ({ ...current, fullName: undefined }));
            setSaveError('');
          }}
          placeholder="Your full name"
          error={errors.fullName}
          autoComplete="name"
          textContentType="name"
        />
        <FormField
          label="Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: undefined }));
            setSaveError('');
          }}
          placeholder="you@example.com"
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Card style={styles.notice}>
          <Text style={styles.noticeCopy}>
            Your name and space details are saved on this device. Email verification and account sign-in are not available yet.
          </Text>
        </Card>
        <StepContinue onPress={submit} disabled={saving}>
          {saving ? 'Saving…' : 'Continue'}
        </StepContinue>
        {saveError ? <InlineError>{saveError}</InlineError> : null}
        {Object.keys(errors).length > 0 ? (
          <InlineError>Please review the highlighted fields.</InlineError>
        ) : null}
      </View>
    </OnboardingStep>
  );
}

const baseStyles = StyleSheet.create({
  form: {
    gap: 16,
  },
  notice: {
    padding: 14,
    gap: 4,
  },
  noticeCopy: {
    paddingLeft: 34,
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
  },
});
