import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { useCheckIns } from '@/contexts/check-in-context';
import { useMemories } from '@/contexts/memory-context';
import { useOnboarding } from '@/contexts/onboarding-context';

export type ReactionType = 'love' | 'laugh' | 'care' | 'support';
export type SharedContentType = 'memory' | 'check-in';

export type Reaction = {
  id: string;
  contentId: string;
  userId: string;
  type: ReactionType;
  createdAt: string;
};

export type Comment = {
  id: string;
  contentId: string;
  userId: string;
  text: string;
  createdAt: string;
};

type EngagementState = {
  reactions: Reaction[];
  comments: Comment[];
};

type EngagementContextValue = EngagementState & {
  isLoaded: boolean;
  loadError: string | null;
  getReactions: (contentId: string) => Reaction[];
  getComments: (contentId: string) => Comment[];
  setReaction: (contentId: string, type: ReactionType) => Promise<void>;
  addComment: (contentId: string, text: string) => Promise<Comment>;
  deleteComment: (commentId: string) => Promise<void>;
};

const STORAGE_KEY = 'lumora.engagement.v1';
const REACTION_TYPES: ReactionType[] = ['love', 'laugh', 'care', 'support'];
const EMPTY_ENGAGEMENT: EngagementState = { reactions: [], comments: [] };

const EngagementContext = createContext<EngagementContextValue | null>(null);

function isReaction(value: unknown): value is Reaction {
  if (!value || typeof value !== 'object') return false;
  const reaction = value as Record<string, unknown>;
  return (
    typeof reaction.id === 'string' &&
    typeof reaction.contentId === 'string' &&
    typeof reaction.userId === 'string' &&
    typeof reaction.type === 'string' &&
    REACTION_TYPES.includes(reaction.type as ReactionType) &&
    typeof reaction.createdAt === 'string'
  );
}

function isComment(value: unknown): value is Comment {
  if (!value || typeof value !== 'object') return false;
  const comment = value as Record<string, unknown>;
  return (
    typeof comment.id === 'string' &&
    typeof comment.contentId === 'string' &&
    typeof comment.userId === 'string' &&
    typeof comment.text === 'string' &&
    typeof comment.createdAt === 'string'
  );
}

function isEngagementState(value: unknown): value is EngagementState {
  if (!value || typeof value !== 'object') return false;
  const state = value as Record<string, unknown>;
  return (
    Array.isArray(state.reactions) &&
    state.reactions.every(isReaction) &&
    Array.isArray(state.comments) &&
    state.comments.every(isComment)
  );
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeContentId(type: SharedContentType, id: string) {
  return `${type}:${id}`;
}

export function EngagementProvider({ children }: PropsWithChildren) {
  const { profile } = useOnboarding();
  const { memories } = useMemories();
  const { checkIns } = useCheckIns();
  const [engagement, setEngagement] = useState<EngagementState>(EMPTY_ENGAGEMENT);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const engagementRef = useRef<EngagementState>(EMPTY_ENGAGEMENT);
  const operationQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;

    async function loadEngagement() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (!isEngagementState(parsed)) {
            throw new Error('Saved reactions and comments are not in a recognized format.');
          }
          if (active) {
            engagementRef.current = parsed;
            setEngagement(parsed);
          }
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? `We couldn't restore saved reactions and comments. ${error.message}`
              : "We couldn't restore saved reactions and comments.",
          );
        }
      } finally {
        if (active) setIsLoaded(true);
      }
    }

    void loadEngagement();
    return () => {
      active = false;
    };
  }, []);

  const isSharedContent = useCallback(
    (contentId: string) => {
      const separator = contentId.indexOf(':');
      if (separator < 0) return false;
      const type = contentId.slice(0, separator);
      const id = contentId.slice(separator + 1);
      if (type === 'memory') {
        return memories.some((memory) => memory.id === id && memory.visibility === 'shared');
      }
      if (type === 'check-in') {
        return checkIns.some((checkIn) => checkIn.id === id && checkIn.visibility === 'shared');
      }
      return false;
    },
    [checkIns, memories],
  );

  const persist = useCallback((update: (current: EngagementState) => EngagementState) => {
    const operation = operationQueue.current.then(async () => {
      const next = update(engagementRef.current);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      engagementRef.current = next;
      setEngagement(next);
      setLoadError(null);
    });
    operationQueue.current = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }, []);

  const setReaction = useCallback(
    async (contentId: string, type: ReactionType) => {
      if (!isLoaded) throw new Error('Please wait for shared content to load, then try again.');
      if (!isSharedContent(contentId)) {
        throw new Error('Reactions are available only on shared content.');
      }
      await persist((current) => {
        const existing = current.reactions.find(
          (reaction) => reaction.contentId === contentId && reaction.userId === profile.userId,
        );
        const reactions = existing
          ? existing.type === type
            ? current.reactions.filter((reaction) => reaction.id !== existing.id)
            : current.reactions.map((reaction) =>
                reaction.id === existing.id
                  ? { ...reaction, type, createdAt: new Date().toISOString() }
                  : reaction,
              )
          : [
              ...current.reactions,
              {
                id: createId(),
                contentId,
                userId: profile.userId,
                type,
                createdAt: new Date().toISOString(),
              },
            ];
        return { ...current, reactions };
      });
    },
    [isLoaded, isSharedContent, persist, profile.userId],
  );

  const addComment = useCallback(
    async (contentId: string, text: string) => {
      if (!isLoaded) throw new Error('Please wait for shared content to load, then try again.');
      if (!isSharedContent(contentId)) {
        throw new Error('Comments are available only on shared content.');
      }
      const trimmedText = text.trim();
      if (!trimmedText) throw new Error('Write a comment before posting.');
      if (trimmedText.length > 500) throw new Error('Comments must be 500 characters or fewer.');
      const comment: Comment = {
        id: createId(),
        contentId,
        userId: profile.userId,
        text: trimmedText,
        createdAt: new Date().toISOString(),
      };
      await persist((current) => ({
        ...current,
        comments: [...current.comments, comment],
      }));
      return comment;
    },
    [isLoaded, isSharedContent, persist, profile.userId],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!isLoaded) throw new Error('Please wait for shared content to load, then try again.');
      await persist((current) => {
        const existing = current.comments.find((comment) => comment.id === commentId);
        if (!existing || existing.userId !== profile.userId) {
          throw new Error("You can't delete this comment.");
        }
        return {
          ...current,
          comments: current.comments.filter((comment) => comment.id !== commentId),
        };
      });
    },
    [isLoaded, persist, profile.userId],
  );

  const getReactions = useCallback(
    (contentId: string) => engagement.reactions.filter((reaction) => reaction.contentId === contentId),
    [engagement.reactions],
  );
  const getComments = useCallback(
    (contentId: string) => engagement.comments.filter((comment) => comment.contentId === contentId),
    [engagement.comments],
  );

  const value = useMemo(
    () => ({
      ...engagement,
      isLoaded,
      loadError,
      getReactions,
      getComments,
      setReaction,
      addComment,
      deleteComment,
    }),
    [engagement, isLoaded, loadError, getReactions, getComments, setReaction, addComment, deleteComment],
  );

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>;
}

export function useEngagement() {
  const context = useContext(EngagementContext);
  if (!context) throw new Error('useEngagement must be used within an EngagementProvider.');
  return context;
}

export const reactionOptions: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'laugh', emoji: '😂', label: 'Laugh' },
  { type: 'care', emoji: '🤍', label: 'Care' },
  { type: 'support', emoji: '🙏', label: 'Support' },
];
