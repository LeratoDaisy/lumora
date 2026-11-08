import {
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

type ScalePressableProps = PressableProps & {
  scaleTo?: number;
};

export function ScalePressable({
  scaleTo = 0.97,
  style,
  onPressIn,
  onPressOut,
  ...props
}: ScalePressableProps) {
  const scale = useSharedValue(1);
  const reduceMotion = useReducedMotion();
  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const progress = (1 - scale.value) / (1 - scaleTo);
    return {
      transform: [{ scale: scale.value }],
      opacity: 1 - progress * 0.025,
    };
  }, [reduceMotion, scaleTo]);

  return (
    <ReanimatedPressable
      {...props}
      style={(state: PressableStateCallbackType) => [
        typeof style === 'function' ? style(state) : style,
        animatedStyle,
      ]}
      onPressIn={(event) => {
        if (!reduceMotion) {
          scale.value = withSpring(scaleTo, { damping: 18, stiffness: 320 });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        if (!reduceMotion) {
          scale.value = withSpring(1, { damping: 18, stiffness: 320 });
        }
        onPressOut?.(event);
      }}
    />
  );
}
