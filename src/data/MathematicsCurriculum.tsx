import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { playFeedback } from "../utils/soundEffects";

export type MathLessonCategory =
  | "multiplication"
  | "division"
  | "money"
  | "data"
  | "measurement";

type ChartRow = { label: string; emoji: string; count: number };

export type MathProblem = {
  id: string;
  question: string;
  choices: string[];
  answer: string;
  chart?: ChartRow[];
};

export type MathLesson = {
  id: string;
  category: MathLessonCategory;
  lessonNumber: number;
  title: string;
  description: string;
  emoji: string;
  storyTitle: string;
  storyLine: string;
  rememberTitle: string;
  rememberText: string;
  example: string;
  learn: string[];
  problems: MathProblem[];
};

export type MathQuizQuestion = {
  id: string;
  lessonId: string;
  character: string;
  prompt: string;
  displayText: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  chart?: ChartRow[];
};

export const mathCategoryMeta: Record<
  MathLessonCategory,
  {
    label: string;
    emoji: string;
    summary: string;
  }
> = {
  multiplication: {
    label: "Multiplication",
    emoji: "✖️",
    summary: "Practice repeated addition and multiplication facts.",
  },
  division: {
    label: "Division",
    emoji: "➗",
    summary: "Learn to share equally and make equal groups.",
  },
  money: {
    label: "Money",
    emoji: "💰",
    summary: "Add prices and calculate change using pesos and centavos.",
  },
  data: {
    label: "Data",
    emoji: "📊",
    summary: "Read pictographs and compare information in a chart.",
  },
  measurement: {
    label: "Measurement",
    emoji: "📏",
    summary: "Choose suitable units and measure lengths.",
  },
};

export const fruitChart: ChartRow[] = [
  { label: "Mango", emoji: "🥭", count: 6 },
  { label: "Banana", emoji: "🍌", count: 3 },
  { label: "Apple", emoji: "🍎", count: 4 },
  { label: "Grapes", emoji: "🍇", count: 2 },
];

