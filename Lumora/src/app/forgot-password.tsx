import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, Heading, Page } from '@/components/lumora-ui';
import { FormField, InlineError } from '@/components/onboarding-ui';
import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';
import { useAuth } from '@/contexts/auth-context';
import { ScalePressable } from '@/components/scale-pressable';

export default function ForgotPasswordScreen() {
  const styles = useThemedStyles(baseStyles);
  const { sendPasswordReset } = useAuth();
  const { email: routeEmail } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(Array.isArray(routeEmail) ? routeEmail[0] : routeEmail ?? '');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const submissionInProgress = useRef(false);

  async function submit() {
    if (submissionInProgress.current || isSending) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    submissionInProgress.current = true;
    setIsSending(true);
    try {
      const redirectTo = Linking.createURL('reset-password');
      await sendPasswordReset(trimmedEmail, redirectTo);
      setIsSent(true);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : 'We could not send the reset link. Please try again.',
      );
    } finally {
      submissionInProgress.current = false;
      setIsSending(false);
    }
  }

  return (
    <Page>
      <ScalePressable
        accessibilityRole="button"
        onPress={() =>
          router.replace({
            pathname: '/login',
            params: email.trim() ? { email: email.trim() } : undefined,
          })
        }
        style={styles.backButton}>
        <Text style={styles.backText}>‹  Back to sign in</Text>
      </ScalePressable>
      <Heading
        title="Forgot password?"
        description="Enter the email address linked to your Lumora account and we’ll send a reset link."
      />
      {isSent ? (
        <Card style={styles.messageCard}>
          <Text style={styles.messageTitle}>Check your email</Text>
          <Text style={styles.messageCopy}>
            If an account exists for this address, a password-reset email has been sent.
          </Text>
          <ActionButton
            secondary
            onPress={() =>
              router.replace({
                pathname: '/login',
                params: { email: email.trim() },
              })
            }>
            Return to sign in
          </ActionButton>
        </Card>
      ) : (
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
          {error ? <InlineError>{error}</InlineError> : null}
          <ActionButton onPress={() => void submit()} disabled={isSending}>
            {isSending ? 'Sending…' : 'Send reset link'}
          </ActionButton>
        </View>
      )}
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
  messageCard: {
    gap: 12,
  },
  messageTitle: {
    color: '#2E2830',
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '600',
  },
  messageCopy: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
});
