import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  makeContentId,
  reactionOptions,
  useEngagement,
  type SharedContentType,
} from '@/contexts/engagement-context';
import { useOnboarding } from '@/contexts/onboarding-context';
import { Fonts } from '@/constants/theme';
import { useLumoraColors, useThemedStyles } from '@/contexts/appearance-context';
import { ScalePressable } from '@/components/scale-pressable';

export function SharedEngagement({
  type,
  id,
}: {
  type: SharedContentType;
  id: string;
}) {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  const { profile } = useOnboarding();
  const { getReactions, setReaction, isLoaded, loadError } = useEngagement();
  const [error, setError] = useState('');
  const contentId = makeContentId(type, id);
  const reactions = getReactions(contentId);
  const myReaction = reactions.find((reaction) => reaction.userId === profile.userId);
  const visibleReactionTypes = [...new Set(reactions.map((reaction) => reaction.type))];

  async function toggleReaction(reactionType: (typeof reactionOptions)[number]['type']) {
    setError('');
    try {
      await setReaction(contentId, reactionType);
    } catch (reactionError) {
      setError(
        reactionError instanceof Error
          ? reactionError.message
          : "We couldn't save your reaction. Please try again.",
      );
    }
  }

  return (
    <View style={styles.container}>
      {visibleReactionTypes.length > 0 ? (
        <View accessibilityLabel="Reactions from your family" style={styles.reactionDisplay}>
          {visibleReactionTypes.map((reactionType) => (
            <Text key={reactionType} style={styles.emoji}>
              {reactionOptions.find((option) => option.type === reactionType)?.emoji}
            </Text>
          ))}
        </View>
      ) : null}
      <View style={styles.reactions} accessibilityLabel="Reactions">
        {reactionOptions.map((option) => (
          <ScalePressable
            key={option.type}
            accessibilityRole="button"
            accessibilityLabel={`${option.label}${myReaction?.type === option.type ? ', selected' : ''}`}
            accessibilityState={{ selected: myReaction?.type === option.type }}
            disabled={!isLoaded}
            onPress={() => void toggleReaction(option.type)}
            scaleTo={0.98}
            style={[
              styles.reactionButton,
              myReaction?.type === option.type && {
                backgroundColor: colors.selectedSurface,
                borderColor: colors.primary,
              },
              !isLoaded && styles.disabled,
            ]}>
            <Text style={styles.emoji}>{option.emoji}</Text>
          </ScalePressable>
        ))}
      </View>
      <ScalePressable
        accessibilityRole="button"
        disabled={!isLoaded}
        onPress={() =>
          router.push({
            pathname: '/comments/[type]/[id]',
            params: { type, id },
          })
        }
        style={[
          styles.commentsButton,
          !isLoaded && styles.disabled,
        ]}>
        <Text style={styles.commentsText}>Comments</Text>
      </ScalePressable>
      {loadError ? <Text style={[styles.error, { color: colors.error }]}>{loadError}</Text> : null}
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const baseStyles = StyleSheet.create({
  container: {
    gap: 8,
  },
  reactions: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9DFE8',
    borderRadius: 12,
    backgroundColor: '#FFF8F0',
  },
  emoji: {
    fontSize: 18,
  },
  commentsButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  commentsText: {
    color: '#8A6A96',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  error: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  disabled: {
    opacity: 0.55,
  },
});
