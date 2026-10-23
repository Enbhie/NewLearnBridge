import { createContext, useContext, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

type AppAppearance = {
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
};

export const AppAppearanceContext = createContext<AppAppearance>({
  darkMode: false,
  setDarkMode: () => undefined,
});

export const CloudBackdropVisibilityContext = createContext<
  (visible: boolean) => void
>(() => undefined);

const CLOUDS = [
  { top: 0.08, duration: 52000, size: 1 },
  { top: 0.43, duration: 68000, size: 0.76 },
  { top: 0.68, duration: 59000, size: 0.9 },
] as const;

const STARS = [
  { x: 0.08, y: 0.12, size: 11 },
  { x: 0.19, y: 0.29, size: 8 },
  { x: 0.33, y: 0.11, size: 9 },
  { x: 0.45, y: 0.23, size: 12 },
  { x: 0.57, y: 0.09, size: 8 },
  { x: 0.72, y: 0.28, size: 10 },
  { x: 0.86, y: 0.14, size: 9 },
  { x: 0.94, y: 0.37, size: 12 },
  { x: 0.12, y: 0.49, size: 9 },
  { x: 0.28, y: 0.39, size: 11 },
  { x: 0.52, y: 0.43, size: 8 },
  { x: 0.68, y: 0.52, size: 11 },
  { x: 0.82, y: 0.45, size: 8 },
  { x: 0.39, y: 0.58, size: 10 },
] as const;

const MOUNTAIN_PEAKS = [
  { x: 0.03, height: 88, width: 150 },
  { x: 0.17, height: 128, width: 194 },
  { x: 0.34, height: 96, width: 160 },
  { x: 0.48, height: 142, width: 210 },
  { x: 0.68, height: 104, width: 178 },
  { x: 0.84, height: 130, width: 200 },
] as const;

export default function CloudBackdrop() {
  const { width, height } = useWindowDimensions();
  const { darkMode } = useContext(AppAppearanceContext);
  const cloudPositions = useRef(CLOUDS.map(() => new Animated.Value(0))).current;
  const planetPosition = useRef(new Animated.Value(0)).current;
  const secondPlanetPosition = useRef(new Animated.Value(0)).current;
  const mountainPosition = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const sunRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const cloudAnimations = CLOUDS.map((cloud, index) => {
      const position = cloudPositions[index];
      position.setValue(-240 - index * 250);
      const animation = Animated.loop(
        Animated.timing(position, {
          toValue: width + 240,
          duration: cloud.duration,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== "web",
        })
      );
      animation.start();
      return animation;
    });

    return () => cloudAnimations.forEach((animation) => animation.stop());
  }, [cloudPositions, width]);

  useEffect(() => {
    planetPosition.setValue(width + 100);
    secondPlanetPosition.setValue(width + 140);
    mountainPosition.setValue(0);

    const animations = [
      Animated.loop(
        Animated.timing(mountainPosition, {
          toValue: -width,
          duration: 95000,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== "web",
        })
      ),
      Animated.loop(
        Animated.timing(planetPosition, {
          toValue: -width - 100,
          duration: 72000,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== "web",
        })
      ),
      Animated.loop(
        Animated.timing(secondPlanetPosition, {
          toValue: -width - 100,
          duration: 91000,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== "web",
        })
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, {
            toValue: 1,
            duration: 1900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(shimmer, {
            toValue: 0,
            duration: 1900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: Platform.OS !== "web",
          }),
        ])
      ),
      Animated.loop(
        Animated.timing(sunRotation, {
          toValue: 1,
          duration: 65000,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== "web",
        })
      ),
    ];

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [
    mountainPosition,
    planetPosition,
    secondPlanetPosition,
    shimmer,
    sunRotation,
    width,
  ]);

  const sparkleOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.38, 1],
  });
  const sunRotate = sunRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={[styles.layer, darkMode ? styles.nightSky : styles.daySky]}
    >
      {!darkMode ? (
        <>
          <View style={styles.sunGlow} />
          <Animated.View style={[styles.sunRays, { transform: [{ rotate: sunRotate }] }]}>
            {Array.from({ length: 12 }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.sunRay,
                  { transform: [{ rotate: `${index * 30}deg` }] },
                ]}
              />
            ))}
          </Animated.View>
          <View style={styles.sunCore}>
            <View style={styles.sunHighlight} />
          </View>

          {CLOUDS.map((cloud, index) => (
            <Animated.View
              key={cloud.top}
              style={[
                styles.cloud,
                {
                  top: height * cloud.top,
                  opacity: 0.8,
                  transform: [
                    { translateX: cloudPositions[index] },
                    { scale: cloud.size },
                  ],
                },
              ]}
            >
              <View style={styles.cloudBase} />
              <View style={[styles.cloudPuff, styles.leftPuff]} />
              <View style={[styles.cloudPuff, styles.middlePuff]} />
              <View style={[styles.cloudPuff, styles.rightPuff]} />
            </Animated.View>
          ))}

        </>
      ) : (
        <>
          {STARS.map((star, index) => (
            <Animated.Text
              key={`${star.x}-${star.y}`}
              style={[
                styles.star,
                {
                  left: width * star.x,
                  top: height * star.y,
                  fontSize: star.size,
                  opacity: index % 2 === 0 ? sparkleOpacity : 0.78,
                },
              ]}
            >
              ✦
            </Animated.Text>
          ))}
          <View style={styles.moonGlow} />
          <View style={styles.moon}>
            <View style={[styles.moonCrater, styles.craterOne]} />
            <View style={[styles.moonCrater, styles.craterTwo]} />
            <View style={[styles.moonCrater, styles.craterThree]} />
          </View>
          <Animated.View
            style={[
              styles.planet,
              {
                top: height * 0.36,
                transform: [{ translateX: planetPosition }],
              },
            ]}
          >
            <Text style={styles.planetEmoji}>🪐</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.planet,
              {
                top: height * 0.59,
                transform: [{ translateX: secondPlanetPosition }],
              },
            ]}
          >
            <Text style={styles.smallPlanet}>🪐</Text>
          </Animated.View>
        </>
      )}

      <Animated.View
        style={[
          styles.mountainTrack,
          {
            width: width * 2,
            transform: [{ translateX: mountainPosition }],
          },
        ]}
      >
        {[0, 1].map((copy) => (
          <View
            key={copy}
            style={[styles.mountainRange, { width, left: width * copy }]}
          >
            {MOUNTAIN_PEAKS.map((peak, index) => (
              <View
                key={peak.x}
                style={[
                  styles.mountain,
                  {
                    left: width * peak.x,
                    borderLeftWidth: peak.width / 2,
                    borderRightWidth: peak.width / 2,
                    borderBottomWidth: peak.height,
                    borderBottomColor: darkMode
                      ? index % 2 === 0
                        ? "#1D315F"
                        : "#263D70"
                      : index % 2 === 0
                        ? "#54A98F"
                        : "#438D85",
                  },
                ]}
              >
                <View
                  style={[
                    styles.snowcap,
                    {
                      borderLeftWidth: peak.width * 0.12,
                      borderRightWidth: peak.width * 0.12,
                      borderBottomWidth: peak.height * 0.24,
                      borderBottomColor: darkMode ? "#9BB6E4" : "#E8F6E9",
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
    pointerEvents: "none",
  },
  daySky: {
    backgroundColor: "#73D3EA",
  },
  nightSky: {
    backgroundColor: "#101936",
  },
  sunGlow: {
    position: "absolute",
    top: -95,
    right: -85,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 188, 65, 0.3)",
  },
  sunRays: {
    position: "absolute",
    top: -32,
    right: -32,
    width: 176,
    height: 176,
    alignItems: "center",
    justifyContent: "center",
  },
  sunRay: {
    position: "absolute",
    top: 2,
    width: 10,
    height: 25,
    borderRadius: 8,
    backgroundColor: "#FFB938",
  },
  sunCore: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 5,
    borderColor: "#FFE9A8",
    backgroundColor: "#FFD45C",
    shadowColor: "#FFB938",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 24,
    elevation: 14,
  },
  sunHighlight: {
    position: "absolute",
    top: 20,
    left: 25,
    width: 24,
    height: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    transform: [{ rotate: "-30deg" }],
  },
  cloud: {
    position: "absolute",
    left: 0,
    width: 180,
    height: 66,
  },
  cloudBase: {
    position: "absolute",
    left: 5,
    bottom: 7,
    width: 164,
    height: 28,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  cloudPuff: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
  },
  leftPuff: { left: 27, bottom: 17, width: 43, height: 43 },
  middlePuff: { left: 67, bottom: 22, width: 54, height: 54 },
  rightPuff: { left: 111, bottom: 16, width: 42, height: 42 },
  star: {
    position: "absolute",
    color: "#FFF2B2",
    textShadowColor: "rgba(176, 200, 255, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  moonGlow: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(184, 204, 255, 0.09)",
  },
  moon: {
    position: "absolute",
    top: 38,
    right: 44,
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#F2E9C8",
    shadowColor: "#DAE3FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 22,
    elevation: 12,
  },
  moonCrater: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "#DED5B6",
  },
  craterOne: { top: 20, left: 18, width: 13, height: 13 },
  craterTwo: { top: 48, left: 47, width: 9, height: 9 },
  craterThree: { top: 52, left: 25, width: 6, height: 6 },
  planet: {
    position: "absolute",
    left: 0,
  },
  planetEmoji: {
    fontSize: 42,
    textShadowColor: "rgba(168, 143, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  smallPlanet: {
    fontSize: 27,
    opacity: 0.76,
  },
  mountainTrack: {
    position: "absolute",
    left: 0,
    bottom: 0,
    height: 155,
  },
  mountainRange: {
    position: "absolute",
    bottom: -2,
    height: 150,
  },
  mountain: {
    position: "absolute",
    bottom: 0,
    width: 0,
    height: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  snowcap: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ translateX: -1 }],
  },
});
