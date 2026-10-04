import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Difficulty } from "./AccountSettingsScreen";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";

type Question = {
  id: string;
  character: string;
  prompt: string;
  equation: string;
  options: string[];
  correctAnswer: string;
  hint: string;
};

const questionsByDifficulty: Record<Difficulty, Question> = {
  easy: {
    id: "q1-easy",
    character: "Bea",
    prompt: "bought a candy for ₱2 and paid with a ₱5 bill. How much change will she get?",
    equation: "₱5 − ₱2 = ?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "3",
    hint: "Subtract the price from your payment!",
  },
  standard: {
    id: "q1-standard",
    character: "Bea",
    prompt: "bought a candy for ₱7 and paid with a ₱10 bill. How much change will she get?",
    equation: "₱10 − ₱7 = ?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "3",
    hint: "Subtract the price from your payment!",
  },
  challenge: {
    id: "q1-challenge",
    character: "Bea",
    prompt: "bought a book for ₱13 and paid with a ₱20 bill. How much change will she get?",
    equation: "₱20 − ₱13 = ?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "7",
    hint: "Subtract the price from your payment!",
  },
};

type Props = {
  difficulty: Difficulty;
  onBack: () => void;
  onFinish: (results: {
    correct: number;
    total: number;
    breakdown: { label: string; answer: string; correct: boolean }[];
  }) => void;
};

export default function QuizScreen({ difficulty, onBack, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const question = questionsByDifficulty[difficulty];
  const isCorrect = selected === question.correctAnswer;

  const getOptionStyle = (option: string) => {
    if (!checked) return selected === option ? styles.optionSelected : styles.option;
    if (option === question.correctAnswer) return styles.optionCorrect;
    if (option === selected) return styles.optionIncorrect;
    return styles.option;
  };

  const handleCheck = () => {
    if (!selected) return;
    setChecked(true);
    if (isCorrect) setCorrectCount((count) => count + 1);
  };

  const handleNext = () => {
    if (index + 1 >= 1) {
      onFinish({
        correct: correctCount + (isCorrect ? 1 : 0),
        total: 1,
        breakdown: [{
          label: `Change from ${question.equation.replace(" = ?", "")}`,
          answer: `₱${selected}`,
          correct: isCorrect,
        }],
      });
      return;
    }

    setIndex((current) => current + 1);
    setSelected(null);
    setChecked(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Go back to lesson"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.counterPill}>
          <Text style={styles.counterText}>
            Question {index + 1} of 1
          </Text>
        </View>
        <Text style={styles.hearts}>❤️❤️❤️</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={styles.progressValue} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <View style={styles.quizIllustration}>
            <Text style={styles.quizOwl}>🦉</Text>
            <Text style={styles.quizShop}>🏪</Text>
            <Text style={styles.quizCoin}>🪙</Text>
          </View>
          <Text style={styles.questionText}>
            <Text style={styles.character}>{question.character}</Text> {question.prompt}
          </Text>
          <View style={styles.equationBox}>
            <Text style={styles.equation}>{question.equation}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose the correct answer:</Text>
        <View style={styles.optionsGrid}>
          {question.options.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: selected === option, disabled: checked }}
              disabled={checked}
              onPress={() => setSelected(option)}
              style={({ pressed }) => [
                getOptionStyle(option),
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
        </View>

        {!checked ? (
          <View style={styles.hintCard}>
            <Text style={styles.hintTitle}>💭 Hint</Text>
            <Text style={styles.hintText}>{question.hint}</Text>
          </View>
        ) : (
          <View style={[styles.hintCard, isCorrect ? styles.correctFeedback : styles.incorrectFeedback]}>
            <Text style={styles.feedbackText}>
              {isCorrect ? "Tama! Great job!" : `Not quite - the answer is ₱${question.correctAnswer}`}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !selected && !checked }}
          disabled={!selected && !checked}
          onPress={checked ? handleNext : handleCheck}
          style={({ pressed }) => [
            styles.primaryButton,
            !selected && !checked && styles.disabledButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {checked ? "SEE RESULTS" : "CHECK ANSWER"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3FBFC" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#9DD8E1",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 18, color: "#173B53" },
  counterPill: {
    borderWidth: 1.5,
    borderColor: "#9DD8E1",
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  counterText: { color: "#173B53", fontSize: 14, fontWeight: "800" },
  hearts: { fontSize: 14 },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#CDEEF1",
    overflow: "hidden",
    marginHorizontal: 20,
    marginTop: 12,
  },
  progressValue: { width: "100%", height: "100%", backgroundColor: "#F17D65" },
  body: { padding: 20, paddingBottom: 24 },
  questionCard: { backgroundColor: "#FFEAA4", borderColor: "#F4C451", borderWidth: 2, borderRadius: 22, padding: 16 },
  quizIllustration: { minHeight: 132, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", backgroundColor: "#B8EDF3", borderRadius: 18, marginBottom: 14 },
  quizOwl: { fontSize: 70 },
  quizShop: { fontSize: 66 },
  quizCoin: { fontSize: 46, alignSelf: "flex-start", marginTop: 12 },
  questionText: { color: "#173B53", fontSize: 18, lineHeight: 27, fontWeight: "600" },
  character: { fontWeight: "900" },
  equationBox: {
    borderWidth: 1.5,
    borderColor: "#F17D65",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  equation: { color: "#173B53", fontSize: 25, fontWeight: "900" },
  sectionTitle: { color: "#173B53", fontSize: 19, fontWeight: "900", marginTop: 20, marginBottom: 12 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  option: {
    width: "47%",
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#9DD8E1",
    backgroundColor: "#FFFFFF",
  },
  optionSelected: {
    width: "47%",
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#258EA3",
    backgroundColor: "#D8F3F3",
  },
  optionCorrect: {
    width: "47%",
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#39A982",
    backgroundColor: "#D5F5E7",
  },
  optionIncorrect: {
    width: "47%",
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#D85A48",
    backgroundColor: "#FFDCCF",
  },
  optionText: { color: "#173B53", fontSize: 24, fontWeight: "900" },
  hintCard: {
    backgroundColor: "#D5F5E7",
    borderWidth: 1.5,
    borderColor: "#70C9A3",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  hintTitle: { color: "#173B53", fontSize: 16, fontWeight: "900" },
  hintText: { color: "#36566A", fontSize: 15, lineHeight: 22, marginTop: 3 },
  correctFeedback: { backgroundColor: "#BDECCF", borderColor: "transparent" },
  incorrectFeedback: { backgroundColor: "#FFDCCF", borderColor: "transparent" },
  feedbackText: { color: "#173B53", fontSize: 16, fontWeight: "900" },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#CDEEF1", backgroundColor: "#FFFFFF" },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    borderRadius: 15,
    backgroundColor: "#F17D65",
  },
  disabledButton: { backgroundColor: "#A4BAC0" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  pressed: { opacity: 0.7 },
});
