import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, Heading, Page } from '@/components/lumora-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboarding-context';

const details = [
  { title: 'Profile', description: 'Your personal details' },
  { title: 'Privacy', description: 'Your memories, shared on your terms' },
  { title: 'Settings', description: 'App preferences' },
];

export default function MoreScreen() {
  const { profile, clearProfile } = useOnboarding();
  const [error, setError] = useState('');

  async function signOut() {
    setError('');
    try {
      await clearProfile();
      router.replace('/');
    } catch (clearError) {
      setError(
        clearError instanceof Error
          ? `We couldn't clear the demo profile. ${clearError.message}`
          : "We couldn't clear the demo profile.",
      );
    }
  }

  return (
    <Page>
      <Heading title="More" description="Your space, just the way you need it." />
      <View style={styles.list}>
        <Card style={styles.item}>
          <Text style={styles.title}>Role</Text>
          <Text style={styles.description}>{profile.role || 'Not selected'}</Text>
        </Card>
        <Card style={styles.item}>
          <Text style={styles.title}>Lumora Space</Text>
          <Text style={styles.description}>{profile.spaceName || 'Not set up'}</Text>
        </Card>
        {details.map((item) => (
          <Card key={item.title} style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </Card>
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ActionButton secondary onPress={signOut}>
        Sign out
      </ActionButton>
    </Page>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  item: {
    paddingVertical: 16,
    gap: 4,
  },
  title: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  error: {
    color: LumoraColors.error,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
