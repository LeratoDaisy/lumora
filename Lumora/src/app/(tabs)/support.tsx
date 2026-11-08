import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionButton, Card, Heading, Page, SectionLabel } from '@/components/lumora-ui';
import { Fonts } from '@/constants/theme';
import { useLumoraColors, useThemedStyles } from '@/contexts/appearance-context';
import { useOnboarding, type UserRole } from '@/contexts/onboarding-context';

const guidance: Record<UserRole, { title: string; message: string }[]> = {
  Patient: [
    {
      title: 'Be gentle with yourself',
      message:
        'It is okay to have difficult days. Rest, take things one moment at a time, and give yourself permission not to have everything figured out.',
    },
    {
      title: 'Stay connected',
      message:
        'Reach out to someone you trust when you want company, encouragement, or simply someone to listen.',
    },
    {
      title: 'Make space for small moments',
      message:
        'A meaningful day does not have to be a big day. Music, conversation, a favourite meal, or a quiet moment can matter.',
    },
  ],
  'Family Member': [
    {
      title: 'Listen before solving',
      message:
        'Sometimes being present and listening is more helpful than trying to find the perfect answer.',
    },
    {
      title: 'Look after yourself too',
      message:
        'Supporting someone can be emotionally demanding. Make space for your own rest and wellbeing.',
    },
    {
      title: 'Celebrate ordinary moments',
      message: 'Small shared experiences can become meaningful memories.',
    },
  ],
  Caregiver: [
    {
      title: 'Take care of your own wellbeing',
      message:
        'Supporting someone else can be demanding. Make time for rest and personal wellbeing where possible.',
    },
    {
      title: 'Communicate clearly',
      message:
        "Keep communication respectful, clear, and centred on the person's preferences.",
    },
    {
      title: 'Respect boundaries',
      message:
        'Only access and share information that you have been invited and permitted to access.',
    },
  ],
};

const copingSuggestions = [
  'Take a few slow breaths.',
  "Write down what you're feeling.",
  'Listen to something comforting.',
  'Spend a few quiet minutes with someone you trust.',
  'Step away and rest when you need to.',
];

const books = [
  {
    title: 'When Breath Becomes Air',
    author: 'Paul Kalanithi',
    description:
      'A memoir reflecting on identity, meaning, and relationships through a life-changing experience.',
    url: 'https://books.google.com/books?vid=ISBN9780812988406',
  },
  {
    title: 'The Bright Hour',
    author: 'Nina Riggs',
    description:
      'A personal memoir about family, ordinary life, and finding meaning in difficult seasons.',
    url: 'https://www.simonandschuster.com/books/The-Bright-Hour/Nina-Riggs/9781501157214',
  },
  {
    title: 'Being Mortal',
    author: 'Atul Gawande',
    description:
      'An exploration of dignity, choice, and what matters to people and families through serious illness and aging.',
    url: 'https://us.macmillan.com/books/9781250076229/beingmortal/',
  },
];

const videos = [
  {
    title: 'Cancer Research UK video library',
    description: 'Patient and family stories, experiences, and supportive information.',
    url: 'https://www.youtube.com/@CancerResearchUK/videos',
  },
  {
    title: 'TED talks on difficult conversations',
    description: 'Talks exploring empathy, listening, and communicating through hard moments.',
    url: 'https://www.youtube.com/@TED/search?query=empathy%20communication',
  },
];

export default function SupportScreen() {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  const { profile } = useOnboarding();
  const roleGuidance = profile.role ? guidance[profile.role] : [];
  const [openingUrl, setOpeningUrl] = useState('');
  const [resourceError, setResourceError] = useState('');

  async function openResource(url: string) {
    setResourceError('');
    setOpeningUrl(url);
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      setResourceError(
        error instanceof Error
          ? `We couldn't open that resource. ${error.message}`
          : "We couldn't open that resource. Please try again.",
      );
    } finally {
      setOpeningUrl('');
    }
  }

  return (
    <Page>
      <Heading
        title="Support & Coping"
        description="Some days feel lighter than others. Lumora offers gentle guidance for navigating the moments in between."
      />

      {roleGuidance.length > 0 ? (
        <View style={styles.section}>
          <SectionLabel>For you</SectionLabel>
          {roleGuidance.map((item) => (
            <Card key={item.title} style={styles.guidanceCard}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.message}>{item.message}</Text>
            </Card>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionLabel>Try something gentle</SectionLabel>
        <Card style={styles.copingCard}>
          {copingSuggestions.map((suggestion) => (
            <View key={suggestion} style={styles.suggestion}>
              <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
              <Text style={styles.message}>{suggestion}</Text>
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionLabel>Helpful resources</SectionLabel>
        <Text style={styles.groupLabel}>BOOKS</Text>
        {books.map((book) => (
          <Card key={book.title} style={styles.resourceCard}>
            <Text style={styles.cardTitle}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
            <Text style={styles.message}>{book.description}</Text>
            <ActionButton
              secondary
              onPress={() => void openResource(book.url)}
              disabled={openingUrl === book.url}>
              {openingUrl === book.url ? 'Opening…' : 'Learn more'}
            </ActionButton>
          </Card>
        ))}

        <Text style={styles.groupLabel}>VIDEO & YOUTUBE</Text>
        {videos.map((video) => (
          <Card key={video.title} style={styles.resourceCard}>
            <Text style={styles.cardTitle}>{video.title}</Text>
            <Text style={styles.message}>{video.description}</Text>
            <ActionButton
              secondary
              onPress={() => void openResource(video.url)}
              disabled={openingUrl === video.url}>
              {openingUrl === video.url ? 'Opening…' : 'Watch videos'}
            </ActionButton>
          </Card>
        ))}
        {resourceError ? (
          <Text style={[styles.error, { color: colors.error }]}>{resourceError}</Text>
        ) : null}
        <Text style={styles.disclaimer}>
          These resources are for general support and education and are not a substitute for professional medical advice.
        </Text>
      </View>

      <Text style={styles.disclaimer}>
        Lumora offers general wellbeing suggestions, not medical treatment or healthcare services.
      </Text>
    </Page>
  );
}

const baseStyles = StyleSheet.create({
  section: {
    gap: 12,
  },
  guidanceCard: {
    padding: 16,
  },
  cardTitle: {
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
  },
  author: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontStyle: 'italic',
  },
  message: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    flexShrink: 1,
  },
  copingCard: {
    padding: 16,
    gap: 14,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    lineHeight: 21,
  },
  groupLabel: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  resourceCard: {
    padding: 16,
  },
  disclaimer: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
