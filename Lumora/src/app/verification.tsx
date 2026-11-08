import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card } from '@/components/lumora-ui';
import { OnboardingStep } from '@/components/onboarding-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';
import { useAuth } from '@/contexts/auth-context';

export default function VerificationScreen() {
  const styles = useThemedStyles(baseStyles);
  const { email: routeEmail } = useLocalSearchParams<{ email?: string }>();
  const email = Array.isArray(routeEmail) ? routeEmail[0] : routeEmail;
  const { session, isLoading } = useAuth();

  function continueToOnboarding() {
    router.replace('/personal-details');
  }

  return (
    <OnboardingStep
      step={2}
      total={8}
      title={session ? 'Your account is ready' : 'Confirm your email'}
      description={
        session
          ? 'Your account is active. Continue setting up your Lumora profile.'
          : 'Open the confirmation link sent by Supabase, then return here and sign in to continue.'
      }
      onBack={() => router.back()}>
      <Card style={styles.card}>
        <View style={styles.mark}>
          <Text style={styles.markText}>✉</Text>
        </View>
        <Text style={styles.title}>
          {session ? 'Continue setting up your space' : 'Check your inbox'}
        </Text>
        <Text style={styles.copy}>
          {session
            ? 'Your account is active. No email verification is being claimed here.'
            : email
              ? `If this address can be registered, a confirmation message was requested for ${email}.`
              : 'If this address can be registered, Supabase sent a confirmation message.'}
        </Text>
        {!isLoading && session ? (
          <ActionButton onPress={continueToOnboarding}>Continue</ActionButton>
        ) : !isLoading ? (
          <ActionButton
            onPress={() =>
              email
                ? router.replace({ pathname: './login', params: { email } })
                : router.replace('./login')
            }>
            Go to sign in
          </ActionButton>
        ) : null}
      </Card>
    </OnboardingStep>
  );
}

const baseStyles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  mark: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: '#F0E7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: LumoraColors.primary,
    fontSize: 25,
  },
  title: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: '600',
  },
  copy: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
