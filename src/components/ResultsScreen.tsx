import { useEffect } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import { playFeedback } from "../utils/soundEffects";

type QuestionResult = {
  label: string;
  answer: string;
  correct: boolean;
};

type Props = {
  childName: string;
  lessonTitle?: string;
  correct: number;
  total: number;
  timeLabel: string;
  xpEarned: number;
  breakdown: QuestionResult[];
  parentNote?: string;
  onRetry: () => void;
  onNext: () => void;
};

export default function ResultsScreen({
  childName,
  lessonTitle = "Lesson 1",
  correct,
  total,
  timeLabel,
  xpEarned,
  breakdown,
  parentNote,
  onRetry,
  onNext,
}: Props) {
  const allCorrect = total > 0 && correct === total;
  const stars = Math.max(1, Math.round((correct / Math.max(total, 1)) * 3));

  useEffect(() => {
    playFeedback("celebrate");
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.trophyCircle}>
            <Text style={styles.trophy}>🏆</Text>
          </View>
          <Text style={styles.heroTitle}>{allCorrect ? "Excellent Work!" : "Good Try!"}</Text>
          <Text style={styles.heroSubtitle}>{childName} completed {lessonTitle}!</Text>
          <Text style={styles.stars}>{"⭐".repeat(stars)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Your Results</Text>
        <View style={styles.statRow}>
          <View style={[styles.statChip, styles.correctChip]}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statLabel}>Correct</Text>
            <Text style={styles.statValue}>{correct}/{total}</Text>
          </View>
          <View style={[styles.statChip, styles.timeChip]}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{timeLabel}</Text>
          </View>
          <View style={[styles.statChip, styles.xpChip]}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statLabel}>XP</Text>
            <Text style={styles.statValue}>+{xpEarned}</Text>
          </View>
        </View>

        <View style={styles.breakdownCard}>
          {breakdown.map((result, index) => (
            <View key={`${result.label}-${index}`} style={[styles.breakdownRow, index > 0 && styles.divider]}>
              <Text style={styles.breakdownLabel}>Q{index + 1}: {result.label}</Text>
              <Text style={[styles.answer, result.correct ? styles.correctText : styles.incorrectText]}>
                {result.answer} {result.correct ? "✓" : "✕"}
              </Text>
            </View>
          ))}
        </View>

        {parentNote && (
          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>MOM'S NOTE</Text>
            <Text style={styles.noteText}>"{parentNote}" 🥰</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed]}
        >
          <Text style={styles.ghostText}>TRY AGAIN</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onNext}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.secondaryText}>NEXT LESSON →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFDF5" },
  body: { padding: 20, paddingBottom: 24 },
  hero: { backgroundColor: "#315C4A", borderRadius: 18, padding: 24, alignItems: "center" },
  trophyCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FFFDF5", alignItems: "center", justifyContent: "center" },
  trophy: { fontSize: 32 },
  heroTitle: { color: "#FFFDF5", fontSize: 28, fontWeight: "900", marginTop: 14 },
  heroSubtitle: { color: "#FFFDF5", opacity: 0.86, fontSize: 15, marginTop: 4 },
  stars: { fontSize: 20, marginTop: 10 },
  sectionTitle: { color: "#4A2F22", fontSize: 20, fontWeight: "800", marginTop: 20, marginBottom: 10 },
  statRow: { flexDirection: "row", gap: 8 },
  statChip: { flex: 1, alignItems: "center", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 4 },
  correctChip: { backgroundColor: "#DDECD3" },
  timeChip: { backgroundColor: "#F7DFD9" },
  xpChip: { backgroundColor: "#FFF1C8" },
  statEmoji: { fontSize: 18 },
  statLabel: { color: "#6E675D", fontSize: 11, fontWeight: "700", marginTop: 3 },
  statValue: { color: "#4A2F22", fontSize: 14, fontWeight: "900", marginTop: 2 },
  breakdownCard: { backgroundColor: "#F5F0E6", borderRadius: 18, borderWidth: 1.5, borderColor: "#E8E0CF", marginTop: 20, paddingHorizontal: 16 },
  breakdownRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: "#E8E0CF" },
  breakdownLabel: { flex: 1, color: "#4A2F22", fontSize: 14, lineHeight: 20 },
  answer: { fontSize: 14, fontWeight: "800" },
  correctText: { color: "#759B57" },
  incorrectText: { color: "#B85C4A" },
  noteCard: { backgroundColor: "#FFF1EC", borderRadius: 18, padding: 16, marginTop: 12 },
  noteTitle: { color: "#6E675D", fontSize: 12, fontWeight: "800" },
  noteText: { color: "#4A2F22", fontSize: 14, fontStyle: "italic", marginTop: 5 },
  footer: { flexDirection: "row", gap: 10, padding: 20, borderTopWidth: 1, borderTopColor: "#E8E0CF" },
  ghostButton: { flex: 1, minHeight: 54, alignItems: "center", justifyContent: "center" },
  ghostText: { color: "#4A2F22", fontSize: 13, fontWeight: "800" },
  secondaryButton: { flex: 1, minHeight: 54, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#759B57" },
  secondaryText: { color: "#FFFDF5", fontSize: 13, fontWeight: "800", textAlign: "center" },
  pressed: { opacity: 0.7 },
});
