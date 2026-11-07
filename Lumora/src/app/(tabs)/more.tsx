import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, Heading, Page } from '@/components/lumora-ui';
import { Fonts, LumoraColors } from '@/constants/theme';

const details = [
  { title: 'Profile', description: 'Your personal details' },
  { title: 'Role', description: 'Choose Patient, Family Member, or Caregiver' },
  { title: 'Lumora Space', description: 'Your private family space' },
  { title: 'Privacy', description: 'Your memories, shared on your terms' },
  { title: 'Settings', description: 'App preferences' },
];

export default function MoreScreen() {
  return (
    <Page>
      <Heading title="More" description="Your space, just the way you need it." />
      <View style={styles.list}>
        {details.map((item) => (
          <Card key={item.title} style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </Card>
        ))}
      </View>
      <Link href="/" asChild>
        <ActionButton secondary>Sign out</ActionButton>
      </Link>
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
});