export const mathLessons: MathLesson[] = [
  {
    id: "multiplication-1",
    category: "multiplication",
    lessonNumber: 1,
    title: "Multiplication",
    description:
      "Understand multiplication as repeated addition and practice multiplication facts.",
    emoji: "✖️",
    storyTitle: "THE MANGO BASKETS",
    storyLine: "There are 5 baskets with 6 mangoes in each basket.",
    rememberTitle: "Remember This",
    rememberText:
      "Multiplication is repeated addition of equal groups. The order of the factors does not change the product.",
    example: "3 × 4 = 4 + 4 + 4 = 12.",
    learn: [
      "Multiplication is repeated addition of equal groups: 3 × 4 = 4 + 4 + 4.",
      "Know the multiplication tables up to 10.",
      "The order does not change the product: 3 × 4 = 4 × 3.",
    ],
    problems: [
      {
        id: "multi-1",
        question: "4 + 4 + 4 is the same as which multiplication?",
        choices: ["3 × 4", "4 × 4", "3 + 4", "12 × 3"],
        answer: "3 × 4",
      },
      {
        id: "multi-2",
        question:
          "There are 5 baskets with 6 mangoes in each basket. How many mangoes are there in all?",
        choices: ["11", "30", "25", "36"],
        answer: "30",
      },
      {
        id: "multi-3",
        question: "7 × 8 = ?",
        choices: ["54", "56", "48", "63"],
        answer: "56",
      },
      {
        id: "multi-4",
        question: "If 6 × 9 = 54, what is 9 × 6?",
        choices: ["45", "54", "15", "63"],
        answer: "54",
      },
    ],
  },
   {
    id: "division-1",
    category: "division",
    lessonNumber: 2,
    title: "Division",
    description:
      "Share objects equally and solve division problems, including remainders.",
    emoji: "➗",
    storyTitle: "SHARING CANDIES",
    storyLine: "Twelve candies are shared equally among three children.",
    rememberTitle: "Remember This",
    rememberText:
      "Division means sharing equally or making equal groups. Division is the opposite of multiplication.",
    example: "12 ÷ 3 = 4 because 3 × 4 = 12.",
    learn: [
      "Division means sharing equally or making equal groups.",
      "Division is the opposite of multiplication: 3 × 4 = 12, so 12 ÷ 3 = 4.",
      "Some numbers divide with a remainder: 13 ÷ 4 = 3 remainder 1.",
    ],
    problems: [
      {
        id: "div-1",
        question:
          "12 candies are shared equally among 3 children. How many candies does each child get?",
        choices: ["3", "4", "5", "9"],
        answer: "4",
      },
      {
        id: "div-2",
        question: "20 ÷ 5 = ?",
        choices: ["3", "4", "5", "15"],
        answer: "4",
      },
      {
        id: "div-3",
        question: "5 × 7 = 35. So, 35 ÷ 5 = ?",
        choices: ["6", "7", "8", "30"],
        answer: "7",
      },
      {
        id: "div-4",
        question: "14 ÷ 4 = ?",
        choices: [
          "3 remainder 2",
          "4 remainder 1",
          "3 remainder 1",
          "2 remainder 3",
        ],
        answer: "3 remainder 2",
      },
    ],
  },
   {
    id: "money-1",
    category: "money",
    lessonNumber: 3,
    title: "Money",
    description: "Add prices and find change using pesos and centavos.",
    emoji: "💰",
    storyTitle: "AT THE SARI-SARI STORE",
    storyLine: "Ana buys a notebook and a pencil, then checks how much she needs to pay.",
    rememberTitle: "Remember This",
    rememberText:
      "Add prices to find the total. Subtract the cost from the amount paid to find the change. Line up decimal points.",
    example: "PHP 25 + PHP 8 = PHP 33.",
    learn: [
      "Read pesos and centavos: PHP 25.50 is 25 pesos and 50 centavos.",
      "Add to find the total. Subtract to find the change.",
      "Line up the decimal points when you add or subtract.",
    ],
    problems: [
      {
        id: "money-1",
        question: "A notebook costs PHP 25 and a pencil costs PHP 8. What is the total?",
        choices: ["PHP 32", "PHP 33", "PHP 34", "PHP 35"],
        answer: "PHP 33",
      },
      {
        id: "money-2",
        question: "You pay PHP 50 for candy that costs PHP 35. How much is your change?",
        choices: ["PHP 10", "PHP 15", "PHP 20", "PHP 25"],
        answer: "PHP 15",
      },
      {
        id: "money-3",
        question: "PHP 12.50 + PHP 7.50 = ?",
        choices: ["PHP 19.00", "PHP 20.00", "PHP 20.50", "PHP 19.50"],
        answer: "PHP 20.00",
      },
      {
        id: "money-4",
        question:
          "Ana has PHP 100. She buys a rice cake for PHP 45.75. How much money is left?",
        choices: ["PHP 55.25", "PHP 54.25", "PHP 54.75", "PHP 45.25"],
        answer: "PHP 54.25",
      },
    ],
  },
  {
    id: "data-1",
    category: "data",
    lessonNumber: 4,
    title: "Data",
    description: "Read a pictograph and compare how many pupils chose each fruit.",
    emoji: "📊",
    storyTitle: "OUR FAVORITE FRUITS",
    storyLine: "The class uses pictures to show everyone's favorite fruit.",
    rememberTitle: "Remember This",
    rememberText:
      "A pictograph uses pictures to show amounts. Read the key or picture values, then compare the totals.",
    example: "Mangoes: 6 pupils. Grapes: 2 pupils. Six is four more than two.",
    learn: [
      "A pictograph uses pictures to show how many. Each picture stands for 1 pupil here.",
      "A bar graph uses bars. A taller bar means more.",
      "Read the graph to find the most, the least, and how many more.",
    ],
    problems: [
      {
        id: "data-1",
        question: "Our class's favorite fruits. Which fruit did the most pupils choose?",
        chart: fruitChart,
        choices: ["Mango", "Banana", "Apple", "Grapes"],
        answer: "Mango",
      },
      {
        id: "data-2",
        question: "How many pupils chose banana?",
        chart: fruitChart,
        choices: ["2", "3", "4", "6"],
        answer: "3",
      },
      {
        id: "data-3",
        question: "How many more pupils chose mango than grapes?",
        chart: fruitChart,
        choices: ["3", "4", "5", "8"],
        answer: "4",
      },
      {
        id: "data-4",
        question: "How many pupils answered in all?",
        chart: fruitChart,
        choices: ["13", "14", "15", "16"],
        answer: "15",
      },
    ],
  },
  {
    id: "measurement-1",
    category: "measurement",
    lessonNumber: 5,
    title: "Measurement",
    description: "Choose appropriate units and measure the length of everyday objects.",
    emoji: "📏",
    storyTitle: "MEASURE IT!",
    storyLine: "Use a ruler to find the length of a pencil or ribbon.",
    rememberTitle: "Remember This",
    rememberText:
      "Use centimeters for shorter objects and meters for longer distances. Start measuring at the zero mark.",
    example: "1 meter = 100 centimeters.",
    learn: [
      "Use centimeters (cm) for short things and meters (m) for long things.",
      "Put the 0 mark of the ruler at the start of the object.",
      "Estimate first, then measure to check.",
    ],
    problems: [
      {
        id: "measure-1",
        question: "Which unit is best for measuring the length of a pencil?",
        choices: ["Centimeters", "Meters"],
        answer: "Centimeters",
      },
      {
        id: "measure-2",
        question: "Which unit is best for measuring the length of a classroom?",
        choices: ["Centimeters", "Meters"],
        answer: "Meters",
      },
      {
        id: "measure-3",
        question: "1 meter is equal to how many centimeters?",
        choices: ["10 cm", "50 cm", "100 cm", "1000 cm"],
        answer: "100 cm",
      },
      {
        id: "measure-4",
        question:
          "A ribbon starts at 0 on a ruler and ends at 15. How long is the ribbon?",
        choices: ["5 cm", "15 cm", "51 cm", "150 cm"],
        answer: "15 cm",
      },
    ],
  },
];

