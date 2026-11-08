import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, Heading, Page, SectionLabel } from '@/components/lumora-ui';
import { Fonts } from '@/constants/theme';
import { useAppearance, useThemedStyles } from '@/contexts/appearance-context';
import { useOnboarding } from '@/contexts/onboarding-context';

export default function MoreScreen() {
  const styles = useThemedStyles(baseStyles);
  const { profile, clearProfile } = useOnboarding();
  const { appearance } = useAppearance();
  const [error, setError] = useState('');
  const displayName = profile.preferredName || profile.firstName || 'Your profile';

  function confirmSignOut() {
    Alert.alert('Sign out?', 'Your saved memories and check-ins will stay on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  }

  async function signOut() {
    setError('');
    try {
      await clearProfile();
      router.replace('/');
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? `We couldn't sign you out. ${clearError.message}`
          : "We couldn't sign you out. Please try again.",
      );
    }
  }

  return (
    <Page>
      <Heading title="More" description="Your profile, privacy, and app settings." />

      <Card style={styles.summary}>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.detail}>{profile.role || 'Role not selected'}</Text>
        <Text style={styles.detail}>{profile.spaceName || 'Lumora Space not set up'}</Text>
      </Card>

      <View style={styles.section}>
        <SectionLabel>PROFILE</SectionLabel>
        <NavigationRow
          title="Profile"
          description="Name, role, and Lumora Space"
          onPress={() => router.push('/profile')}
        />
        <NavigationRow
          title="Role"
          description={profile.role || 'Not selected'}
          onPress={() => router.push('/profile')}
        />
        <NavigationRow
          title="Lumora Space"
          description={profile.spaceName || 'Not set up'}
          onPress={() => router.push('/profile')}
        />
      </View>

      <View style={styles.section}>
        <SectionLabel>PRIVACY</SectionLabel>
        <NavigationRow
          title="Privacy & visibility"
          description="Choose whether memories and check-ins are private or shared"
          onPress={() => router.push('/privacy')}
        />
      </View>

      <View style={styles.section}>
        <SectionLabel>SETTINGS</SectionLabel>
        <NavigationRow
          title="App appearance"
          description={appearance.charAt(0).toUpperCase() + appearance.slice(1)}
          onPress={() => router.push('/settings')}
        />
        <NavigationRow
          title="Account settings"
          description="Sign-in and email settings"
          onPress={() => router.push('/settings')}
        />
      </View>

      <View style={styles.section}>
        <SectionLabel>ACCOUNT</SectionLabel>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <ActionButton secondary onPress={confirmSignOut}>
          Sign out
        </ActionButton>
      </View>
    </Page>
  );
}

function NavigationRow({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  const styles = useThemedStyles(baseStyles);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const baseStyles = StyleSheet.create({
  summary: {
    padding: 18,
    gap: 4,
  },
  name: {
    color: '#2E2830',
    fontFamily: Fonts.serif,
    fontSize: 22,
  },
  detail: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  section: {
    gap: 8,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9DFE8',
    backgroundColor: '#FFF8F0',
  },
  rowCopy: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: '700',
  },
  rowDescription: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
  },
  chevron: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 24,
  },
  pressed: {
    opacity: 0.8,
  },
  error: {
    color: '#B64B58',
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
