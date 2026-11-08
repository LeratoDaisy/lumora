import { router } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ActionButton, EmptyState, Heading, Page } from '@/components/lumora-ui';
import { MemoryCard } from '@/components/memory-card';
import { Fonts } from '@/constants/theme';
import { useLumoraColors, useThemedStyles } from '@/contexts/appearance-context';
import { useMemories } from '@/contexts/memory-context';
import { useOnboarding } from '@/contexts/onboarding-context';

export default function LightbookScreen() {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  const { profile } = useOnboarding();
  const { memories, isLoaded, loadError } = useMemories();
  const ownMemories = memories
    .filter((memory) => memory.creatorId === profile.userId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  return (
    <Page>
      <Heading title="Lightbook" description="A private place to keep meaningful moments." />
      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
      {!isLoaded ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.note}>Loading your Lightbook…</Text>
        </View>
      ) : ownMemories.length === 0 ? (
        <EmptyState
          title="Your Lightbook is waiting."
          description="Save a moment you want to remember."
          action={
            profile.role === 'Caregiver' ? (
              <Text style={styles.note}>
                Caregiver access is invited-only. Memory creation is not available for this role.
              </Text>
            ) : (
              <ActionButton onPress={() => router.push('/memory/create')}>
                Create a memory
              </ActionButton>
            )
          }
        />
      ) : (
        <View style={styles.list}>
          <ActionButton onPress={() => router.push('/memory/create')} disabled={profile.role === 'Caregiver'}>
            Create a memory
          </ActionButton>
          {profile.role === 'Caregiver' ? (
            <Text style={styles.note}>Caregiver access is invited-only. Memory creation is not available for this role.</Text>
          ) : null}
          {ownMemories.map((memory) => <MemoryCard key={memory.id} memory={memory} />)}
        </View>
      )}
    </Page>
  );
}

const baseStyles = StyleSheet.create({
  list: {
    gap: 12,
  },
  loading: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  note: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  error: {
    color: '#B64B58',
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