export const mathQuizQuestions: MathQuizQuestion[] = [
  {
    id: "multi-q1",
    lessonId: "multiplication-1",
    character: "Mia",
    prompt: "4 + 4 + 4 is the same as which multiplication?",
    displayText: "Repeated addition",
    options: ["3 × 4", "4 × 4", "3 + 4", "12 × 3"],
    correctAnswer: "3 × 4",
    hint: "Count how many equal groups are being added.",
  },
  {
    id: "div-q1",
    lessonId: "division-1",
    character: "Mia",
    prompt: "12 candies are shared equally among 3 children. How many candies does each child get?",
    displayText: "Divide 12 into 3 equal groups.",
    options: ["3", "4", "5", "9"],
    correctAnswer: "4",
    hint: "3 × 4 = 12.",
  },
  {
    id: "money-q1",
    lessonId: "money-1",
    character: "Mia",
    prompt: "A notebook costs PHP 25 and a pencil costs PHP 8. What is the total?",
    displayText: "Add the prices.",
    options: ["PHP 32", "PHP 33", "PHP 34", "PHP 35"],
    correctAnswer: "PHP 33",
    hint: "25 + 8 = 33.",
  },
  {
    id: "data-q1",
    lessonId: "data-1",
    character: "Mia",
    prompt: "Which fruit did the most pupils choose?",
    displayText: "Each picture represents one pupil.",
    chart: fruitChart,
    options: ["Mango", "Banana", "Apple", "Grapes"],
    correctAnswer: "Mango",
    hint: "Look for the fruit with the most pictures.",
  },
  {
    id: "measure-q1",
    lessonId: "measurement-1",
    character: "Mia",
    prompt: "Which unit is best for measuring the length of a pencil?",
    displayText: "Choose a suitable unit of length.",
    options: ["Centimeters", "Meters"],
    correctAnswer: "Centimeters",
    hint: "A pencil is a short object.",
  },
];

export const getMathLessons = (
  category: MathLessonCategory,
): MathLesson[] =>
  mathLessons.filter((lesson) => lesson.category === category);

