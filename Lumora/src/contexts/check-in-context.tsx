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

export type CheckInFeeling =
  | 'okay'
  | 'good_day'
  | 'struggling'
  | 'need_rest'
  | 'prefer_not_to_say';

export type CheckInVisibility = 'private' | 'shared';

export type CheckIn = {
  id: string;
  creatorId: string;
  feeling: CheckInFeeling;
  note: string;
  visibility: CheckInVisibility;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type CheckInInput = Pick<CheckIn, 'feeling' | 'note' | 'visibility'>;

type CheckInContextValue = {
  checkIns: CheckIn[];
  isLoaded: boolean;
  loadError: string | null;
  saveTodayCheckIn: (input: CheckInInput) => Promise<CheckIn>;
};

const STORAGE_KEY = 'lumora.check-ins.v1';
const FEELINGS: CheckInFeeling[] = [
  'okay',
  'good_day',
  'struggling',
  'need_rest',
  'prefer_not_to_say',
];

const CheckInContext = createContext<CheckInContextValue | null>(null);

function isCheckIn(value: unknown): value is CheckIn {
  if (!value || typeof value !== 'object') return false;
  const checkIn = value as Record<string, unknown>;
  return (
    typeof checkIn.id === 'string' &&
    typeof checkIn.creatorId === 'string' &&
    typeof checkIn.feeling === 'string' &&
    FEELINGS.includes(checkIn.feeling as CheckInFeeling) &&
    typeof checkIn.note === 'string' &&
    (checkIn.visibility === 'private' || checkIn.visibility === 'shared') &&
    typeof checkIn.date === 'string' &&
    typeof checkIn.createdAt === 'string' &&
    typeof checkIn.updatedAt === 'string'
  );
}

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CheckInProvider({ children }: PropsWithChildren) {
  const { profile } = useOnboarding();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const checkInsRef = useRef<CheckIn[]>([]);
  const operationQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;

    async function loadCheckIns() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (!Array.isArray(parsed) || !parsed.every(isCheckIn)) {
            throw new Error('Saved check-ins are not in a recognized format.');
          }
          if (active) {
            checkInsRef.current = parsed;
            setCheckIns(parsed);
          }
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? `We couldn't restore your saved check-ins. ${error.message}`
              : "We couldn't restore your saved check-ins.",
          );
        }
      } finally {
        if (active) setIsLoaded(true);
      }
    }

    void loadCheckIns();
    return () => {
      active = false;
    };
  }, []);

  const saveTodayCheckIn = useCallback(
    async (input: CheckInInput) => {
      if (!isLoaded) throw new Error('Please wait for your saved check-ins to load, then try again.');
      const date = getLocalDateString();
      const existing = checkInsRef.current.find(
        (checkIn) => checkIn.creatorId === profile.userId && checkIn.date === date,
      );
      const timestamp = new Date().toISOString();
      const checkIn: CheckIn = existing
        ? { ...existing, ...input, updatedAt: timestamp }
        : {
            ...input,
            id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            creatorId: profile.userId,
            date,
            createdAt: timestamp,
            updatedAt: timestamp,
          };
      const nextCheckIns = existing
        ? checkInsRef.current.map((item) => (item.id === existing.id ? checkIn : item))
        : [checkIn, ...checkInsRef.current];

      const operation = operationQueue.current.then(async () => {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextCheckIns));
        checkInsRef.current = nextCheckIns;
        setCheckIns(nextCheckIns);
        setLoadError(null);
      });
      operationQueue.current = operation.then(
        () => undefined,
        () => undefined,
      );
      await operation;
      return checkIn;
    },
    [isLoaded, profile.userId],
  );

  const value = useMemo(
    () => ({ checkIns, isLoaded, loadError, saveTodayCheckIn }),
    [checkIns, isLoaded, loadError, saveTodayCheckIn],
  );

  return <CheckInContext.Provider value={value}>{children}</CheckInContext.Provider>;
}

export function useCheckIns() {
  const context = useContext(CheckInContext);
  if (!context) throw new Error('useCheckIns must be used within a CheckInProvider.');
  return context;
}

export const CheckInFeelingLabels: Record<CheckInFeeling, string> = {
  okay: "I'm okay",
  good_day: "I'm having a good day",
  struggling: "I'm struggling",
  need_rest: 'I need rest',
  prefer_not_to_say: "I'd rather not say",
};
