import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Heading, Page, SectionLabel } from '@/components/lumora-ui';
import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';

export default function PrivacyScreen() {
  const styles = useThemedStyles(baseStyles);
  return (
    <Page>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹  Back</Text>
      </Pressable>
      <Heading
        title="Privacy & visibility"
        description="Your private moments stay private within Lumora."
      />

      <Card>
        <SectionLabel>Private</SectionLabel>
        <Text style={styles.copy}>Only you can view the item.</Text>
      </Card>

      <Card>
        <SectionLabel>Shared</SectionLabel>
        <Text style={styles.copy}>
          The item can appear in your Shared Family Timeline.
        </Text>
      </Card>

      <View style={styles.note}>
        <Text style={styles.copy}>
          Lumora is currently a prototype using local application state. These choices are applied within the app and are not database-level security.
        </Text>
      </View>
    </Page>
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
  copy: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 23,
  },
  note: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0E7F0',
  },
});
