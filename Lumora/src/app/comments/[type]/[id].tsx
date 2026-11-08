import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ActionButton, Card, EmptyState, Heading, Page } from '@/components/lumora-ui';
import { Fonts } from '@/constants/theme';
import { useLumoraColors, useThemedStyles } from '@/contexts/appearance-context';
import { makeContentId, useEngagement } from '@/contexts/engagement-context';
import { CheckInFeelingLabels, useCheckIns } from '@/contexts/check-in-context';
import { useMemories } from '@/contexts/memory-context';
import { useOnboarding } from '@/contexts/onboarding-context';
import { ScalePressable } from '@/components/scale-pressable';

function formatDate(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function CommentsScreen() {
  const styles = useThemedStyles(baseStyles);
  const colors = useLumoraColors();
  const { type: routeType, id: routeId } = useLocalSearchParams<{
    type?: string | string[];
    id?: string | string[];
  }>();
  const type = Array.isArray(routeType) ? routeType[0] : routeType;
  const id = Array.isArray(routeId) ? routeId[0] : routeId;
  const { memories, isLoaded: memoriesLoaded } = useMemories();
  const { checkIns, isLoaded: checkInsLoaded } = useCheckIns();
  const { profile } = useOnboarding();
  const { isLoaded, loadError, getComments, addComment, deleteComment } = useEngagement();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const memory = type === 'memory' ? memories.find((item) => item.id === id) : undefined;
  const checkIn = type === 'check-in' ? checkIns.find((item) => item.id === id) : undefined;
  const contentIsShared =
    memory?.visibility === 'shared' || checkIn?.visibility === 'shared';
  const contentId =
    id && (type === 'memory' || type === 'check-in') ? makeContentId(type, id) : '';
  const comments = contentId ? getComments(contentId) : [];
  const loading = !memoriesLoaded || !checkInsLoaded || !isLoaded;

  async function submitComment() {
    if (!contentId) return;
    setError('');
    setSaving(true);
    try {
      await addComment(contentId, text);
      setText('');
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn't add your comment. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(commentId: string) {
    Alert.alert('Delete this comment?', 'This comment will be removed from the shared conversation.', [
      { text: 'Keep comment', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteOwnComment(commentId);
        },
      },
    ]);
  }

  async function deleteOwnComment(commentId: string) {
    setError('');
    try {
      await deleteComment(commentId);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "We couldn't delete your comment. Please try again.",
      );
    }
  }

  const title = memory?.title ?? (checkIn ? CheckInFeelingLabels[checkIn.feeling] : '');
  const date = memory?.date ?? checkIn?.date;

  return (
    <Page>
      <ScalePressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>‹  Back</Text>
      </ScalePressable>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.copy}>Loading shared conversation…</Text>
        </View>
      ) : loadError ? (
        <Text style={[styles.error, { color: colors.error }]}>{loadError}</Text>
      ) : !contentIsShared ? (
        <EmptyState
          title="This shared moment is unavailable."
          description="Only shared memories and check-ins can have a conversation."
        />
      ) : (
        <>
          <Heading title="Comments" description="A quiet conversation around a shared moment." />
          <Card style={styles.contentCard}>
            <Text style={[styles.typeLabel, { color: colors.primary }]}>
              {memory ? 'Shared memory' : 'Shared daily check-in'}
            </Text>
            <Text style={styles.contentTitle}>{title}</Text>
            {memory?.caption ? <Text style={styles.copy}>{memory.caption}</Text> : null}
            {checkIn?.note ? <Text style={styles.copy}>{checkIn.note}</Text> : null}
            {date ? <Text style={styles.date}>{formatDate(date)}</Text> : null}
          </Card>

          <View style={styles.commentList}>
            {comments.length === 0 ? (
              <Text style={styles.copy}>No comments yet. Share a few words if you would like.</Text>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.author}>
                      {comment.userId === profile.userId
                        ? profile.preferredName || profile.firstName || 'You'
                        : 'A family member'}
                    </Text>
                    <Text style={styles.date}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.copy}>{comment.text}</Text>
                  {comment.userId === profile.userId ? (
                    <ScalePressable
                      accessibilityRole="button"
                      onPress={() => confirmDelete(comment.id)}
                      style={styles.deleteButton}>
                      <Text style={[styles.deleteText, { color: colors.error }]}>Delete</Text>
                    </ScalePressable>
                  ) : null}
                </Card>
              ))
            )}
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Add a comment</Text>
            <TextInput
              accessibilityLabel="Add a comment"
              value={text}
              onChangeText={(value) => {
                setText(value);
                setError('');
              }}
              placeholder="Write a few words…"
              placeholderTextColor={colors.secondaryText}
              maxLength={500}
              multiline
              textAlignVertical="top"
              style={[styles.input, { color: colors.primaryText }]}
            />
            {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
            <ActionButton onPress={() => void submitComment()} disabled={saving || !text.trim()}>
              {saving ? 'Posting…' : 'Post comment'}
            </ActionButton>
          </View>
        </>
      )}
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
  loading: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  contentCard: {
    padding: 16,
  },
  typeLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  contentTitle: {
    color: '#2E2830',
    fontFamily: Fonts.serif,
    fontSize: 21,
    lineHeight: 28,
  },
  commentList: {
    gap: 12,
  },
  commentCard: {
    padding: 16,
  },
  commentHeader: {
    gap: 4,
  },
  author: {
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  copy: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  date: {
    color: '#6E6670',
    fontFamily: Fonts.sans,
    fontSize: 12,
  },
  deleteButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  deleteText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  form: {
    gap: 12,
  },
  label: {
    color: '#2E2830',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 96,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E9DFE8',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  error: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 20,
  },
});
