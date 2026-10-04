import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";

type Props = {
  lessonTitle: string;
  percent: number;
  xpEarned: number;
  newBadges: number;
  streakDays: number;
  unlockedLessonTitle: string;
  onNext: () => void;
  onMenu: () => void;
};

export default function LessonCompleteScreen({
  lessonTitle,
  percent,
  xpEarned,
  newBadges,
  streakDays,
  unlockedLessonTitle,
  onNext,
  onMenu,
}: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>LESSON COMPLETE</Text>
        </View>
        <Text style={styles.title}>{lessonTitle}</Text>
        <Text style={styles.percent}>{percent}% Complete 🎉</Text>
        <Text style={styles.stars}>⭐⭐⭐</Text>

        <View style={styles.statRow}>
          <View style={[styles.statChip, styles.xpChip]}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statLabel}>XP</Text>
            <Text style={styles.statValue}>+{xpEarned}</Text>
          </View>
          <View style={[styles.statChip, styles.badgeChip]}>
            <Text style={styles.statEmoji}>🥉</Text>
            <Text style={styles.statLabel}>Badges</Text>
            <Text style={styles.statValue}>{newBadges} New</Text>
          </View>
          <View style={[styles.statChip, styles.streakChip]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{streakDays} Day</Text>
          </View>
        </View>

        <View style={styles.unlockCard}>
          <Text style={styles.unlockTitle}>🔓 New lesson unlocked:</Text>
          <Text style={styles.unlockText}>{unlockedLessonTitle}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={onNext}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>NEXT LESSON</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onMenu}
          style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
        >
          <Text style={styles.ghostButtonText}>BACK TO MENU</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFDF5", justifyContent: "space-between" },
  card: {
    backgroundColor: "#315C4A",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  pill: { backgroundColor: "#FFFDF5", borderRadius: 18, paddingVertical: 6, paddingHorizontal: 14 },
  pillText: { color: "#4A2F22", fontSize: 12, fontWeight: "800" },
  title: { color: "#FFFDF5", fontSize: 27, fontWeight: "900", textAlign: "center", marginTop: 4 },
  percent: { color: "#FFFDF5", opacity: 0.88, fontSize: 16 },
  stars: { fontSize: 22, marginTop: 2 },
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
  primaryButtonText: { color: "#FFFDF5", fontSize: 16, fontWeight: "800" },
  ghostButton: { alignItems: "center", justifyContent: "center", minHeight: 48, marginTop: 10 },
  ghostButtonText: { color: "#4A2F22", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
