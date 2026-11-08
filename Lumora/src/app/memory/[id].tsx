import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, Heading, Page } from '@/components/lumora-ui';
import { formatMemoryDate } from '@/components/memory-card';
import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';
import { useMemories } from '@/contexts/memory-context';
import { useOnboarding } from '@/contexts/onboarding-context';
import { ScalePressable } from '@/components/scale-pressable';

export default function MemoryDetailScreen() {
  const styles = useThemedStyles(baseStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useOnboarding();
  const { memories, isLoaded, loadError, deleteMemory } = useMemories();
  const [error, setError] = useState('');
  const memory = memories.find((item) => item.id === id);
  const canEdit = memory?.creatorId === profile.userId;
  const canView = memory?.creatorId === profile.userId || memory?.visibility === 'shared';

  function confirmDelete() {
    if (!memory || !canEdit) return;
    Alert.alert('Delete this memory?', 'This memory will be removed from your Lightbook.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete memory',
        style: 'destructive',
        onPress: () => {
          void removeMemory();
        },
      },
    ]);
  }

  async function removeMemory() {
    if (!memory) return;
    setError('');
    try {
      await deleteMemory(memory.id);
      router.replace('/lightbook');
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? `We couldn't delete this memory. ${deleteError.message}`
          : "We couldn't delete this memory. Please try again.",
      );
    }
  }

  if (!isLoaded) {
    return (
      <Page>
        <ScalePressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹  Back</Text>
        </ScalePressable>
        <Text style={styles.copy}>Loading your memory…</Text>
      </Page>
    );
  }

  if (!memory || !canView) {
    return (
      <Page>
        <ScalePressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹  Back</Text>
        </ScalePressable>
        {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
        <Heading title="Memory not found" description="This memory may have been removed." />
        <ActionButton secondary onPress={() => router.replace('/lightbook')}>Return to Lightbook</ActionButton>
      </Page>
    );
  }

  return (
    <Page>
      <ScalePressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹  Back</Text>
      </ScalePressable>
      <Heading title={memory.title} />
      {memory.imageUri ? (
        <Image source={{ uri: memory.imageUri }} style={styles.image} resizeMode="cover" />
      ) : null}
      <Card>
        <View style={styles.statusRow}>
          <Text style={styles.status}>
            {memory.visibility === 'private' ? 'Private' : 'Shared'}
          </Text>
          <Text style={styles.copy}>{formatMemoryDate(memory.date)}</Text>
        </View>
        <Text style={styles.copy}>
          {memory.visibility === 'private'
            ? 'Only you can view this moment.'
            : 'This moment can appear in your Shared Family Timeline.'}
        </Text>
        <Detail label="Caption" value={memory.caption || 'No caption added.'} />
        <Detail label="Occasion" value={memory.occasion || 'Not added'} />
        <Detail label="Date" value={formatMemoryDate(memory.date)} />
        <Detail label="Location" value={memory.location || 'Not added'} />
      </Card>
      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {canEdit ? (
        <View style={styles.actions}>
          <ActionButton
            secondary
            onPress={() =>
              router.push({ pathname: '/memory/create', params: { id: memory.id } })
            }>
            Edit memory
          </ActionButton>
          <ActionButton secondary onPress={confirmDelete} style={styles.deleteButton}>
            Delete memory
          </ActionButton>
        </View>
      ) : null}
    </Page>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  const styles = useThemedStyles(baseStyles);
  return (
    <View style={styles.detail}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.copy}>{value}</Text>
    </View>
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
  image: {
    width: '100%',
    height: 260,
    borderRadius: 12,
    backgroundColor: '#F0E7F0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9DFE8',
  },
  status: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  detail: {
    gap: 4,
  },
  label: {
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  copy: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: 8,
  },
  deleteButton: {
    borderColor: '#B64B58',
  },
  error: {
    color: '#B64B58',
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
