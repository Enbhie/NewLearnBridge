import { useRef } from "react";
import {
  Animated,
  Pressable,
  Platform,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
  type ViewStyle,
} from "react-native";

type AnimatedPressableProps = PressableProps & {
  pressScale?: number;
};

export function AnimatedPressable({
  onPressIn,
  onPressOut,
  pressScale = 0.96,
  style,
  ...props
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const baseStyle = typeof style === "function" ? style({ pressed: false }) : style;
  const flattenedStyle = StyleSheet.flatten(baseStyle);
  const layoutStyle: ViewStyle = {
    alignSelf: flattenedStyle?.alignSelf,
    aspectRatio: flattenedStyle?.aspectRatio,
    flex: flattenedStyle?.flex,
    flexBasis: flattenedStyle?.flexBasis,
    flexGrow: flattenedStyle?.flexGrow,
    flexShrink: flattenedStyle?.flexShrink,
    height: flattenedStyle?.height,
    maxHeight: flattenedStyle?.maxHeight,
    maxWidth: flattenedStyle?.maxWidth,
    minHeight: flattenedStyle?.minHeight,
    minWidth: flattenedStyle?.minWidth,
    width: flattenedStyle?.width,
  };

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: Platform.OS !== "web",
      stiffness: 520,
      damping: 28,
      mass: 0.6,
    }).start();
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    animateTo(pressScale);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    animateTo(1);
    onPressOut?.(event);
  };

  return (
    <Animated.View style={[layoutStyle, { transform: [{ scale }] }]}>
      <Pressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={(state) => [
          typeof style === "function" ? style(state) : style,
          { width: "100%" },
        ]}
      />
    </Animated.View>
  );
}
