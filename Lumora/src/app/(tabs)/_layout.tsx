import { Tabs } from 'expo-router';

import { Fonts } from '@/constants/theme';
import { useLumoraColors } from '@/contexts/appearance-context';
import { ScalePressable } from '@/components/scale-pressable';

export default function TabLayout() {
  const colors = useLumoraColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarLabelStyle: {
          fontFamily: Fonts.sans,
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarButton: (props) => <ScalePressable {...props} scaleTo={0.98} />,
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: colors.tabSurface,
          borderTopColor: colors.border,
        },
      }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="lightbook" options={{ title: 'Lightbook' }} />
      <Tabs.Screen name="timeline" options={{ title: 'Family' }} />
      <Tabs.Screen name="support" options={{ title: 'Support' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
    </Tabs>
  );
}
