import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import {
  ActionButton,
  Brand,
  Card,
  Heading,
  Page,
  SectionLabel,
} from '@/components/lumora-ui';
import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';
import {
  CheckInFeelingLabels,
  getLocalDateString,
  useCheckIns,
} from '@/contexts/check-in-context';
import { formatMemoryDate } from '@/components/memory-card';
import { useMemories } from '@/contexts/memory-context';
import { useOnboarding } from '@/contexts/onboarding-context';

export default function HomeScreen() {
  const styles = useThemedStyles(baseStyles);
  const { profile } = useOnboarding();
  const { checkIns } = useCheckIns();
  const { memories } = useMemories();
  const name = profile.preferredName || profile.firstName;
  const todayCheckIn = checkIns.find(
    (checkIn) =>
      checkIn.creatorId === profile.userId && checkIn.date === getLocalDateString(),
  );
  const recentActivity = [
    ...memories
      .filter((memory) => memory.visibility === 'shared')
      .map((memory) => ({
        id: `memory-${memory.id}`,
        kind: 'Shared memory',
        title: memory.title,
        date: memory.date,
        updatedAt: memory.updatedAt,
      })),
    ...checkIns
      .filter((checkIn) => checkIn.visibility === 'shared')
      .map((checkIn) => ({
        id: `check-in-${checkIn.id}`,
        kind: 'Daily check-in',
        title: CheckInFeelingLabels[checkIn.feeling],
        date: checkIn.date,
        updatedAt: checkIn.updatedAt,
      })),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt))[0];

  return (
    <Page>
      <Brand compact />
      <Heading
        eyebrow="Your space"
        title="Welcome back to your Lumora Space."
        description={name ? `It's good to have you here, ${name}.` : 'A new day, one moment at a time.'}
      />

      <Card style={styles.spaceCard}>
        <Text style={styles.cardEyebrow}>LUMORA SPACE</Text>
        <Text style={styles.spaceTitle}>{profile.spaceName || 'Your family, together.'}</Text>
        <Text style={styles.cardCopy}>
          A private place to keep what matters close and share it with the people you choose.
        </Text>
      </Card>

      <Card>
        <SectionLabel>Today&apos;s check-in</SectionLabel>
        {todayCheckIn ? (
          <>
            <Text style={styles.checkInFeeling}>
              {CheckInFeelingLabels[todayCheckIn.feeling]}
            </Text>
            <Text style={styles.cardCopy}>
              {todayCheckIn.visibility === 'shared' ? 'Shared with your Lumora Space.' : 'Private to you.'}
            </Text>
            <Link href="/check-in" asChild>
              <ActionButton secondary>Update check-in</ActionButton>
            </Link>
          </>
        ) : (
          <>
            <Text style={styles.cardCopy}>How are you feeling today?</Text>
            <Link href="/check-in" asChild>
              <ActionButton>Check in</ActionButton>
            </Link>
          </>
        )}
      </Card>

      <Card>
        <SectionLabel>Recent shared activity</SectionLabel>
        {recentActivity ? (
          <View style={styles.activity}>
            <Text style={styles.activityType}>{recentActivity.kind}</Text>
            <Text style={styles.activityTitle}>{recentActivity.title}</Text>
            <Text style={styles.cardCopy}>{formatMemoryDate(recentActivity.date)}</Text>
          </View>
        ) : (
          <Text style={styles.cardCopy}>
            No shared moments yet. When your family shares something, it will appear here.
          </Text>
        )}
      </Card>

      <View style={styles.quickActions}>
        <SectionLabel>Quick access</SectionLabel>
        <Link href="/lightbook" asChild>
          <ActionButton secondary>Open your Lightbook</ActionButton>
        </Link>
        <Link href="/support" asChild>
          <ActionButton secondary>Visit Support & Coping</ActionButton>
        </Link>
        <Link href="/timeline" asChild>
          <ActionButton secondary>View shared family timeline</ActionButton>
        </Link>
      </View>
    </Page>
  );
}

const baseStyles = StyleSheet.create({
  spaceCard: {
    backgroundColor: '#F0E7F0',
    borderColor: '#E4D7E5',
  },
  cardEyebrow: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  spaceTitle: {
    color: '#2E2830',
    fontFamily: Fonts.serif,
    fontSize: 23,
    fontWeight: '600',
  },
  cardCopy: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 23,
  },
  checkInFeeling: {
    color: '#2E2830',
    fontFamily: Fonts.serif,
    fontSize: 20,
  },
  activity: {
    gap: 4,
  },
  activityType: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  activityTitle: {
    color: '#2E2830',
    fontFamily: Fonts.serif,
    fontSize: 19,
  },
  quickActions: {
    gap: 12,
  },
});
