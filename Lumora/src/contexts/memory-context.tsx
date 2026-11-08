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

import { useOnboarding } from '@/contexts/onboarding-context';

export type MemoryVisibility = 'private' | 'shared';

export type Memory = {
  id: string;
  creatorId: string;
  title: string;
  caption: string;
  imageUri: string | null;
  occasion: string;
  date: string;
  location: string;
  visibility: MemoryVisibility;
  createdAt: string;
  updatedAt: string;
};

export type MemoryInput = Omit<Memory, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>;

type MemoryContextValue = {
  memories: Memory[];
  isLoaded: boolean;
  loadError: string | null;
  createMemory: (input: MemoryInput) => Promise<Memory>;
  updateMemory: (id: string, input: MemoryInput) => Promise<void>;
  deleteMemory: (id: string) => Promise<void>;
};

const STORAGE_KEY = 'lumora.memories.v1';

const MemoryContext = createContext<MemoryContextValue | null>(null);

function isMemory(value: unknown): value is Memory {
  if (!value || typeof value !== 'object') return false;
  const memory = value as Record<string, unknown>;
  return (
    typeof memory.id === 'string' &&
    typeof memory.creatorId === 'string' &&
    typeof memory.title === 'string' &&
    typeof memory.caption === 'string' &&
    (typeof memory.imageUri === 'string' || memory.imageUri === null) &&
    typeof memory.occasion === 'string' &&
    typeof memory.date === 'string' &&
    typeof memory.location === 'string' &&
    (memory.visibility === 'private' || memory.visibility === 'shared') &&
    typeof memory.createdAt === 'string' &&
    typeof memory.updatedAt === 'string'
  );
}

export function MemoryProvider({ children }: PropsWithChildren) {
  const { profile } = useOnboarding();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const memoriesRef = useRef<Memory[]>([]);
  const operationQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;

    async function loadMemories() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (!Array.isArray(parsed) || !parsed.every(isMemory)) {
            throw new Error('Saved memories are not in a recognized format.');
          }
          if (active) {
            memoriesRef.current = parsed;
            setMemories(parsed);
          }
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? `We couldn't restore your saved memories. ${error.message}`
              : "We couldn't restore your saved memories.",
          );
        }
      } finally {
        if (active) setIsLoaded(true);
      }
    }

    void loadMemories();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((nextMemories: Memory[]) => {
    const operation = operationQueue.current.then(async () => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextMemories));
      memoriesRef.current = nextMemories;
      setMemories(nextMemories);
      setLoadError(null);
    });
    operationQueue.current = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }, []);

  const createMemory = useCallback(
    async (input: MemoryInput) => {
      if (!isLoaded) throw new Error('Please wait for your saved memories to load, then try again.');
      const timestamp = new Date().toISOString();
      const memory: Memory = {
        ...input,
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        creatorId: profile.userId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await persist([memory, ...memoriesRef.current]);
      return memory;
    },
    [isLoaded, persist, profile.userId],
  );

  const updateMemory = useCallback(
    async (id: string, input: MemoryInput) => {
      if (!isLoaded) throw new Error('Please wait for your saved memories to load, then try again.');
      const existing = memoriesRef.current.find((memory) => memory.id === id);
      if (!existing || existing.creatorId !== profile.userId) {
        throw new Error("You can't edit this memory.");
      }
      const updated: Memory = { ...existing, ...input, updatedAt: new Date().toISOString() };
      await persist(memoriesRef.current.map((memory) => (memory.id === id ? updated : memory)));
    },
    [isLoaded, persist, profile.userId],
  );

  const deleteMemory = useCallback(
    async (id: string) => {
      if (!isLoaded) throw new Error('Please wait for your saved memories to load, then try again.');
      const existing = memoriesRef.current.find((memory) => memory.id === id);
      if (!existing || existing.creatorId !== profile.userId) {
        throw new Error("You can't delete this memory.");
      }
      await persist(memoriesRef.current.filter((memory) => memory.id !== id));
    },
    [isLoaded, persist, profile.userId],
  );

  const value = useMemo(
    () => ({ memories, isLoaded, loadError, createMemory, updateMemory, deleteMemory }),
    [memories, isLoaded, loadError, createMemory, updateMemory, deleteMemory],
  );

  return <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>;
}

export function useMemories() {
  const context = useContext(MemoryContext);
  if (!context) throw new Error('useMemories must be used within a MemoryProvider.');
  return context;
}
