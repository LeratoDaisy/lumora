import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
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
import { useColorScheme } from 'react-native';

import {
  DarkLumoraColors,
  LightLumoraColors,
  type LumoraPalette,
} from '@/constants/theme';

export type AppearancePreference = 'light' | 'dark' | 'system';
export type ResolvedAppearance = 'light' | 'dark';

type AppearanceContextValue = {
  appearance: AppearancePreference;
  resolvedAppearance: ResolvedAppearance;
  colors: LumoraPalette;
  isLoaded: boolean;
  error: string | null;
  setAppearance: (value: AppearancePreference) => Promise<void>;
};

const STORAGE_KEY = 'lumora.appearance.v1';
const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function isAppearancePreference(value: unknown): value is AppearancePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function AppearanceProvider({ children }: PropsWithChildren) {
  const systemAppearance = useColorScheme();
  const [appearance, setAppearanceState] = useState<AppearancePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appearanceOperations = useRef<Promise<void>>(Promise.resolve());
  const resolvedAppearance: ResolvedAppearance =
    appearance === 'system' ? (systemAppearance === 'dark' ? 'dark' : 'light') : appearance;
  const colors = resolvedAppearance === 'dark' ? DarkLumoraColors : LightLumoraColors;

  useEffect(() => {
    let active = true;
    async function loadAppearance() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (!isAppearancePreference(parsed)) {
            throw new Error('Saved appearance preference is not recognized.');
          }
          if (active) setAppearanceState(parsed);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? `We couldn't restore your appearance preference. ${loadError.message}`
              : "We couldn't restore your appearance preference.",
          );
        }
      } finally {
        if (active) setIsLoaded(true);
      }
    }
    void loadAppearance();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void SystemUI.setBackgroundColorAsync(colors.softSurface).catch((systemError: unknown) => {
      if (active) {
        setError(
          systemError instanceof Error
            ? `We couldn't update the system background. ${systemError.message}`
            : "We couldn't update the system background.",
        );
      }
    });
    return () => {
      active = false;
    };
  }, [colors.softSurface]);

  const setAppearance = useCallback((value: AppearancePreference) => {
    const operation = appearanceOperations.current.then(async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, value);
        setAppearanceState(value);
        setError(null);
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? `We couldn't save your appearance preference. ${saveError.message}`
            : "We couldn't save your appearance preference.",
        );
      }
    });
    appearanceOperations.current = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }, []);

  const contextValue = useMemo(
    () => ({
      appearance,
      resolvedAppearance,
      colors,
      isLoaded,
      error,
      setAppearance,
    }),
    [appearance, resolvedAppearance, colors, isLoaded, error, setAppearance],
  );

  return (
    <AppearanceContext.Provider value={contextValue}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error('useAppearance must be used within an AppearanceProvider.');
  return context;
}

export function useLumoraColors() {
  return useAppearance().colors;
}

export function useThemedStyles<T extends Record<string, object>>(styles: T): T {
  const colors = useLumoraColors();

  return useMemo(() => {
    const paletteMap = new Map<string, string>(
      Object.keys(LightLumoraColors).map((key) => [
        LightLumoraColors[key as keyof typeof LightLumoraColors],
        colors[key as keyof typeof LightLumoraColors],
      ]),
    );
    paletteMap.set('#F0E7F0', colors.selectedSurface);
    paletteMap.set('#EBDDEB', colors.selectedSurface);

    const mapValue = (value: unknown, property: string): unknown => {
      if (typeof value === 'string' && property.toLowerCase().includes('color')) {
        if (value === '#FFFFFF') {
          return property === 'color' ? colors.onPrimary : colors.inputSurface;
        }
        return paletteMap.get(value) ?? value;
      }
      if (Array.isArray(value)) return value.map((item) => mapValue(item, property));
      if (value && typeof value === 'object') {
        return Object.fromEntries(
          Object.entries(value).map(([key, item]) => [
            key,
            mapValue(item, property.toLowerCase().includes('color') ? property : key),
          ]),
        );
      }
      return value;
    };

    const themed = Object.fromEntries(
      Object.entries(styles).map(([name, style]) => {
        const mapped = Object.fromEntries(
          Object.entries(style).map(([property, value]) => [
            property,
            mapValue(value, property),
          ]),
        );
        return [name, mapped];
      }),
    );
    return themed as T;
  }, [colors, styles]);
}
