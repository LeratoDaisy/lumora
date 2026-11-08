import { PropsWithChildren, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ScalePressable } from '@/components/scale-pressable';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const rotation = useSharedValue(0);
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` }],
  }));

  return (
    <ThemedView>
      <ScalePressable
        scaleTo={0.98}
        style={styles.heading}
        onPress={() => {
          const nextOpen = !isOpen;
          setIsOpen(nextOpen);
          rotation.value = reduceMotion
            ? Number(nextOpen)
            : withTiming(Number(nextOpen), { duration: 180 });
        }}>
        <ThemedView type="backgroundElement" style={styles.button}>
          <Animated.View style={arrowStyle}>
            <View style={[styles.chevron, { borderColor: theme.text }]} />
          </Animated.View>
        </ThemedView>

        <ThemedText type="small">{title}</ThemedText>
      </ScalePressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <ThemedView type="backgroundElement" style={styles.content}>
            {children}
          </ThemedView>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  button: {
    width: Spacing.four,
    height: Spacing.four,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    width: 8,
    height: 8,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },
  content: {
    marginTop: Spacing.three,
    borderRadius: Spacing.three,
    marginLeft: Spacing.four,
    padding: Spacing.four,
  },
});
