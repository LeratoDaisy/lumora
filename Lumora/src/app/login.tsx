import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FormField, InlineError } from '@/components/onboarding-ui';
import { ActionButton, Heading, Page } from '@/components/lumora-ui';
import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';
import { useAuth } from '@/contexts/auth-context';
import { useOnboarding } from '@/contexts/onboarding-context';

export default function LoginScreen() {
  const styles = useThemedStyles(baseStyles);
  const { signIn, isLoading: authLoading, error: authError } = useAuth();
  const { profile, saveProfile, isLoaded: profileLoaded } = useOnboarding();
  const { email: routeEmail } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(Array.isArray(routeEmail) ? routeEmail[0] : routeEmail ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submissionInProgress = useRef(false);

  useEffect(() => {
    if (routeEmail) setEmail(Array.isArray(routeEmail) ? routeEmail[0] : routeEmail);
  }, [routeEmail]);

  async function submit() {
    if (submissionInProgress.current || authLoading || !profileLoaded) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }

    setError('');
    submissionInProgress.current = true;
    setSubmitting(true);
    try {
      const { user } = await signIn(trimmedEmail, password);
      await saveProfile({ userId: user.id });
      router.replace(profile.completed ? '/home' : '/personal-details');
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : authError || 'We could not sign you in. Please try again.',
      );
    } finally {
      submissionInProgress.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Page>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹  Back</Text>
      </Pressable>
      <Heading title="Sign in" description="Enter your email and password to continue." />
      <View style={styles.form}>
        <FormField
          label="Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setError('');
          }}
          placeholder="you@example.com"
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
            setError('');
          }}
          placeholder="Your password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
        />
        {error ? <InlineError>{error}</InlineError> : null}
        <ActionButton
          onPress={() => void submit()}
          disabled={submitting || authLoading || !profileLoaded}>
          {submitting || authLoading ? 'Signing in…' : 'Sign in'}
        </ActionButton>
      </View>
    </Page>
  );
}

const baseStyles = StyleSheet.create({
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  form: {
    gap: 16,
  },
});
