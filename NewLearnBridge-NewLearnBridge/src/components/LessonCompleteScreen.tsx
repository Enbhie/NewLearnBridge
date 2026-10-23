import { useContext, useEffect, useRef } from "react";
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import { playFeedback } from "../utils/soundEffects";
import { AppAppearanceContext } from "./CloudBackdrop";

type Props = {
  lessonTitle: string;
  correct: number;
  total: number;
  xpEarned: number;
  newBadges: number;
  streakDays: number;
  unlockedLessonTitle: string;
  onNext: () => void;
  onMenu: () => void;
};

export default function LessonCompleteScreen({
  lessonTitle,
  correct,
  total,
  xpEarned,
  newBadges,
  streakDays,
  unlockedLessonTitle,
  onNext,
  onMenu,
}: Props) {
  const { darkMode } = useContext(AppAppearanceContext);
  const passed = total > 0 && correct === total;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const trophyScale = useRef(new Animated.Value(0.45)).current;
  const trophyOpacity = useRef(new Animated.Value(0)).current;
  const starScales = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const sparkleValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const failIconScale = useRef(new Animated.Value(0.5)).current;
  const failIconOpacity = useRef(new Animated.Value(0)).current;
  const failShake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    playFeedback(passed ? "celebrate" : "error");

    const entrance = passed
      ? Animated.parallel([
          Animated.sequence([
            Animated.parallel([
              Animated.spring(trophyScale, {
                toValue: 1.2,
                useNativeDriver: true,
                stiffness: 240,
                damping: 12,
              }),
              Animated.timing(trophyOpacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
              }),
            ]),
            Animated.spring(trophyScale, {
              toValue: 1,
              useNativeDriver: true,
              stiffness: 240,
              damping: 14,
            }),
          ]),
          Animated.stagger(
            130,
            starScales.map((scale) =>
              Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                stiffness: 260,
                damping: 13,
              }),
            ),
          ),
          ...sparkleValues.map((opacity) =>
            Animated.sequence([
              Animated.delay(180),
              Animated.timing(opacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
              }),
              Animated.timing(opacity, {
                toValue: 0,
                duration: 650,
                useNativeDriver: true,
              }),
            ]),
          ),
        ])
      : Animated.parallel([
          Animated.sequence([
            Animated.parallel([
              Animated.spring(failIconScale, {
                toValue: 1.15,
                useNativeDriver: true,
                stiffness: 240,
                damping: 12,
              }),
              Animated.timing(failIconOpacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
              }),
            ]),
            Animated.spring(failIconScale, {
              toValue: 1,
              useNativeDriver: true,
              stiffness: 240,
              damping: 14,
            }),
          ]),
          Animated.sequence([
            Animated.delay(250),
            Animated.timing(failShake, {
              toValue: 1,
              duration: 90,
              useNativeDriver: true,
            }),
            Animated.timing(failShake, {
              toValue: -1,
              duration: 90,
              useNativeDriver: true,
            }),
            Animated.timing(failShake, {
              toValue: 0,
              duration: 90,
              useNativeDriver: true,
            }),
          ]),
        ]);

    entrance.start();
    return () => entrance.stop();
  }, [
    failIconOpacity,
    failIconScale,
    failShake,
    passed,
    sparkleValues,
    starScales,
    trophyOpacity,
    trophyScale,
  ]);

  return (
    <SafeAreaView style={[styles.screen, darkMode && styles.darkScreen]}>
      <View style={[
        styles.card,
        darkMode && styles.darkCard,
        !passed && styles.failedCard,
        !passed && darkMode && styles.darkFailedCard,
      ]}>
        <View style={styles.celebration} accessible={false}>
          {passed ? (
            <>
              <Animated.Text
                style={[
                  styles.sparkle,
                  styles.sparkleOne,
                  { opacity: sparkleValues[0], transform: [{ scale: sparkleValues[0] }] },
                ]}
              >
                ✦
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.sparkle,
                  styles.sparkleTwo,
                  { opacity: sparkleValues[1], transform: [{ scale: sparkleValues[1] }] },
                ]}
              >
                ✧
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.sparkle,
                  styles.sparkleThree,
                  { opacity: sparkleValues[2], transform: [{ scale: sparkleValues[2] }] },
                ]}
              >
                ✦
              </Animated.Text>
              <Animated.Text
                accessibilityLabel="Trophy"
                style={[
                  styles.trophy,
                  { opacity: trophyOpacity, transform: [{ scale: trophyScale }] },
                ]}
              >
                🏆
              </Animated.Text>
            </>
          ) : (
            <Animated.Text
              accessibilityLabel="Incomplete"
              style={[
                styles.failFace,
                {
                  opacity: failIconOpacity,
                  transform: [
                    { scale: failIconScale },
                    {
                      translateX: failShake.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [-8, 0, 8],
                      }),
                    },
                  ],
                },
              ]}
            >
              😔
            </Animated.Text>
          )}
        </View>

        {!passed && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>LESSON INCOMPLETE</Text>
          </View>
        )}
        <Text style={styles.title}>{lessonTitle}</Text>
        <Text style={styles.percent}>
          {passed ? `${percent}% Complete 🎉` : `${percent}% Complete`}
        </Text>
        <Text style={styles.score}>
          {correct} of {total} {total === 1 ? "quiz" : "quizzes"} correct
        </Text>
        {passed ? (
          <View
            accessibilityLabel="Three stars earned"
            accessibilityRole="image"
            style={styles.stars}
          >
            {starScales.map((scale, index) => (
              <Animated.Text
                key={index}
                style={[styles.star, { transform: [{ scale }] }]}
              >
                ★
              </Animated.Text>
            ))}
          </View>
        ) : (
          <Text style={styles.incompleteStatus}>
            Not yet — keep practicing!
          </Text>
        )}

        <View style={styles.statRow}>
          <View style={[styles.statChip, darkMode ? styles.darkStatChip : styles.xpChip]}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={[styles.statLabel, darkMode && styles.darkMutedText]}>XP</Text>
            <Text style={[styles.statValue, darkMode && styles.darkText]}>+{passed ? xpEarned : 0}</Text>
          </View>
          <View style={[styles.statChip, darkMode ? styles.darkStatChip : styles.badgeChip]}>
            <Text style={styles.statEmoji}>🥉</Text>
            <Text style={[styles.statLabel, darkMode && styles.darkMutedText]}>Badges</Text>
            <Text style={[styles.statValue, darkMode && styles.darkText]}>{passed ? newBadges : 0} New</Text>
          </View>
          <View style={[styles.statChip, darkMode ? styles.darkStatChip : styles.streakChip]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statLabel, darkMode && styles.darkMutedText]}>Streak</Text>
            <Text style={[styles.statValue, darkMode && styles.darkText]}>{passed ? streakDays : 0} Day</Text>
          </View>
        </View>

        {passed && (
          <View style={[styles.unlockCard, darkMode && styles.darkStatChip]}>
            <Text style={[styles.unlockTitle, darkMode && styles.darkText]}>🔓 New lesson unlocked:</Text>
            <Text style={[styles.unlockText, darkMode && styles.darkMutedText]}>{unlockedLessonTitle}</Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, darkMode && styles.darkScreen]}>
        <Pressable
          accessibilityRole="button"
          onPress={onNext}
          style={({ pressed }) => [
            styles.primaryButton,
            !passed && pressed && styles.tryAgainHovered,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {passed ? "NEXT LESSON" : "TRY AGAIN"}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onMenu}
          style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
        >
          <Text style={[styles.ghostButtonText, darkMode && styles.darkText]}>BACK TO MENU</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent", justifyContent: "space-between" },
  card: {
    backgroundColor: "#315C4A",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  failedCard: { backgroundColor: "#8B4A4A" },
  celebration: {
    alignItems: "center",
    height: 62,
    justifyContent: "center",
    position: "relative",
    width: "100%",
  },
  trophy: { fontSize: 46 },
  failFace: { fontSize: 42 },
  sparkle: { color: "#FFE18A", fontSize: 25, position: "absolute" },
  sparkleOne: { left: "27%", top: 3 },
  sparkleTwo: { right: "27%", top: 1 },
  sparkleThree: { right: "34%", bottom: 0 },
  pill: { backgroundColor: "#FFFDF5", borderRadius: 18, paddingVertical: 6, paddingHorizontal: 14 },
  pillText: { color: "#4A2F22", fontSize: 12, fontWeight: "800" },
  title: { color: "#FFFDF5", fontSize: 27, fontWeight: "900", textAlign: "center", marginTop: 4 },
  percent: { color: "#FFFDF5", opacity: 0.88, fontSize: 16 },
  score: { color: "#FFFDF5", fontSize: 15, fontWeight: "800" },
  incompleteStatus: {
    color: "#FFE18A",
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  stars: { flexDirection: "row", gap: 4, marginTop: 2 },
  star: { color: "#FFE18A", fontSize: 24 },
  statRow: { flexDirection: "row", gap: 8, width: "100%", marginTop: 4 },
  statChip: { flex: 1, alignItems: "center", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 4 },
  xpChip: { backgroundColor: "#FFF1C8" },
  badgeChip: { backgroundColor: "#DDECD3" },
  streakChip: { backgroundColor: "#F7DFD9" },
  statEmoji: { fontSize: 18 },
  statLabel: { color: "#6E675D", fontSize: 11, fontWeight: "700", marginTop: 3 },
  statValue: { color: "#4A2F22", fontSize: 13, fontWeight: "900", marginTop: 2, textAlign: "center" },
  unlockCard: { backgroundColor: "#FFFDF5", borderRadius: 12, padding: 16, width: "100%", marginTop: 4 },
  unlockTitle: { color: "#4A2F22", fontSize: 14, fontWeight: "800" },
  unlockText: { color: "#6E675D", fontSize: 14, marginTop: 4 },
  footer: { padding: 24 },
  primaryButton: { alignItems: "center", justifyContent: "center", minHeight: 56, borderRadius: 15, backgroundColor: "#759B57" },
  tryAgainHovered: { backgroundColor: "#FADADD" },
  primaryButtonText: { color: "#FFFDF5", fontSize: 16, fontWeight: "800" },
  ghostButton: { alignItems: "center", justifyContent: "center", minHeight: 48, marginTop: 10 },
  ghostButtonText: { color: "#4A2F22", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.7 },
  darkScreen: { backgroundColor: "rgba(18, 29, 50, 0.32)" },
  darkCard: { backgroundColor: "#26374B" },
  darkFailedCard: { backgroundColor: "#483745" },
  darkStatChip: { backgroundColor: "#34425A" },
  darkText: { color: "#E4EAF3" },
  darkMutedText: { color: "#B9C5D8" },
});
