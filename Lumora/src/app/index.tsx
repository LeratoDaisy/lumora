import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Brand, Card, Page } from '@/components/lumora-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';
import { useAuth } from '@/contexts/auth-context';
import { useOnboarding } from '@/contexts/onboarding-context';

const tagline = 'Through every moment, keep the light.';

export default function WelcomeScreen() {
  const styles = useThemedStyles(baseStyles);
  const { profile, isLoaded: profileLoaded, loadError } = useOnboarding();
  const { session, isLoading: authLoading, error: authError } = useAuth();

  useEffect(() => {
    if (!authLoading && profileLoaded && session) {
      router.replace(profile.completed ? '/home' : '/personal-details');
    }
  }, [authLoading, profileLoaded, profile.completed, session]);

  return (
    <Page>
      <View style={styles.top}>
        <Brand />
      </View>

      <View style={styles.hero}>
        <View style={styles.lightMark}>
          <View style={styles.lightCore} />
        </View>
        <Text style={styles.title}>{tagline}</Text>
        <Text style={styles.description}>
          A private space for you and your family to hold close the moments that matter.
        </Text>
      </View>

      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>A little more light, together.</Text>
        <Text style={styles.welcomeCopy}>
          However today feels, you belong here. Make room for memories, feelings, and the people
          beside you.
        </Text>
        <Link href="./create-account" asChild>
          <ActionButton>Create your profile</ActionButton>
        </Link>
        <Link href="./login" asChild>
          <ActionButton secondary>I already have an account</ActionButton>
        </Link>
        {authError ? <Text style={styles.signInMessage}>{authError}</Text> : null}
        {loadError ? <Text style={styles.signInMessage}>{loadError}</Text> : null}
        <Text style={styles.localNote}>
          Account sign-in uses Supabase Auth. Lumora profile and space details are stored on this device for now.
        </Text>
      </Card>
    </Page>
  );
}

const baseStyles = StyleSheet.create({
  top: {
    paddingTop: 8,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 12,
    gap: 16,
  },
  lightMark: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EBDDEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightCore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: LumoraColors.primary,
    opacity: 0.88,
  },
  title: {
    maxWidth: 430,
    color: LumoraColors.primaryText,
    fontFamily: Fonts.serif,
    fontSize: 38,
    fontWeight: '600',
    lineHeight: 46,
    textAlign: 'center',
  },
  description: {
    maxWidth: 420,
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  welcomeTitle: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.serif,
    fontSize: 23,
    fontWeight: '600',
    lineHeight: 30,
  },
  welcomeCopy: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 23,
  },
  localNote: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 12,
    textAlign: 'center',
    paddingTop: 2,
  },
  signInMessage: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
