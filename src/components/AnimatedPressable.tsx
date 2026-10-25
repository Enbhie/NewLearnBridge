import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  Platform,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import { startBackgroundMusic } from "../utils/backgroundMusic";
import { playFeedback, type FeedbackKind } from "../utils/soundEffects";
import AnimatedLearningSticker, {
  learningStickerVariantForIndex,
} from "./AnimatedLearningSticker";

type AnimatedPressableProps = PressableProps & {
  pressScale?: number;
  soundEffect?: FeedbackKind;
  celebrateOnPress?: boolean;
};

export function AnimatedPressable({
  onPressIn,
  onPressOut,
  pressScale = 0.92,
  soundEffect = "tap",
  celebrateOnPress = false,
  style,
  ...props
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const wobble = useRef(new Animated.Value(0)).current;
  const celebration = useRef(new Animated.Value(0)).current;
  const [celebrationIndex, setCelebrationIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const baseStyle = typeof style === "function"
    ? style({ pressed: false, hovered: false })
    : style;
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

  useEffect(
    () => () => {
      celebration.stopAnimation();
      wobble.stopAnimation();
    },
    [celebration, wobble]
  );

  const handlePressIn = (event: GestureResponderEvent) => {
    startBackgroundMusic();
    playFeedback(soundEffect);
    animateTo(celebrateOnPress ? Math.min(pressScale, 0.84) : pressScale);
    if (celebrateOnPress) {
      celebration.stopAnimation();
      celebration.setValue(0);
      wobble.stopAnimation();
      wobble.setValue(0);
      setCelebrationIndex((current) => current + 1);
      setShowCelebration(true);
      const useNativeDriver = Platform.OS !== "web";
      Animated.sequence([
        Animated.timing(wobble, {
          toValue: 1,
          duration: 75,
          useNativeDriver,
        }),
        Animated.timing(wobble, {
          toValue: -1,
          duration: 100,
          useNativeDriver,
        }),
        Animated.spring(wobble, {
          toValue: 0,
          useNativeDriver,
          stiffness: 420,
          damping: 8,
          mass: 0.4,
        }),
      ]).start();
      Animated.sequence([
        Animated.spring(celebration, {
          toValue: 1,
          useNativeDriver,
          stiffness: 520,
          damping: 8,
          mass: 0.45,
        }),
        Animated.delay(180),
        Animated.timing(celebration, {
          toValue: 0,
          duration: 850,
          useNativeDriver,
        }),
      ]).start(({ finished }) => {
        if (finished) setShowCelebration(false);
      });
    }
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: celebrateOnPress ? 1.16 : 1.04,
        useNativeDriver: Platform.OS !== "web",
        stiffness: celebrateOnPress ? 560 : 520,
        damping: celebrateOnPress ? 9 : 16,
        mass: celebrateOnPress ? 0.42 : 0.5,
      }),
      Animated.spring(scale, {
        toValue: celebrateOnPress ? 0.98 : 1,
        useNativeDriver: Platform.OS !== "web",
        stiffness: celebrateOnPress ? 480 : 460,
        damping: celebrateOnPress ? 11 : 14,
        mass: celebrateOnPress ? 0.45 : 0.5,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: Platform.OS !== "web",
        stiffness: 460,
        damping: 12,
        mass: 0.48,
      }),
    ]).start();
    onPressOut?.(event);
  };

  return (
    <Animated.View
      style={[
        layoutStyle,
        {
          transform: [
            { scale },
            {
              rotate: wobble.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: ["-5deg", "0deg", "5deg"],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={(state) => [
          typeof style === "function" ? style(state) : style,
          { width: "100%" },
        ]}
      />
      {showCelebration ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.celebration,
            {
              opacity: celebration,
              transform: [
                {
                  scale: celebration.interpolate({
                    inputRange: [0, 0.68, 1],
                    outputRange: [0.12, 1.65, 1.1],
                  }),
                },
                {
                  rotate: celebration.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ["-42deg", "24deg", "0deg"],
                  }),
                },
                {
                  translateY: celebration.interpolate({
                    inputRange: [0, 1],
                    outputRange: [28, -76],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.Text style={[styles.sparkle, styles.sparkleLeft]}>✨</Animated.Text>
          <Animated.Text style={[styles.sparkle, styles.sparkleTop]}>⭐</Animated.Text>
          <Animated.Text style={[styles.sparkle, styles.sparkleRight]}>💫</Animated.Text>
          <AnimatedLearningSticker
            key={celebrationIndex}
            variant={learningStickerVariantForIndex(celebrationIndex)}
            size={76}
          />
          <Animated.Text style={[styles.sparkle, styles.sparkleBottom]}>✨</Animated.Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  celebration: {
    alignItems: "center",
    height: 108,
    justifyContent: "center",
    position: "absolute",
    right: -28,
    top: -68,
    width: 108,
    zIndex: 2,
  },
  sparkle: {
    fontSize: 27,
    position: "absolute",
    textShadowColor: "rgba(255, 194, 61, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  sparkleLeft: {
    left: 0,
    top: 36,
  },
  sparkleTop: {
    left: 40,
    top: 0,
  },
  sparkleRight: {
    right: -2,
    top: 32,
  },
  sparkleBottom: {
    bottom: 0,
    right: 18,
  },
});
