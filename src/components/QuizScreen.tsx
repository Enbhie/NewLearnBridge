import { useContext, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Difficulty } from "./AccountSettingsScreen";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import AlphabetWordGame from "./AlphabetWordGame";
import {
  lessonContent,
  mathQuizQuestionsByDifficulty,
  quizQuestions,
  type CategoryId,
} from "../data/learningContent";
import { awardModuleBadge } from "../data/badges";
import { playFeedback } from "../utils/soundEffects";
import AnimatedLearningSticker, {
  learningStickerVariantForIndex,
} from "./AnimatedLearningSticker";
import StorybookPicture from "./StorybookPicture";
import { AppAppearanceContext } from "./CloudBackdrop";

type Question = {
  id: string;
  label: string;
  character: string;
  prompt: string;
  equation: string;
  options: string[];
  correctAnswer: string;
  hint: string;
};

type Props = {
  category: CategoryId;
  difficulty: Difficulty;
  onBack: () => void;
  onFinish: (results: {
    correct: number;
    total: number;
    breakdown: { label: string; answer: string; correct: boolean }[];
  }) => void;
};

export default function QuizScreen({ category, difficulty, onBack, onFinish }: Props) {
  const { darkMode } = useContext(AppAppearanceContext);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [lessonLocked, setLessonLocked] = useState(false);
  const [answers, setAnswers] = useState<
    { label: string; answer: string; correct: boolean }[]
  >([]);

  if (category === "reading") {
    return <AlphabetWordGame onBack={onBack} onFinish={onFinish} />;
  }

  const questions: Question[] = (
    category === "math" ? mathQuizQuestionsByDifficulty[difficulty] : quizQuestions[category]
  ).map((question) => ({
    id: question.id,
    label: lessonContent[category].title,
    character: question.character,
    prompt: question.prompt,
    equation: question.displayText,
    options: question.options,
    correctAnswer: question.correctAnswer,
    hint: question.hint,
  }));
  const question = questions[index];
  const isCorrect = selected === question.correctAnswer;
  const resetLesson = () => {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setLessonLocked(false);
    setAnswers([]);
  };

  const getOptionStyle = (option: string) => {
    if (!checked) return selected === option ? styles.optionSelected : styles.option;
    if (option === question.correctAnswer) return styles.optionCorrect;
    if (option === selected) return styles.optionIncorrect;
    return styles.option;
  };

  const handleCheck = () => {
    if (!selected || lessonLocked) return;
    setChecked(true);
    if (isCorrect) {
      playFeedback("success");
    } else {
      playFeedback("error");
      setLessonLocked(true);
    }
  };

  const handleRetryFromStart = () => {
    resetLesson();
    setAnswers([]);
  };

  const handleNext = () => {
    const updatedAnswers = [
      ...answers,
      {
        label: question.label,
        answer: category === "math" ? `₱${selected}` : selected ?? "No answer",
        correct: isCorrect,
      },
    ];

    if (index + 1 >= questions.length) {
      const finalResults = {
        correct: updatedAnswers.filter((answer) => answer.correct).length,
        total: questions.length,
        breakdown: updatedAnswers,
      };

      void awardModuleBadge({
        moduleId: `module:${category}`,
        title: `${lessonContent[category].title} badge`,
        summary: `${lessonContent[category].title}: ${lessonContent[category].rememberText} Result: ${finalResults.correct}/${finalResults.total} correct.`,
        resultLabel: `${finalResults.correct}/${finalResults.total} correct`,
      }).catch((error: unknown) => {
        Alert.alert(
          "Badge not saved",
          error instanceof Error ? error.message : "Check device storage and try again."
        );
      });

      onFinish(finalResults);
      return;
    }

    setAnswers(updatedAnswers);
    setIndex((current) => current + 1);
    setSelected(null);
    setChecked(false);
    setLessonLocked(false);
  };

  return (
    <SafeAreaView style={[styles.screen, darkMode && styles.darkScreen]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.counterPill}>
          <Text style={[styles.counterText, darkMode && styles.darkText]}>
            Question {index + 1} of {questions.length}
          </Text>
        </View>
        <Text style={styles.hearts}>❤️❤️❤️</Text>
      </View>

      <View
        accessibilityLabel={`Quiz progress: ${index + 1} of ${questions.length}`}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: questions.length, now: index + 1 }}
        style={[styles.progressTrack, darkMode && styles.darkTrack]}
      >
        <View style={[styles.progressValue, { width: `${((index + 1) / questions.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.questionCard, darkMode && styles.darkCard]}>
          <View style={[styles.quizIllustration, darkMode && styles.darkIllustration]}>
            <AnimatedLearningSticker variant="owl" size={78} />
            <AnimatedLearningSticker variant="plant" size={68} />
            <AnimatedLearningSticker variant="coin" size={58} />
          </View>
          <Text style={[styles.questionText, darkMode && styles.darkText]}>
            <Text style={styles.character}>{question.character}</Text> {question.prompt}
          </Text>
          <View style={[styles.equationBox, darkMode && styles.darkCard]}>
            <Text style={[styles.equation, darkMode && styles.darkText]}>{question.equation}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Choose the correct answer:</Text>
        <View style={styles.optionsGrid}>
          {question.options.map((option, optionIndex) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              celebrateOnPress
             accessibilityState={{ selected: selected === option, disabled: checked || lessonLocked }}
             disabled={checked || lessonLocked}
              soundEffect="select"
              onPress={() => setSelected(option)}
              style={({ pressed }) => [
                getOptionStyle(option),
                darkMode && (selected === option ? styles.darkOptionSelected : styles.darkOption),
                pressed && styles.pressed,
              ]}
            >
              <StorybookPicture
                label={option}
                size={30}
              />
              <Text style={[styles.optionText, darkMode && styles.darkText]}>{option}</Text>
            </Pressable>
          ))}
        </View>

        {lessonLocked ? (
          <View style={[styles.lockedCard, darkMode && styles.darkHintCard]}>
           <Text style={[styles.feedbackText, darkMode && styles.darkText]}>
             Not quite. The correct answer is {category === "math" ? `₱${question.correctAnswer}` : question.correctAnswer}. Restart the lesson to try again from the beginning.
           </Text>
          </View>
        ) : !checked ? (
          <View style={[styles.hintCard, darkMode && styles.darkHintCard]}>
           <Text style={[styles.hintTitle, darkMode && styles.darkText]}>💭 Hint</Text>
           <Text style={[styles.hintText, darkMode && styles.darkMutedText]}>{question.hint}</Text>
          </View>
        ) : (
          <View style={[
           styles.hintCard,
           darkMode && styles.darkHintCard,
           isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
           darkMode && (isCorrect ? styles.darkCorrectFeedback : styles.darkIncorrectFeedback),
          ]}>
           <Text style={[styles.feedbackText, darkMode && styles.darkText]}>
             {isCorrect
               ? "Tama! Great job!"
               : `Not quite - the answer is ${category === "math" ? `₱${question.correctAnswer}` : question.correctAnswer}`}
           </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, darkMode && styles.darkFooter]}>
        {lessonLocked ? (
          <Pressable
           accessibilityRole="button"
           onPress={handleRetryFromStart}
           style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
           <Text style={styles.primaryButtonText}>RESTART LESSON</Text>
          </Pressable>
        ) : (
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
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backButton: {
    minWidth: 64,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#C62828",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  backText: { fontSize: 14, color: "#FFFFFF", fontWeight: "800" },
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
  progressValue: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F17D65",
  },
  body: { padding: 20, paddingBottom: 24 },
  questionCard: { backgroundColor: "#FFEAA4", borderColor: "#F4C451", borderWidth: 2, borderRadius: 22, padding: 16 },
  quizIllustration: { minHeight: 132, flexDirection: "row", alignItems: "center", justifyContent: "space-evenly", backgroundColor: "#B8EDF3", borderRadius: 22, marginBottom: 14, borderWidth: 2, borderColor: "#8BD4DF" },
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
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 6,
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
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 6,
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
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 6,
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
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 6,
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
  lockedCard: {
    backgroundColor: "#FFE4DB",
    borderWidth: 1.5,
    borderColor: "#F29D7A",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  hintTitle: { color: "#173B53", fontSize: 16, fontWeight: "900" },
  hintText: { color: "#36566A", fontSize: 15, lineHeight: 22, marginTop: 3 },
  correctFeedback: { backgroundColor: "#BDECCF", borderColor: "transparent" },
  incorrectFeedback: { backgroundColor: "#FFDCCF", borderColor: "transparent" },
  darkCorrectFeedback: { backgroundColor: "#22503B", borderColor: "#61B891" },
  darkIncorrectFeedback: { backgroundColor: "#5B2A32", borderColor: "#D7776A" },
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
  darkScreen: { backgroundColor: "rgba(18, 29, 50, 0.32)" },
  darkCard: { backgroundColor: "#303D55", borderColor: "#465671" },
  darkIllustration: { backgroundColor: "#29384C", borderColor: "#50617A" },
  darkOption: { backgroundColor: "#29364D", borderColor: "#54647D" },
  darkOptionSelected: { backgroundColor: "#394C68", borderColor: "#7897B0" },
  darkHintCard: { backgroundColor: "#29384C", borderColor: "#50617A" },
  darkTrack: { backgroundColor: "#46546A" },
  darkFooter: { backgroundColor: "#202B40", borderTopColor: "#35445F" },
  darkText: { color: "#E4EAF3" },
  darkMutedText: { color: "#B9C5D8" },
});