export const getMathQuiz = (lessonId: string): MathQuizQuestion[] =>
  mathQuizQuestions.filter((question) => question.lessonId === lessonId);

type Stage = "learn" | "quiz" | "done";

const renderEmojiSet = (emoji: string, count: number) =>
  Array.from({ length: count }, () => emoji).join(" ");

export default function GradeThreeMathScreen({
  onBack,
}: {
  onBack?: () => void;
}) {
  const [lessonIdx, setLessonIdx] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>("learn");
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const lesson = lessonIdx === null ? null : mathLessons[lessonIdx];

  const openLesson = (index: number) => {
    setLessonIdx(index);
    setStage("learn");
    setQIdx(0);
    setPicked(null);
    setScore(0);
  };

  const choose = (choice: string) => {
    if (!lesson || picked !== null) return;
    setPicked(choice);
    if (choice === lesson.problems[qIdx].answer) {
      playFeedback("success");
      setScore((currentScore) => currentScore + 1);
    } else {
      playFeedback("error");
    }
  };

  const goNext = () => {
    if (!lesson) return;
    if (qIdx + 1 < lesson.problems.length) {
      setQIdx(qIdx + 1);
      setPicked(null);
    } else {
      setStage("done");
    }
  };

  const goToPreviousPage = () => {
    if (stage === "quiz") {
      setStage("learn");
      return;
    }

    if (stage === "done") {
      setStage("quiz");
      setPicked(null);
      return;
    }

    if (lessonIdx !== null) {
      setLessonIdx(null);
      return;
    }

    if (onBack) {
      onBack();
    }
  };

  if (!lesson || lessonIdx === null) {
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        {onBack ? (
          <Pressable
            onPress={goToPreviousPage}
            accessibilityRole="button"
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Back to Subjects</Text>
          </Pressable>
        ) : null}

        <View style={styles.header}>
          <Text style={styles.h1}>Mathematics</Text>
          <Text style={styles.muted}>Choose a lesson to begin!</Text>
        </View>

        {mathLessons.map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() => openLesson(index)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.card, styles.row, pressed && styles.pressed]}
          >
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.lessonEmoji}>{item.emoji}</Text>
            <Text style={[styles.cardTitle, { flex: 1 }]}>{item.title}</Text>
            <Text style={styles.linkText}>Start</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  if (stage === "learn") {
    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Pressable
          onPress={() => setLessonIdx(null)}
          accessibilityRole="button"
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>All lessons</Text>
        </Pressable>

        <View style={styles.lessonHeader}>
          <Text style={styles.lessonHeaderEmoji}>{lesson.emoji}</Text>
          <Text style={styles.h1}>{lesson.title}</Text>
        </View>
        <Text style={[styles.muted, { marginBottom: 12 }]}>What you will learn</Text>

        {lesson.learn.map((point, index) => (
          <View key={`${lesson.id}-${index}`} style={[styles.card, styles.row]}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{index + 1}</Text>
            </View>
            <Text style={[styles.body, { flex: 1 }]}>{point}</Text>
          </View>
        ))}

        <Pressable
          onPress={() => setStage("quiz")}
          accessibilityRole="button"
          style={styles.primaryButton}
        >
          <Text style={styles.primaryText}>Start</Text>
        </Pressable>

        <Pressable
          onPress={goToPreviousPage}
          accessibilityRole="button"
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryText}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (stage === "quiz") {
    const problem = lesson.problems[qIdx];
    const answered = picked !== null;
    const isLast = qIdx + 1 === lesson.problems.length;
    const gotItRight = picked === problem.answer;

    return (
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.muted}>
          {lesson.title} � Problem {qIdx + 1} of {lesson.problems.length}
        </Text>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((qIdx + (answered ? 1 : 0)) / lesson.problems.length) * 100}%`,
              },
            ]}
          />
        </View>

        <View style={styles.card}>
          {problem.chart ? (
            <View style={styles.chart}>
              {problem.chart.map((row) => (
                <View key={`${problem.id}-${row.label}`} style={styles.chartRow}>
                  <Text style={styles.chartLabel}>{row.label}</Text>
                  <Text style={styles.chartIcons}>{renderEmojiSet(row.emoji, row.count)}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text style={styles.question}>{problem.question}</Text>
        </View>

        {problem.choices.map((choice) => {
          const isAnswer = choice === problem.answer;
          const isPicked = choice === picked;

          return (
            <Pressable
              key={choice}
              onPress={() => choose(choice)}
              disabled={answered}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.choice,
                answered && isAnswer && styles.choiceRight,
                answered && isPicked && !isAnswer && styles.choiceWrong,
                !answered && pressed && styles.pressed,
              ]}
            >
              <Text style={styles.choiceText}>{choice}</Text>
            </Pressable>
          );
        })}

        {answered ? (
          <>
            <Text style={[styles.feedback, { color: gotItRight ? GREEN : RED }]}>
              {gotItRight ? "Correct! Great job." : `Not quite. The answer is ${problem.answer}.`}
            </Text>

            <Pressable
              onPress={goNext}
              accessibilityRole="button"
              style={styles.primaryButton}
            >
              <Text style={styles.primaryText}>{isLast ? "Finish" : "Next"}</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={goToPreviousPage}
            accessibilityRole="button"
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>Back</Text>
          </Pressable>
        )}
      </ScrollView>
    );
  }

  const total = lesson.problems.length;
  const hasNextLesson = lessonIdx + 1 < mathLessons.length;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={[styles.card, { alignItems: "center", paddingVertical: 28 }]}>
        <Text style={styles.h1}>Lesson complete!</Text>
        <Text style={[styles.body, { marginTop: 8 }]}>
          You got {score} of {total} correct in {lesson.title}.
        </Text>
      </View>

      {hasNextLesson ? (
        <Pressable
          onPress={() => openLesson(lessonIdx + 1)}
          accessibilityRole="button"
          style={styles.primaryButton}
        >
          <Text style={styles.primaryText}>Next lesson: {mathLessons[lessonIdx + 1].title}</Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={() => openLesson(lessonIdx)}
        accessibilityRole="button"
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryText}>Try again</Text>
      </Pressable>

      <Pressable
        onPress={goToPreviousPage}
        accessibilityRole="button"
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const BLUE = "#2F5BEA";
const SOFT_BLUE = "#E3EBFF";
const GREEN = "#1E8F55";
const RED = "#C93B3B";
const INK = "#1B2540";
const MUTED = "#5B6784";

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "transparent" },
  content: {
    padding: 16,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  header: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  lessonHeaderEmoji: { fontSize: 30 },
  h1: { fontSize: 26, fontWeight: "800", color: INK },
  muted: { fontSize: 15, color: MUTED },
  body: { fontSize: 18, lineHeight: 26, color: INK },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDE5F7",
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: INK },
  lessonEmoji: { fontSize: 26, marginRight: 6 },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: SOFT_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: BLUE, fontWeight: "800", fontSize: 16 },
  linkButton: { alignSelf: "flex-start", paddingVertical: 8, marginBottom: 4 },
  linkText: { color: BLUE, fontWeight: "700", fontSize: 16 },
  pressed: { opacity: 0.7 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DDE5F7",
    marginBottom: 14,
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: BLUE },
  question: { fontSize: 20, lineHeight: 28, fontWeight: "700", color: INK },
  chart: {
    backgroundColor: "#F7F9FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 6,
  },
  chartRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  chartLabel: { width: 70, fontSize: 15, fontWeight: "600", color: INK },
  chartIcons: {
    flex: 1,
    fontSize: 28,
    lineHeight: 34,
    includeFontPadding: false,
  },
  choice: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#DDE5F7",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  choiceRight: { borderColor: GREEN, backgroundColor: "#E6F6EC" },
  choiceWrong: { borderColor: RED, backgroundColor: "#FCEAEA" },
  choiceText: { fontSize: 18, fontWeight: "600", color: INK },
  feedback: { fontSize: 17, fontWeight: "700", marginTop: 4, marginBottom: 6 },
  primaryButton: {
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  primaryText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: BLUE,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryText: { color: BLUE, fontSize: 17, fontWeight: "700" },
});
