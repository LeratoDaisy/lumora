import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { AppearanceProvider, useAppearance } from '@/contexts/appearance-context';
import { OnboardingProvider } from '@/contexts/onboarding-context';
import { MemoryProvider } from '@/contexts/memory-context';
import { CheckInProvider } from '@/contexts/check-in-context';
import { EngagementProvider } from '@/contexts/engagement-context';
import { AuthProvider } from '@/contexts/auth-context';

export default function RootLayout() {
  return (
    <AppearanceProvider>
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </AppearanceProvider>
  );
}

function AppNavigation() {
  const { colors, resolvedAppearance, isLoaded } = useAppearance();
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.softSurface }}>
        <StatusBar style={resolvedAppearance === 'dark' ? 'light' : 'dark'} />
      </View>
    );
  }
  const navigationTheme = {
    ...DefaultTheme,
    dark: resolvedAppearance === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.softSurface,
      card: colors.warmSurface,
      text: colors.primaryText,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <OnboardingProvider>
        <MemoryProvider>
          <CheckInProvider>
            <EngagementProvider>
              <StatusBar style={resolvedAppearance === 'dark' ? 'light' : 'dark'} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.softSurface },
                }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
                <Stack.Screen name="memory/create" options={{ presentation: 'modal' }} />
                <Stack.Screen name="memory/[id]" />
                <Stack.Screen name="check-in" options={{ presentation: 'modal' }} />
                <Stack.Screen name="comments/[type]/[id]" />
              </Stack>
            </EngagementProvider>
          </CheckInProvider>
        </MemoryProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}
