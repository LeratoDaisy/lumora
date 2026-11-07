import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/lumora-ui';
import {
  CheckOption,
  FormField,
  InlineError,
  OnboardingStep,
  StepContinue,
} from '@/components/onboarding-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboarding-context';

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  privacy?: string;
};

export default function CreateAccountScreen() {
  const { saveProfile } = useOnboarding();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
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
    if (!password) {
      nextErrors.password = 'Create a password.';
    } else if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      nextErrors.password = 'Use at least 8 characters, including a letter and a number.';
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!agreed) nextErrors.privacy = 'Please agree to the Privacy Notice to continue.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaveError('');
    setSaving(true);
    try {
      await saveProfile({ firstName: fullName.trim().split(/\s+/)[0] });
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      router.push('./verification');
    } catch (saveFailure) {
      setSaveError(
        saveFailure instanceof Error
          ? `We couldn't save your demo details. ${saveFailure.message}`
          : "We couldn't save your demo details. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingStep
      step={1}
      total={8}
      title="Create your account"
      description="Start with the basics. This is a demo flow; your email and password are not saved or sent."
      onBack={() => router.back()}>
      <View style={styles.form}>
        <FormField
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your full name"
          error={errors.fullName}
          autoComplete="name"
          textContentType="name"
        />
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 8 characters"
          error={errors.password}
          secureTextEntry
          autoComplete="off"
          textContentType="none"
          autoCapitalize="none"
        />
        <FormField
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Enter your password again"
          error={errors.confirmPassword}
          secureTextEntry
          autoComplete="off"
          textContentType="none"
          autoCapitalize="none"
        />
        <Card style={styles.notice}>
          <CheckOption checked={agreed} onPress={() => setAgreed((current) => !current)} error={errors.privacy}>
            I agree to the Privacy Notice.
          </CheckOption>
          <Text style={styles.noticeCopy}>
            Demo notice: names, role, category, and space name are saved on this device. Email, password, and date of birth are not stored.
          </Text>
        </Card>
        <StepContinue onPress={submit} disabled={saving}>
          {saving ? 'Saving…' : 'Create account'}
        </StepContinue>
        {saveError ? <InlineError>{saveError}</InlineError> : null}
        {Object.keys(errors).length > 0 ? (
          <InlineError>Please review the highlighted fields.</InlineError>
        ) : null}
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
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
