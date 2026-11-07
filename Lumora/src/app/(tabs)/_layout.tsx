import { Tabs } from 'expo-router';

import { Fonts, LumoraColors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: LumoraColors.primary,
        tabBarInactiveTintColor: LumoraColors.secondaryText,
        tabBarLabelStyle: {
          fontFamily: Fonts.sans,
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: '#FFFFFF',
          borderTopColor: LumoraColors.border,
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
