import { Link } from 'expo-router';
import { Text } from 'react-native';

import { ActionButton, Card, EmptyState, Heading, Page, SectionLabel } from '@/components/lumora-ui';
import { Fonts, LumoraColors } from '@/constants/theme';
import { useOnboarding } from '@/contexts/onboarding-context';

type Memory = {
  id: string;
  title: string;
  date: string;
  shared: boolean;
};

const memories: Memory[] = [];

export default function LightbookScreen() {
  const { profile } = useOnboarding();
  const privateMemories = memories.filter((memory) => !memory.shared);

  return (
    <Page>
      <Heading
        title="Lightbook"
        description="A private place for the moments, stories, and little things you want to remember."
      />

      <Card>
        <SectionLabel>Private memories</SectionLabel>
        <Text style={styles.note}>
          Only you can see these until you choose to share them.
        </Text>
        {privateMemories.length === 0 ? (
          <>
            <EmptyState
              title="Your memories will find a home here"
              description="Keep a moment, a story, or anything you would like to hold on to."
            />
            {profile.role === 'Caregiver' ? (
              <Text style={styles.note}>
                Caregiver access is invited-only. Memory creation is not available for this role.
              </Text>
            ) : (
              <ActionButton>Create a memory</ActionButton>
            )}
          </>
        ) : (
          privateMemories.map((memory) => (
            <Card key={memory.id}>
              <Text style={styles.memoryTitle}>{memory.title}</Text>
              <Text style={styles.note}>{memory.date} · Private</Text>
            </Card>
          ))
        )}
      </Card>

      <Card>
        <SectionLabel>Shared with family</SectionLabel>
        <Text style={styles.note}>
          Moments you choose to share are kept on your private family timeline.
        </Text>
        <Link href="/timeline" asChild>
          <ActionButton secondary>View family timeline</ActionButton>
        </Link>
      </Card>
    </Page>
  );
}

const styles = {
  note: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  memoryTitle: {
    color: LumoraColors.primaryText,
    fontFamily: Fonts.serif,
    fontSize: 20,
  },
};
