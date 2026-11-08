import { router } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/lumora-ui';
import { ScalePressable } from '@/components/scale-pressable';
import { Fonts } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/appearance-context';
import type { Memory } from '@/contexts/memory-context';

export function formatMemoryDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function MemoryCard({
  memory,
  typeLabel,
}: {
  memory: Memory;
  typeLabel?: string;
}) {
  const styles = useThemedStyles(baseStyles);
  return (
    <ScalePressable
      accessibilityRole="button"
      accessibilityLabel={`View memory: ${memory.title}`}
      onPress={() => router.push({ pathname: '/memory/[id]', params: { id: memory.id } })}
      scaleTo={0.98}>
      <Card style={styles.card}>
        {memory.imageUri ? (
          <Image source={{ uri: memory.imageUri }} style={styles.image} resizeMode="cover" />
        ) : null}
        <View style={styles.content}>
          <View style={styles.badges}>
            <Text style={styles.privacy}>
              {memory.visibility === 'private' ? 'Private' : 'Shared'}
            </Text>
            {typeLabel ? <Text style={styles.occasion}>{typeLabel}</Text> : null}
            {memory.occasion ? <Text style={styles.occasion}>{memory.occasion}</Text> : null}
          </View>
          <Text style={styles.title}>{memory.title}</Text>
          <Text style={styles.privacyDescription}>
            {memory.visibility === 'private'
              ? 'Only you can view this.'
              : 'This moment can appear in your Shared Family Timeline.'}
          </Text>
          {memory.caption ? (
            <Text style={styles.caption} numberOfLines={3}>{memory.caption}</Text>
          ) : null}
          <Text style={styles.date}>{formatMemoryDate(memory.date)}</Text>
        </View>
      </Card>
    </ScalePressable>
  );
}

const baseStyles = StyleSheet.create({
  card: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 190,
    backgroundColor: '#F0E7F0',
  },
  content: {
    padding: 16,
    gap: 8,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  privacy: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
  },
  privacyDescription: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 18,
  },
  occasion: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
  title: {
    color: '#2E2830',
    fontFamily: Fonts.serif,
    fontSize: 22,
  },
  caption: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  date: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
});
