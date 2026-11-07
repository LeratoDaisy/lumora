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

export default function HomeScreen() {
  return (
    <Page>
      <Brand compact />
      <Heading
        eyebrow="Your space"
        title="Good to have you here."
        description="A new day, one moment at a time."
      />

      <Card style={styles.spaceCard}>
        <Text style={styles.cardEyebrow}>LUMORA SPACE</Text>
        <Text style={styles.spaceTitle}>Your family, together.</Text>
        <Text style={styles.cardCopy}>
          A private place to keep what matters close and share it with the people you choose.
        </Text>
      </Card>

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
  quickActions: {
    gap: 12,
  },
});
