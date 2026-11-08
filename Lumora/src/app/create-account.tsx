import { router } from 'expo-router';
import { useRef, useState } from 'react';
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
import { useAuth } from '@/contexts/auth-context';
import { useOnboarding } from '@/contexts/onboarding-context';

type FieldErrors = {
  fullName?: string;
  email?: string;
};

export default function CreateAccountScreen() {
  const styles = useThemedStyles(baseStyles);
  const { saveProfile, isLoaded: profileLoaded } = useOnboarding();
  const { signUp, isLoading: authLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submissionInProgress = useRef(false);

  async function submit() {
    if (submissionInProgress.current || authLoading || !profileLoaded) return;
    const nextErrors: FieldErrors = {};
    if (!fullName.trim()) nextErrors.fullName = 'Enter your full name.';
    if (!email.trim()) {
      nextErrors.email = 'Enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      setSaveError('Enter a password.');
      setErrors(nextErrors);
      return;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaveError('');
    submissionInProgress.current = true;
    setSubmitting(true);
    try {
      const { session, user } = await signUp(email.trim(), password);
      await saveProfile({
        firstName: fullName.trim().split(/\s+/)[0],
        ...(session && user ? { userId: user.id } : {}),
      });
      if (session) {
        router.replace('./personal-details');
      } else {
        router.push({ pathname: './verification', params: { email: email.trim() } });
      }
    } catch (saveFailure) {
      setSaveError(
        saveFailure instanceof Error
          ? `We couldn't save your details. ${saveFailure.message}`
          : "We couldn't save your details. Please try again.",
      );
    } finally {
      submissionInProgress.current = false;
      setSubmitting(false);
    }
  }

  return (
    <OnboardingStep
      step={1}
      total={8}
      title="Create your account"
      description="Start with your name and email address. Your password is securely handled by Supabase Auth."
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
        <FormField
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setSaveError('');
          }}
          placeholder="Create a password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Card style={styles.notice}>
          <Text style={styles.noticeCopy}>
            Your account credentials are sent to Supabase Auth. Lumora profile and space details remain on this device for now.
          </Text>
        </Card>
        <StepContinue
          onPress={submit}
          disabled={submitting || authLoading || !profileLoaded}>
          {submitting || authLoading ? 'Creating account…' : 'Create account'}
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
