import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Heading, Page, SectionLabel } from '@/components/lumora-ui';
import { Fonts, LumoraColors } from '@/constants/theme';

type SharedMemory = {
  id: string;
  title: string;
  date: string;
  note: string;
};

const sharedMemories: SharedMemory[] = [];

export default function TimelineScreen() {
  const chronologicalMemories = [...sharedMemories].sort((a, b) =>
    Date.parse(a.date) - Date.parse(b.date),
  );

  return (
    <Page>
      <Heading
        title="Shared Family Timeline"
        description="A private collection of moments shared with your family."
      />
      <Card>
        <SectionLabel>Your shared moments</SectionLabel>
        {chronologicalMemories.length === 0 ? (
          <EmptyState
            title="Your family timeline starts here"
            description="When you choose to share a memory, it will appear here for your family."
          />
        ) : (
          chronologicalMemories.map((memory) => (
            <View key={memory.id} style={styles.memory}>
              <Text style={styles.date}>{memory.date}</Text>
              <Text style={styles.title}>{memory.title}</Text>
              <Text style={styles.note}>{memory.note}</Text>
            </View>
          ))
        )}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  memory: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: LumoraColors.border,
    gap: 6,
  },
  date: {
    color: LumoraColors.primary,
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.serif,
    fontSize: 20,
  },
  note: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
});
