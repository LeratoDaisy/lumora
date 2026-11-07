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
import { Fonts, LumoraColors } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboarding-context';

export default function HomeScreen() {
  const { profile } = useOnboarding();
  const name = profile.preferredName || profile.firstName;

  return (
    <Page>
      <Brand compact />
      <Heading
        eyebrow="Your space"
        title={name ? `Good to have you here, ${name}.` : 'Good to have you here.'}
        description={profile.role ? `${profile.role} · A new day, one moment at a time.` : 'A new day, one moment at a time.'}
      />

      <Card style={styles.spaceCard}>
        <Text style={styles.cardEyebrow}>LUMORA SPACE</Text>
        <Text style={styles.spaceTitle}>{profile.spaceName || 'Your family, together.'}</Text>
        <Text style={styles.cardCopy}>
          A private place to keep what matters close and share it with the people you choose.
        </Text>
      </Card>

      {profile.completed ? (
        <Card style={styles.completeCard}>
          <Text style={styles.completeText}>Onboarding complete · Your demo is ready</Text>
        </Card>
      ) : null}

      <Card>
        <SectionLabel>Today&apos;s check-in</SectionLabel>
        <Text style={styles.cardCopy}>
          How are you feeling in this moment? Whatever the answer, there&apos;s room for it here.
        </Text>
      </Card>

      <View style={styles.quickActions}>
        <SectionLabel>Find your way</SectionLabel>
        <Link href="/lightbook" asChild>
          <ActionButton secondary>Open your Lightbook</ActionButton>
        </Link>
        <Link href="/timeline" asChild>
          <ActionButton secondary>View shared family timeline</ActionButton>
        </Link>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  spaceCard: {
    backgroundColor: '#F0E7F0',
    borderColor: '#E4D7E5',
  },
  cardEyebrow: {
    color: LumoraColors.primary,
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  spaceTitle: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.serif,
    fontSize: 23,
    fontWeight: '600',
  },
  cardCopy: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 23,
  },
  completeCard: {
    paddingVertical: 14,
    backgroundColor: '#EFF5F0',
    borderColor: '#D6E4D9',
  },
  completeText: {
    color: LumoraColors.success,
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  quickActions: {
    gap: 12,
  },
});
