import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

export type UserRole = 'Patient' | 'Family Member' | 'Caregiver';
export type IllnessCategory = 'Cancer' | 'Chronic illness' | 'Other' | 'Prefer not to say';

export type OnboardingProfile = {
  firstName: string;
  preferredName: string;
  role: UserRole | null;
  illnessCategory: IllnessCategory;
  spaceName: string;
  completed: boolean;
};

type OnboardingContextValue = {
  profile: OnboardingProfile;
  isLoaded: boolean;
  loadError: string | null;
  saveProfile: (patch: Partial<OnboardingProfile>) => Promise<void>;
  clearProfile: () => Promise<void>;
};

const STORAGE_KEY = 'lumora.onboarding.v1';
const INITIAL_PROFILE: OnboardingProfile = {
  firstName: '',
  preferredName: '',
  role: null,
  illnessCategory: 'Prefer not to say',
  spaceName: '',
  completed: false,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

function isStoredProfile(value: unknown): value is OnboardingProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Record<string, unknown>;
  return (
    typeof profile.firstName === 'string' &&
    typeof profile.preferredName === 'string' &&
    (profile.role === null ||
      profile.role === 'Patient' ||
      profile.role === 'Family Member' ||
      profile.role === 'Caregiver') &&
    (profile.illnessCategory === 'Cancer' ||
      profile.illnessCategory === 'Chronic illness' ||
      profile.illnessCategory === 'Other' ||
      profile.illnessCategory === 'Prefer not to say') &&
    typeof profile.spaceName === 'string' &&
    typeof profile.completed === 'boolean' &&
    (!profile.completed ||
      (typeof profile.role === 'string' &&
        profile.firstName.trim().length > 0 &&
        profile.spaceName.trim().length > 0))
  );
}

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (!isStoredProfile(parsed)) {
            throw new Error('Saved onboarding details are not in a recognized format.');
          }
          if (active) setProfile(parsed);
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? `We couldn't restore your saved demo details. ${error.message}`
              : "We couldn't restore your saved demo details.",
          );
        }
      } finally {
        if (active) setIsLoaded(true);
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const saveProfile = useCallback(
    async (patch: Partial<OnboardingProfile>) => {
      if (!isLoaded) throw new Error('Please wait for your saved details to load, then try again.');
      const nextProfile = { ...profile, ...patch };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
      setProfile(nextProfile);
      setLoadError(null);
    },
    [profile, isLoaded],
  );

  const clearProfile = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setProfile(INITIAL_PROFILE);
    setLoadError(null);
  }, []);

  const value = useMemo(
    () => ({ profile, isLoaded, loadError, saveProfile, clearProfile }),
    [profile, isLoaded, loadError, saveProfile, clearProfile],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider.');
  }
  return context;
}
