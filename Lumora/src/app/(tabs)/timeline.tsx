import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Heading, Page } from '@/components/lumora-ui';
import { MemoryCard } from '@/components/memory-card';
import { SharedEngagement } from '@/components/shared-engagement';
import { Fonts } from '@/constants/theme';
import { useLumoraColors, useThemedStyles } from '@/contexts/appearance-context';
import {
  CheckInFeelingLabels,
  useCheckIns,
  type CheckIn,
} from '@/contexts/check-in-context';
import { useMemories, type Memory } from '@/contexts/memory-context';
import { useOnboarding } from '@/contexts/onboarding-context';

type TimelineEntry =
  | { type: 'memory'; date: string; updatedAt: string; memory: Memory }
  | { type: 'check-in'; date: string; updatedAt: string; checkIn: CheckIn };

const checkInDescriptions = {
  okay: 'is feeling okay',
  good_day: 'is having a good day',
  struggling: 'is struggling',
  need_rest: 'needs rest',
  prefer_not_to_say: 'would rather not say',
} as const;

function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function TimelineScreen() {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  const { profile } = useOnboarding();
  const { memories, isLoaded: memoriesLoaded, loadError: memoryError } = useMemories();
  const { checkIns, isLoaded: checkInsLoaded, loadError: checkInError } = useCheckIns();
  const entries: TimelineEntry[] = [
    ...memories
      .filter((memory) => memory.visibility === 'shared')
      .map((memory) => ({
        type: 'memory' as const,
        date: memory.date,
        updatedAt: memory.updatedAt,
        memory,
      })),
    ...checkIns
      .filter((checkIn) => checkIn.visibility === 'shared')
      .map((checkIn) => ({
        type: 'check-in' as const,
        date: checkIn.date,
        updatedAt: checkIn.updatedAt,
        checkIn,
      })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));
  const isLoaded = memoriesLoaded && checkInsLoaded;

  return (
    <Page>
      <Heading
        title="Shared Family Timeline"
        description="Moments chosen to share with your family."
      />
      {memoryError ? <Text style={styles.error}>{memoryError}</Text> : null}
      {checkInError ? <Text style={styles.error}>{checkInError}</Text> : null}
      {!isLoaded ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.note}>Loading shared moments…</Text>
        </View>
      ) : entries.length === 0 ? (
        <EmptyState
          title="Your shared space is quiet for now."
          description="Moments your family chooses to share will appear here."
        />
      ) : (
        <View style={styles.list}>
          {entries.map((entry) =>
            entry.type === 'memory' ? (
              <View key={`memory-${entry.memory.id}`} style={styles.entry}>
                <Text style={styles.creator}>
                  Shared by{' '}
                  {entry.memory.creatorId === profile.userId
                    ? profile.preferredName || profile.firstName || 'You'
                    : 'a family member'}
                </Text>
                <MemoryCard memory={entry.memory} typeLabel="Shared memory" />
                <SharedEngagement type="memory" id={entry.memory.id} />
              </View>
            ) : (
              <View key={`check-in-${entry.checkIn.id}`} style={styles.entry}>
                <SharedCheckInCard
                  checkIn={entry.checkIn}
                  creatorName={
                    entry.checkIn.creatorId === profile.userId
                      ? profile.preferredName || profile.firstName || 'You'
                      : 'A family member'
                  }
                />
                <SharedEngagement type="check-in" id={entry.checkIn.id} />
              </View>
            ),
          )}
        </View>
      )}
    </Page>
  );
}

function SharedCheckInCard({
  checkIn,
  creatorName,
}: {
  checkIn: CheckIn;
  creatorName: string;
}) {
  const styles = useThemedStyles(baseStyles);
  return (
    <Card>
      <View style={styles.typeRow}>
        <Text style={styles.typeLabel}>Daily check-in</Text>
        <Text style={styles.typeLabel}>Shared</Text>
      </View>
      <Text style={styles.checkInTitle}>
        {creatorName} {checkInDescriptions[checkIn.feeling]}
      </Text>
      <Text style={styles.date}>{formatDate(checkIn.date)}</Text>
      {checkIn.note ? <Text style={styles.note}>{checkIn.note}</Text> : null}
      <Text style={styles.feelingLabel}>{CheckInFeelingLabels[checkIn.feeling]}</Text>
    </Card>
  );
}

const baseStyles = StyleSheet.create({
  entry: {
    gap: 8,
  },
  list: {
    gap: 12,
  },
  loading: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  typeLabel: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkInTitle: {
    color: '#2E2830',
    fontFamily: Fonts.serif,
    fontSize: 21,
    lineHeight: 28,
  },
  date: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  note: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  feelingLabel: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    color: '#B64B58',
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  creator: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
});
