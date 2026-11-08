import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, Heading, Page } from '@/components/lumora-ui';
import { FormField, InlineError } from '@/components/onboarding-ui';
import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';
import { useAuth } from '@/contexts/auth-context';

type RecoveryStatus = 'loading' | 'ready' | 'error' | 'success';

export default function ResetPasswordScreen() {
  const styles = useThemedStyles(baseStyles);
  const { restorePasswordRecovery, updatePassword } = useAuth();
  const url = Linking.useLinkingURL();
  const [status, setStatus] = useState<RecoveryStatus>('loading');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const submissionInProgress = useRef(false);
  const processedUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!url || processedUrl.current === url) return;
    processedUrl.current = url;
    void restorePasswordRecovery(url)
      .then(() => setStatus('ready'))
      .catch((recoveryError: unknown) => {
        setError(
          recoveryError instanceof Error
            ? recoveryError.message
            : 'This reset link could not be used. Request a new one and try again.',
        );
        setStatus('error');
      });
  }, [url, restorePasswordRecovery]);

  async function submit() {
    if (submissionInProgress.current || isSaving) return;
    if (!password) {
      setError('Enter a new password.');
      return;
    }
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }

    setError('');
    submissionInProgress.current = true;
    setIsSaving(true);
    try {
      await updatePassword(password);
      setStatus('success');
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'We could not update your password. Please try again.',
      );
    } finally {
      submissionInProgress.current = false;
      setIsSaving(false);
    }
  }

  return (
    <Page>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/login')}
        style={styles.backButton}>
        <Text style={styles.backText}>‹  Back to sign in</Text>
      </Pressable>
      <Heading
        title={status === 'success' ? 'Password updated' : 'Choose a new password'}
        description={
          status === 'success'
            ? 'Your password has been updated. You can now sign in with it.'
            : 'Set a new password for your Lumora account.'
        }
      />
      {status === 'loading' ? (
        <Text style={styles.messageCopy}>Checking your reset link…</Text>
      ) : status === 'ready' ? (
        <View style={styles.form}>
          <FormField
            label="New password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setError('');
            }}
            placeholder="Enter a new password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <FormField
            label="Confirm new password"
            value={confirmation}
            onChangeText={(value) => {
              setConfirmation(value);
              setError('');
            }}
            placeholder="Enter the password again"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          {error ? <InlineError>{error}</InlineError> : null}
          <ActionButton onPress={() => void submit()} disabled={isSaving}>
            {isSaving ? 'Updating…' : 'Update password'}
          </ActionButton>
        </View>
      ) : status === 'success' ? (
        <Card style={styles.messageCard}>
          <Text style={styles.messageCopy}>
            Your password has been changed. Sign in with your new password to continue.
          </Text>
          <ActionButton onPress={() => router.replace('/login')}>Return to sign in</ActionButton>
        </Card>
      ) : (
        <Card style={styles.messageCard}>
          <InlineError>{error}</InlineError>
          <Text style={styles.messageCopy}>
            Request another password reset link and open it on this device.
          </Text>
          <ActionButton secondary onPress={() => router.replace('/forgot-password')}>
            Request a new link
          </ActionButton>
          <ActionButton onPress={() => router.replace('/login')}>Return to sign in</ActionButton>
        </Card>
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
  messageCopy: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
});
