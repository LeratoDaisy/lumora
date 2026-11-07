import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { OnboardingProvider } from '@/contexts/onboarding-context';
import { LumoraColors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <OnboardingProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: LumoraColors.softSurface },
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </OnboardingProvider>
    </ThemeProvider>
  );
}
