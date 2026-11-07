import { Text } from 'react-native';

import { Card, Heading, Page, SectionLabel } from '@/components/lumora-ui';
import { Fonts, LumoraColors } from '@/constants/theme';

const guidance = [
  {
    role: 'Patient',
    message:
      'Take things one moment at a time. You do not have to have all the answers today, and it is okay to make space for how you feel.',
  },
  {
    role: 'Family Member',
    message:
      'Ask what kind of support feels helpful before stepping in. A listening ear and being present can mean a lot.',
  },
  {
    role: 'Caregiver',
    message:
      'Your needs matter, too. Let someone you trust know one practical way they can support you this week.',
  },
];

export default function SupportScreen() {
  return (
    <Page>
      <Heading
        title="Support & Coping"
        description="Gentle reminders for the different ways you may be showing up today."
      />
      {guidance.map((item) => (
        <Card key={item.role}>
          <SectionLabel>{item.role}</SectionLabel>
          <Text style={styles.message}>{item.message}</Text>
        </Card>
      ))}
    </Page>
  );
}

const styles = {
  message: {
    color: LumoraColors.secondaryText,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 24,
  },
};
