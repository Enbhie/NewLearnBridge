import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import { playFeedback } from "../utils/soundEffects";
import GradeThreeMathScreen from "../data/MathematicsCurriculum";
import {
  englishLessons,
  getEnglishQuiz,
  type EnglishLesson,
} from "../data/EnglishCurriculum";
import { healthLessons } from "../data/HealthCurriculum";
import { scienceLessons } from "../data/ScienceCurriculum";

const subjects = [
  {
    name: "English",
    emoji: "📚",
    color: "#FFE6A7",
    lessons: [
      "Nouns and Pronouns",
      "Verbs and Adjectives",
      "Sentence Construction",
      "Reading Comprehension",
      "Vocabulary Building",
    ],
  },
  {
    name: "Mathematics",
    emoji: "🔢",
    color: "#D9F2FF",
    lessons: [
      "Addition and Subtraction",
      "Multiplication",
      "Division",
      "Fractions",
      "Time and Money",
    ],
  },
  {
    name: "Science",
    emoji: "🔬",
    color: "#DDF7D6",
    lessons: [
      "Living and Nonliving Things",
      "Plants and Animals",
      "Parts of the Body",
      "Matter",
      "Weather and Seasons",
    ],
  },
  {
    name: "Health/PE",
    emoji: "🏃",
    color: "#FFE4F1",
    lessons: [
      "Healthy Habits",
      "Exercise and Movement",
      "Safety and Wellness",
      "Personal Hygiene",
    ],
  },
] as const;

type Subject = (typeof subjects)[number];

type Props = {
  onBack?: () => void;
};

export default function GradeThreeLessonsScreen({ onBack }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedEnglishLesson, setSelectedEnglishLesson] =
    useState<EnglishLesson | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(
    null
  );
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizProblemIndex, setQuizProblemIndex] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [englishScore, setEnglishScore] = useState(0);
  const [scrambleQuestionIndex, setScrambleQuestionIndex] = useState(0);
  const [scrambleSelectedWordIndexes, setScrambleSelectedWordIndexes] =
    useState<number[]>([]);
  const [scrambleChecked, setScrambleChecked] = useState(false);
  const [scrambleScore, setScrambleScore] = useState(0);
  const [scrambleFinished, setScrambleFinished] = useState(false);
  const [guessQuestionIndex, setGuessQuestionIndex] = useState(0);
  const [guessSelectedAnswer, setGuessSelectedAnswer] = useState<string | null>(
    null
  );
  const [guessChecked, setGuessChecked] = useState(false);
  const [guessScore, setGuessScore] = useState(0);
  const [guessFinished, setGuessFinished] = useState(false);
  const [detectiveCaseIndex, setDetectiveCaseIndex] = useState(0);
  const [detectiveSelectedAnswer, setDetectiveSelectedAnswer] = useState<
    string | null
  >(null);
  const [detectiveChecked, setDetectiveChecked] = useState(false);
  const [detectiveScore, setDetectiveScore] = useState(0);
  const [detectiveCompleted, setDetectiveCompleted] = useState(false);
  const [detectiveShowHint, setDetectiveShowHint] = useState(false);
  const [storyRoundIndex, setStoryRoundIndex] = useState(0);
  const [storySelectedAnswer, setStorySelectedAnswer] = useState<string | null>(
    null
  );
  const [storyChecked, setStoryChecked] = useState(false);
  const [storyScore, setStoryScore] = useState(0);
  const [storyShowHint, setStoryShowHint] = useState(false);
  const [storyFinished, setStoryFinished] = useState(false);
  const [wordMatchIndex, setWordMatchIndex] = useState(0);
  const [wordMatchAnswer, setWordMatchAnswer] = useState<string | null>(null);
  const [wordMatchChecked, setWordMatchChecked] = useState(false);
  const [wordMatchScore, setWordMatchScore] = useState(0);
  const [wordMatchFinished, setWordMatchFinished] = useState(false);
  const [scienceLessonIndex, setScienceLessonIndex] = useState<number | null>(
    null
  );
  const [scienceActivityIndex, setScienceActivityIndex] = useState(0);
  const [scienceQuestionIndex, setScienceQuestionIndex] = useState(0);
  const [scienceSelectedAnswer, setScienceSelectedAnswer] = useState<
    string | null
  >(null);
  const [scienceChecked, setScienceChecked] = useState(false);
  const [scienceCorrectAnswers, setScienceCorrectAnswers] = useState<
    Set<string>
  >(() => new Set());
  const [scienceFinished, setScienceFinished] = useState(false);
  const scienceScore = scienceCorrectAnswers.size;
  const [healthLessonIndex, setHealthLessonIndex] = useState<number | null>(
    null
  );
  const [healthActivityIndex, setHealthActivityIndex] = useState(0);
  const [healthQuestionIndex, setHealthQuestionIndex] = useState(0);
  const [healthSelectedAnswer, setHealthSelectedAnswer] = useState<
    string | null
  >(null);
  const [healthChecked, setHealthChecked] = useState(false);
  const [healthCorrectAnswers, setHealthCorrectAnswers] = useState<Set<string>>(
    () => new Set()
  );
  const [healthFinished, setHealthFinished] = useState(false);
  const healthScore = healthCorrectAnswers.size;
  const healthLesson =
    healthLessonIndex === null ? undefined : healthLessons[healthLessonIndex];
  const healthActivity = healthLesson?.activities[healthActivityIndex];
  const healthQuestion = healthActivity?.questions[healthQuestionIndex];
  const healthLessonQuestionCount =
    healthLesson?.activities.reduce(
      (total, activity) => total + activity.questions.length,
      0
    ) ?? 0;
  const healthCompletedBeforeActivity =
    healthLesson?.activities
      .slice(0, healthActivityIndex)
      .reduce((total, activity) => total + activity.questions.length, 0) ?? 0;
  const healthProgress =
    healthLessonQuestionCount > 0
      ? ((healthCompletedBeforeActivity +
          healthQuestionIndex +
          (healthChecked ? 1 : 0)) /
          healthLessonQuestionCount) *
        100
      : 0;
  const scienceLesson =
    scienceLessonIndex === null
      ? undefined
      : scienceLessons[scienceLessonIndex];
  const scienceActivity =
    scienceLesson?.activities[scienceActivityIndex];
  const scienceQuestion =
    scienceActivity?.questions[scienceQuestionIndex];
  const scienceLessonQuestionCount =
    scienceLesson?.activities.reduce(
      (total, activity) => total + activity.questions.length,
      0
    ) ?? 0;
  const scienceCompletedBeforeActivity =
    scienceLesson?.activities
      .slice(0, scienceActivityIndex)
      .reduce(
        (total, activity) => total + activity.questions.length,
        0
      ) ?? 0;
  const scienceProgress =
    scienceLessonQuestionCount > 0
      ? ((scienceCompletedBeforeActivity +
          scienceQuestionIndex +
          (scienceChecked ? 1 : 0)) /
          scienceLessonQuestionCount) *
        100
      : 0;
  const englishQuizzes = selectedEnglishLesson
    ? getEnglishQuiz(selectedEnglishLesson.id)
    : [];
  const englishQuiz = englishQuizzes[quizProblemIndex];
  const sentenceScrambleActivities =
    selectedEnglishLesson?.sentenceScrambleActivities ?? [];
  const sentenceScrambleActivity =
    sentenceScrambleActivities[scrambleQuestionIndex];
  const guessQuestions = selectedEnglishLesson?.guessQuestions ?? [];
  const guessQuestion = guessQuestions[guessQuestionIndex];
  const detectiveCases =
    selectedEnglishLesson?.id === "grammar-3"
      ? selectedEnglishLesson.problems
      : [];
  const detectiveCase = detectiveCases[detectiveCaseIndex];
  const storyPredictionRounds =
    selectedEnglishLesson?.storyPredictionRounds ?? [];
  const storyPredictionRound = storyPredictionRounds[storyRoundIndex];
  const wordMatchRounds =
    selectedEnglishLesson?.id === "vocabulary-1"
      ? selectedEnglishLesson.problems
      : [];
  const wordMatchRound = wordMatchRounds[wordMatchIndex];
  const selectedScrambleSentence = sentenceScrambleActivity
    ? scrambleSelectedWordIndexes
        .map((wordIndex) => sentenceScrambleActivity.scrambled[wordIndex])
        .join(" ")
    : "";
  const isScrambleAnswerCorrect =
    sentenceScrambleActivity !== undefined &&
    selectedScrambleSentence.replace(/[.!?]+$/, "").toLowerCase() ===
      sentenceScrambleActivity.answer
        .join(" ")
        .replace(/[.!?]+$/, "")
        .toLowerCase();
  const selectedEnglishLessonIndex = selectedEnglishLesson
    ? englishLessons.findIndex((lesson) => lesson.id === selectedEnglishLesson.id)
    : -1;
  const totalEnglishQuestions = englishLessons.reduce(
    (total, lesson) => total + lesson.problems.length,
    0
  );
  const questionsBeforeCurrentLesson = englishLessons
    .slice(0, Math.max(selectedEnglishLessonIndex, 0))
    .reduce((total, lesson) => total + lesson.problems.length, 0);
  const completedEnglishQuestions =
    questionsBeforeCurrentLesson +
    quizProblemIndex +
    (quizChecked ? 1 : 0);
  const englishProgress =
    totalEnglishQuestions > 0
      ? (completedEnglishQuestions / totalEnglishQuestions) * 100
      : 0;
  const openEnglishLesson = (lesson: EnglishLesson) => {
    setSelectedEnglishLesson(lesson);
    setSelectedQuizAnswer(null);
    setQuizChecked(false);
    setQuizProblemIndex(0);
    setQuizFinished(false);
    setEnglishScore(0);
    setScrambleQuestionIndex(0);
    setScrambleSelectedWordIndexes([]);
    setScrambleChecked(false);
    setScrambleScore(0);
    setScrambleFinished(false);
    setGuessQuestionIndex(0);
    setGuessSelectedAnswer(null);
    setGuessChecked(false);
    setGuessScore(0);
    setGuessFinished(false);
    setDetectiveCaseIndex(0);
    setDetectiveSelectedAnswer(null);
    setDetectiveChecked(false);
    setDetectiveScore(0);
    setDetectiveCompleted(false);
    setDetectiveShowHint(false);
    setStoryRoundIndex(0);
    setStorySelectedAnswer(null);
    setStoryChecked(false);
    setStoryScore(0);
    setStoryShowHint(false);
    setStoryFinished(false);
    setWordMatchIndex(0);
    setWordMatchAnswer(null);
    setWordMatchChecked(false);
    setWordMatchScore(0);
    setWordMatchFinished(false);
  };

  const advanceEnglishQuiz = () => {
    if (quizProblemIndex + 1 < englishQuizzes.length) {
      setQuizProblemIndex((index) => index + 1);
      setSelectedQuizAnswer(null);
      setQuizChecked(false);
      return;
    }

    const currentLessonIndex = englishLessons.findIndex(
      (lesson) => lesson.id === selectedEnglishLesson?.id
    );
    const nextLesson = englishLessons[currentLessonIndex + 1];

    if (nextLesson) {
      setSelectedEnglishLesson(nextLesson);
      setQuizProblemIndex(0);
      setSelectedQuizAnswer(null);
      setQuizChecked(false);
      setScrambleQuestionIndex(0);
      setScrambleSelectedWordIndexes([]);
      setScrambleChecked(false);
      setScrambleScore(0);
      setScrambleFinished(false);
      setGuessQuestionIndex(0);
      setGuessSelectedAnswer(null);
      setGuessChecked(false);
      setGuessScore(0);
      setGuessFinished(false);
      setDetectiveCaseIndex(0);
      setDetectiveSelectedAnswer(null);
      setDetectiveChecked(false);
      setDetectiveScore(0);
      setDetectiveCompleted(false);
      setDetectiveShowHint(false);
      setStoryRoundIndex(0);
      setStorySelectedAnswer(null);
      setStoryChecked(false);
      setStoryScore(0);
      setStoryShowHint(false);
      setStoryFinished(false);
      setWordMatchIndex(0);
      setWordMatchAnswer(null);
      setWordMatchChecked(false);
      setWordMatchScore(0);
      setWordMatchFinished(false);
      return;
    }

    setQuizFinished(true);
  };

  const clearEnglishLesson = () => {
    setSelectedEnglishLesson(null);
    setSelectedQuizAnswer(null);
    setQuizChecked(false);
    setQuizProblemIndex(0);
    setQuizFinished(false);
    setEnglishScore(0);
    setScrambleQuestionIndex(0);
    setScrambleSelectedWordIndexes([]);
    setScrambleChecked(false);
    setScrambleScore(0);
    setScrambleFinished(false);
    setGuessQuestionIndex(0);
    setGuessSelectedAnswer(null);
    setGuessChecked(false);
    setGuessScore(0);
    setGuessFinished(false);
    setDetectiveCaseIndex(0);
    setDetectiveSelectedAnswer(null);
    setDetectiveChecked(false);
    setDetectiveScore(0);
    setDetectiveCompleted(false);
    setDetectiveShowHint(false);
    setStoryRoundIndex(0);
    setStorySelectedAnswer(null);
    setStoryChecked(false);
    setStoryScore(0);
    setStoryShowHint(false);
    setStoryFinished(false);
    setWordMatchIndex(0);
    setWordMatchAnswer(null);
    setWordMatchChecked(false);
    setWordMatchScore(0);
    setWordMatchFinished(false);
  };

  const checkSentenceScramble = () => {
    if (
      !sentenceScrambleActivity ||
      scrambleSelectedWordIndexes.length === 0 ||
      scrambleChecked
    ) {
      return;
    }
    playFeedback(isScrambleAnswerCorrect ? "success" : "error");
    if (isScrambleAnswerCorrect) {
      setScrambleScore((score) => score + 1);
    }
    setScrambleChecked(true);
  };

  const advanceSentenceScramble = () => {
    if (!scrambleChecked) return;
    if (scrambleQuestionIndex + 1 >= sentenceScrambleActivities.length) {
      setScrambleFinished(true);
      return;
    }
    setScrambleQuestionIndex((index) => index + 1);
    setScrambleSelectedWordIndexes([]);
    setScrambleChecked(false);
  };

  const restartSentenceScramble = () => {
    setScrambleQuestionIndex(0);
    setScrambleSelectedWordIndexes([]);
    setScrambleChecked(false);
    setScrambleScore(0);
    setScrambleFinished(false);
  };

  const restartEnglishQuizQuestions = () => {
    setQuizProblemIndex(0);
    setSelectedQuizAnswer(null);
    setQuizChecked(false);
    setQuizFinished(false);
    setEnglishScore(0);
  };

  const checkGuessAnswer = () => {
    if (!guessQuestion || !guessSelectedAnswer || guessChecked) return;
    const correct = guessSelectedAnswer === guessQuestion.answer;
    playFeedback(correct ? "success" : "error");
    if (correct) setGuessScore((score) => score + 1);
    setGuessChecked(true);
  };

  const advanceGuessQuestion = () => {
    if (!guessChecked) return;
    if (guessQuestionIndex + 1 >= guessQuestions.length) {
      setGuessFinished(true);
      return;
    }
    setGuessQuestionIndex((index) => index + 1);
    setGuessSelectedAnswer(null);
    setGuessChecked(false);
  };

  const restartGuessGame = () => {
    setGuessQuestionIndex(0);
    setGuessSelectedAnswer(null);
    setGuessChecked(false);
    setGuessScore(0);
    setGuessFinished(false);
  };

  const checkDetectiveAnswer = () => {
    if (
      !detectiveCase ||
      !detectiveSelectedAnswer ||
      detectiveChecked
    ) {
      return;
    }
    const correct = detectiveSelectedAnswer === detectiveCase.answer;
    playFeedback(correct ? "success" : "error");
    if (correct) setDetectiveScore((score) => score + 1);
    setDetectiveChecked(true);
  };

  const advanceDetectiveCase = () => {
    if (!detectiveChecked) return;
    if (detectiveCaseIndex + 1 >= detectiveCases.length) {
      setDetectiveCompleted(true);
      return;
    }
    setDetectiveCaseIndex((index) => index + 1);
    setDetectiveSelectedAnswer(null);
    setDetectiveChecked(false);
    setDetectiveShowHint(false);
  };

  const restartSentenceDetective = () => {
    setDetectiveCaseIndex(0);
    setDetectiveSelectedAnswer(null);
    setDetectiveChecked(false);
    setDetectiveScore(0);
    setDetectiveCompleted(false);
    setDetectiveShowHint(false);
  };

  const checkStoryPredictionAnswer = () => {
    if (
      !storyPredictionRound ||
      !storySelectedAnswer ||
      storyChecked
    ) {
      return;
    }
    const correct = storySelectedAnswer === storyPredictionRound.answer;
    playFeedback(correct ? "success" : "error");
    if (correct) setStoryScore((score) => score + 1);
    setStoryChecked(true);
  };

  const advanceStoryPrediction = () => {
    if (!storyChecked) return;
    if (storyRoundIndex + 1 >= storyPredictionRounds.length) {
      setStoryFinished(true);
      return;
    }
    setStoryRoundIndex((index) => index + 1);
    setStorySelectedAnswer(null);
    setStoryChecked(false);
    setStoryShowHint(false);
  };

  const restartStoryPrediction = () => {
    setStoryRoundIndex(0);
    setStorySelectedAnswer(null);
    setStoryChecked(false);
    setStoryScore(0);
    setStoryShowHint(false);
    setStoryFinished(false);
  };

  const checkWordMatchAnswer = () => {
    if (!wordMatchRound || !wordMatchAnswer || wordMatchChecked) return;
    const correct = wordMatchAnswer === wordMatchRound.answer;
    playFeedback(correct ? "success" : "error");
    if (correct) setWordMatchScore((score) => score + 1);
    setWordMatchChecked(true);
  };

  const advanceWordMatch = () => {
    if (!wordMatchChecked) return;
    if (wordMatchIndex + 1 >= wordMatchRounds.length) {
      setWordMatchFinished(true);
      return;
    }
    setWordMatchIndex((index) => index + 1);
    setWordMatchAnswer(null);
    setWordMatchChecked(false);
  };

  const restartWordMatch = () => {
    setWordMatchIndex(0);
    setWordMatchAnswer(null);
    setWordMatchChecked(false);
    setWordMatchScore(0);
    setWordMatchFinished(false);
  };

  const checkEnglishAnswer = () => {
    if (!englishQuiz || !selectedQuizAnswer || quizChecked) return;
    const correct = selectedQuizAnswer === englishQuiz.correctAnswer;
    playFeedback(correct ? "success" : "error");
    if (correct) {
      setEnglishScore((score) => score + 1);
    }
    setQuizChecked(true);
  };

  const restartEnglishAdventure = () => {
    const firstLesson = englishLessons[0];
    if (firstLesson) openEnglishLesson(firstLesson);
  };

  const startScienceLesson = (index: number) => {
    setScienceLessonIndex(index);
    setScienceActivityIndex(0);
    setScienceQuestionIndex(0);
    setScienceSelectedAnswer(null);
    setScienceChecked(false);
    setScienceCorrectAnswers(new Set());
    setScienceFinished(false);
  };

  const returnToScienceLessons = () => {
    setScienceLessonIndex(null);
    setScienceActivityIndex(0);
    setScienceQuestionIndex(0);
    setScienceSelectedAnswer(null);
    setScienceChecked(false);
    setScienceFinished(false);
  };

  const checkScienceAnswer = () => {
    if (
      !scienceQuestion ||
      !scienceSelectedAnswer ||
      scienceChecked ||
      scienceLessonIndex === null
    ) {
      return;
    }

    const answerKey = `${scienceLessonIndex}-${scienceActivityIndex}-${scienceQuestionIndex}`;
    const correct = scienceSelectedAnswer === scienceQuestion.answer;
    playFeedback(correct ? "success" : "error");
    setScienceCorrectAnswers((answers) => {
      const updatedAnswers = new Set(answers);
      if (correct) {
        updatedAnswers.add(answerKey);
      } else {
        updatedAnswers.delete(answerKey);
      }
      return updatedAnswers;
    });
    setScienceChecked(true);
  };

  const advanceScienceQuestion = () => {
    if (!scienceLesson || !scienceActivity || !scienceChecked) return;
    setScienceSelectedAnswer(null);
    setScienceChecked(false);

    if (scienceQuestionIndex + 1 < scienceActivity.questions.length) {
      setScienceQuestionIndex((index) => index + 1);
    } else if (scienceActivityIndex + 1 < scienceLesson.activities.length) {
      setScienceActivityIndex((index) => index + 1);
      setScienceQuestionIndex(0);
    } else {
      setScienceFinished(true);
    }
  };

  const restartScienceQuestions = () => {
    setScienceActivityIndex(0);
    setScienceQuestionIndex(0);
    setScienceSelectedAnswer(null);
    setScienceChecked(false);
    setScienceCorrectAnswers(new Set());
    setScienceFinished(false);
  };

  const goToPreviousScienceQuestion = () => {
    if (scienceQuestionIndex > 0) {
      setScienceQuestionIndex((index) => index - 1);
    } else if (scienceLesson && scienceActivityIndex > 0) {
      const previousActivityIndex = scienceActivityIndex - 1;
      const previousActivity = scienceLesson.activities[previousActivityIndex];
      if (!previousActivity) return;
      setScienceActivityIndex(previousActivityIndex);
      setScienceQuestionIndex(previousActivity.questions.length - 1);
    } else {
      returnToScienceLessons();
      return;
    }
    setScienceSelectedAnswer(null);
    setScienceChecked(false);
  };

  const startHealthLesson = (index: number) => {
    setHealthLessonIndex(index);
    setHealthActivityIndex(0);
    setHealthQuestionIndex(0);
    setHealthSelectedAnswer(null);
    setHealthChecked(false);
    setHealthCorrectAnswers(new Set());
    setHealthFinished(false);
  };

  const returnToHealthLessons = () => {
    setHealthLessonIndex(null);
    setHealthActivityIndex(0);
    setHealthQuestionIndex(0);
    setHealthSelectedAnswer(null);
    setHealthChecked(false);
    setHealthFinished(false);
  };

  const checkHealthAnswer = () => {
    if (
      !healthQuestion ||
      !healthSelectedAnswer ||
      healthChecked ||
      healthLessonIndex === null
    ) {
      return;
    }
    const answerKey = `${healthLessonIndex}-${healthActivityIndex}-${healthQuestionIndex}`;
    const correct = healthSelectedAnswer === healthQuestion.answer;
    playFeedback(correct ? "success" : "error");
    setHealthCorrectAnswers((answers) => {
      const updatedAnswers = new Set(answers);
      if (correct) {
        updatedAnswers.add(answerKey);
      } else {
        updatedAnswers.delete(answerKey);
      }
      return updatedAnswers;
    });
    setHealthChecked(true);
  };

  const advanceHealthQuestion = () => {
    if (!healthLesson || !healthActivity || !healthChecked) return;
    setHealthSelectedAnswer(null);
    setHealthChecked(false);

    if (healthQuestionIndex + 1 < healthActivity.questions.length) {
      setHealthQuestionIndex((index) => index + 1);
    } else if (healthActivityIndex + 1 < healthLesson.activities.length) {
      setHealthActivityIndex((index) => index + 1);
      setHealthQuestionIndex(0);
    } else {
      setHealthFinished(true);
    }
  };

  const restartHealthQuestions = () => {
    setHealthActivityIndex(0);
    setHealthQuestionIndex(0);
    setHealthSelectedAnswer(null);
    setHealthChecked(false);
    setHealthCorrectAnswers(new Set());
    setHealthFinished(false);
  };

  const goToPreviousHealthQuestion = () => {
    if (healthQuestionIndex > 0) {
      setHealthQuestionIndex((index) => index - 1);
    } else if (healthLesson && healthActivityIndex > 0) {
      const previousActivityIndex = healthActivityIndex - 1;
      const previousActivity = healthLesson.activities[previousActivityIndex];
      if (!previousActivity) return;
      setHealthActivityIndex(previousActivityIndex);
      setHealthQuestionIndex(previousActivity.questions.length - 1);
    } else {
      returnToHealthLessons();
      return;
    }
    setHealthSelectedAnswer(null);
    setHealthChecked(false);
  };

  const goBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedLesson(null);
    setSelectedEnglishLesson(null);
    returnToScienceLessons();
    returnToHealthLessons();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>📖</Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Grade 3 Learning Board</Text>
            <Text style={styles.subtitle}>Learn something new every day!</Text>
          </View>
        </View>

        {!selectedSubject ? (
          <>
            {onBack ? (
              <Pressable
                accessibilityRole="button"
                onPress={onBack}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </Pressable>
            ) : null}
            <View style={styles.welcome}>
              <View style={styles.welcomeCopy}>
                <Text style={styles.welcomeTitle}>Hi, Young Learner! 🌟</Text>
                <Text style={styles.bodyText}>
                  Choose your favorite subject and explore exciting lessons
                  made just for you.
                </Text>
              </View>
              <Text style={styles.welcomeEmoji}>🦉</Text>
            </View>

            <Text style={styles.sectionTitle}>📚 Explore Your Subjects</Text>
            <View style={styles.subjectGrid}>
              {subjects.map((subject) => (
                <Pressable
                  accessibilityRole="button"
                  key={subject.name}
                  onPress={() => {
                    setSelectedEnglishLesson(null);
                    setSelectedLesson(null);
                    returnToScienceLessons();
                    returnToHealthLessons();
                    setSelectedSubject(subject);
                  }}
                  style={[styles.subjectCard, { backgroundColor: subject.color }]}
                >
                  <Text style={styles.subjectEmoji}>{subject.emoji}</Text>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <Text style={styles.subjectDescription}>
                    {subject.name === "English"
                      ? englishLessons.length
                      : subject.lessons.length}{" "}
                    exciting lessons
                  </Text>
                  <Text style={styles.explore}>Explore lessons →</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : selectedSubject.name === "Mathematics" ? (
          <GradeThreeMathScreen onBack={goBackToSubjects} />
        ) : selectedSubject.name === "Science" ? (
          scienceFinished ? (
            <>
              <View style={styles.scienceCompletionCard}>
                <Text style={styles.scienceCompletionEmoji}>🏆</Text>
                <Text style={styles.scienceTitle}>Lesson Complete!</Text>
                <Text style={styles.bodyText}>
                  You finished {scienceLesson?.title ?? "your Science lesson"}.
                </Text>
                <Text style={styles.scienceScore}>
                  Your score: {scienceScore} / {scienceLessonQuestionCount}
                </Text>
                <Text style={styles.bodyText}>
                  Keep exploring and learning, Little Scientist!
                </Text>
                <View style={styles.practiceActions}>
                  {scienceLessonIndex !== null &&
                  scienceLessonIndex + 1 < scienceLessons.length ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        startScienceLesson(scienceLessonIndex + 1)
                      }
                      style={styles.practicePrimaryButton}
                    >
                      <Text style={styles.practicePrimaryButtonText}>
                        Next Lesson →
                      </Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      if (scienceLessonIndex !== null) {
                        startScienceLesson(scienceLessonIndex);
                      }
                    }}
                    style={styles.practiceSecondaryButton}
                  >
                    <Text style={styles.practiceSecondaryButtonText}>
                      ↻ Try This Lesson Again
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={returnToScienceLessons}
                    style={styles.practiceSecondaryButton}
                  >
                    <Text style={styles.practiceSecondaryButtonText}>
                      Back to Lessons
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          ) : !scienceLesson || !scienceActivity || !scienceQuestion ? (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={goBackToSubjects}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Back to Subjects</Text>
              </Pressable>
              <View style={styles.subjectHeading}>
                <Text style={styles.subjectHeadingEmoji}>🔬</Text>
                <View style={styles.subjectHeadingCopy}>
                  <Text style={styles.subjectHeadingTitle}>
                    Science Adventure
                  </Text>
                  <Text style={styles.mutedText}>
                    Choose a lesson to start exploring.
                  </Text>
                </View>
              </View>
              <View style={styles.lessonList}>
                {scienceLessons.map((lesson, index) => (
                  <Pressable
                    accessibilityRole="button"
                    key={lesson.title}
                    onPress={() => startScienceLesson(index)}
                    style={styles.lessonCard}
                  >
                    <Text style={styles.lessonNumber}>{index + 1}</Text>
                    <View style={styles.lessonCopy}>
                      <Text style={styles.lessonName}>
                        {lesson.emoji} {lesson.title}
                      </Text>
                      <Text style={styles.mutedText}>
                        {lesson.activities.length} activities
                      </Text>
                    </View>
                    <Text style={styles.lessonArrow}>Start →</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.scienceTopRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={returnToScienceLessons}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>← All Lessons</Text>
                </Pressable>
                <Text style={styles.scienceScorePill}>
                  ⭐ Score: {scienceScore}
                </Text>
              </View>
              <View
                style={[
                  styles.scienceHeader,
                  scienceLesson.title === "Parts of Plants" &&
                    styles.plantScienceHeader,
                ]}
              >
                <Text style={styles.scienceEyebrow}>
                  LEARN · PLAY · DISCOVER
                </Text>
                <Text
                  style={[
                    styles.scienceTitle,
                    scienceLesson.title === "Parts of Plants" &&
                      styles.plantScienceTitle,
                  ]}
                >
                  {scienceLesson.emoji} {scienceLesson.title}
                </Text>
                <Text style={styles.bodyText}>
                  Explore the world one activity at a time!
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${scienceProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.mutedText}>
                  Lesson {scienceLessonIndex! + 1} of {scienceLessons.length} ·
                  Activity {scienceActivityIndex + 1} of{" "}
                  {scienceLesson.activities.length}
                </Text>
              </View>
              {scienceLesson.title === "Parts of Plants" ? (
                <View style={styles.plantExplorer}>
                  <View style={styles.plantScene}>
                    <Text style={styles.plantSun}>☀️</Text>
                    <Text style={[styles.plantCloud, styles.plantCloudOne]}>
                      ☁️
                    </Text>
                    <Text style={[styles.plantCloud, styles.plantCloudTwo]}>
                      ☁️
                    </Text>
                    <View style={styles.plantIllustration}>
                      <Text style={styles.plantFlower}>🌸</Text>
                      <Text style={styles.plantLeaves}>🍃</Text>
                      <Text style={styles.plantStem}>│</Text>
                      <Text style={styles.plantGround}>━━━━━━━━</Text>
                      <Text style={styles.plantRoots}>╱╲╱╲</Text>
                    </View>
                    <Text style={styles.plantSceneCaption}>
                      🌱 Every part helps the plant grow!
                    </Text>
                  </View>
                  <View style={styles.plantPartsGuide}>
                    <Text style={styles.plantGuideTitle}>
                      🌿 Explore the Parts of a Plant
                    </Text>
                    <Text style={styles.plantGuideSubtitle}>
                      Each part has a special job.
                    </Text>
                    <View style={styles.plantPartsGrid}>
                      {[
                        {
                          name: "Roots",
                          emoji: "🟤",
                          job: "Take in water and hold the plant in the soil.",
                        },
                        {
                          name: "Stem",
                          emoji: "🟩",
                          job: "Supports the plant and carries water.",
                        },
                        {
                          name: "Leaves",
                          emoji: "🍃",
                          job: "Use sunlight to help the plant make food.",
                        },
                        {
                          name: "Flower",
                          emoji: "🌸",
                          job: "Helps the plant make seeds.",
                        },
                        {
                          name: "Fruit",
                          emoji: "🍎",
                          job: "Often protects the seeds inside.",
                        },
                      ].map((part) => (
                        <View key={part.name} style={styles.plantPartCard}>
                          <Text style={styles.plantPartEmoji}>{part.emoji}</Text>
                          <Text style={styles.plantPartName}>{part.name}</Text>
                          <Text style={styles.plantPartJob}>{part.job}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              ) : null}
              <View
                style={[
                  styles.scienceQuestionCard,
                  scienceLesson.title === "Parts of Plants" &&
                    styles.plantQuestionCard,
                ]}
              >
                <Text style={styles.scienceActivityTitle}>
                  {scienceActivity.title}
                </Text>
                <Text style={styles.bodyText}>
                  {scienceActivity.instruction}
                </Text>
                <Text style={styles.scienceQuestionCount}>
                  Question {scienceQuestionIndex + 1} of{" "}
                  {scienceActivity.questions.length}
                </Text>
                <Text style={styles.scienceQuestion}>
                  {scienceQuestion.q}
                </Text>
                <View style={styles.quizOptions}>
                  {scienceQuestion.options.map((option) => {
                    const isSelected = scienceSelectedAnswer === option;
                    const isCorrect = scienceQuestion.answer === option;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{
                          selected: isSelected,
                          disabled: scienceChecked,
                        }}
                        disabled={scienceChecked}
                        key={option}
                        onPress={() => setScienceSelectedAnswer(option)}
                        style={[
                          styles.quizOption,
                          isSelected && styles.quizOptionSelected,
                          scienceChecked &&
                            isCorrect &&
                            styles.quizOptionCorrect,
                          scienceChecked &&
                            isSelected &&
                            !isCorrect &&
                            styles.quizOptionIncorrect,
                        ]}
                      >
                        <Text style={styles.quizOptionText}>
                          {option}
                          {scienceChecked && isCorrect ? "  ✓" : ""}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {scienceChecked ? (
                  <Text
                    style={[
                      styles.practiceFeedback,
                      scienceSelectedAnswer === scienceQuestion.answer
                        ? styles.correctFeedback
                        : styles.retryFeedback,
                    ]}
                    accessibilityLiveRegion="polite"
                  >
                    {scienceSelectedAnswer === scienceQuestion.answer
                      ? `🎉 Correct! ${scienceQuestion.explain}`
                      : `💪 Good try! ${scienceQuestion.explain}`}
                  </Text>
                ) : null}
                <View style={styles.scienceActions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={!scienceSelectedAnswer && !scienceChecked}
                    onPress={
                      scienceChecked
                        ? advanceScienceQuestion
                        : checkScienceAnswer
                    }
                    style={[
                      styles.practicePrimaryButton,
                      !scienceSelectedAnswer &&
                        !scienceChecked &&
                        styles.disabledPracticeButton,
                    ]}
                  >
                    <Text style={styles.practicePrimaryButtonText}>
                      {scienceChecked
                        ? scienceQuestionIndex + 1 <
                          scienceActivity.questions.length
                          ? "Next Question →"
                          : scienceActivityIndex + 1 <
                            scienceLesson.activities.length
                          ? "Next Activity →"
                          : "Finish Lesson 🎉"
                        : "✓ Check Answer"}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={goToPreviousScienceQuestion}
                    style={styles.scienceBackQuestionButton}
                  >
                    <Text style={styles.practiceSecondaryButtonText}>
                      {scienceQuestionIndex === 0 &&
                      scienceActivityIndex === 0
                        ? "← Back to Lessons"
                        : "← Previous Question"}
                    </Text>
                  </Pressable>
                  {scienceActivityIndex > 0 || scienceQuestionIndex > 0 ? (
                    <Pressable
                        accessibilityRole="button"
                        onPress={restartScienceQuestions}
                        style={styles.scienceBackQuestionButton}
                    >
                        <Text style={styles.practiceSecondaryButtonText}>
                          ↺ Back to First Question
                        </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </>
          )
        ) : selectedSubject.name === "Health/PE" ? (
          healthFinished ? (
            <View style={styles.scienceCompletionCard}>
              <Text style={styles.scienceCompletionEmoji}>🏆</Text>
              <Text style={styles.scienceTitle}>Health Lesson Complete!</Text>
              <Text style={styles.bodyText}>
                You finished {healthLesson?.title ?? "your Health/PE lesson"}.
              </Text>
              <Text style={styles.scienceScore}>
                Your score: {healthScore} / {healthLessonQuestionCount}
              </Text>
              <Text style={styles.bodyText}>
                Great work, Health Hero! Keep practicing healthy habits.
              </Text>
              <View style={styles.practiceActions}>
                {healthLessonIndex !== null &&
                healthLessonIndex + 1 < healthLessons.length ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => startHealthLesson(healthLessonIndex + 1)}
                    style={styles.practicePrimaryButton}
                  >
                    <Text style={styles.practicePrimaryButtonText}>
                      Next Lesson →
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    if (healthLessonIndex !== null) {
                      startHealthLesson(healthLessonIndex);
                    }
                  }}
                  style={styles.practiceSecondaryButton}
                >
                  <Text style={styles.practiceSecondaryButtonText}>
                    ↻ Try This Lesson Again
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={returnToHealthLessons}
                  style={styles.practiceSecondaryButton}
                >
                  <Text style={styles.practiceSecondaryButtonText}>
                    Back to Lessons
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : !healthLesson || !healthActivity || !healthQuestion ? (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={goBackToSubjects}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>← Back to Subjects</Text>
              </Pressable>
              <View style={styles.subjectHeading}>
                <Text style={styles.subjectHeadingEmoji}>🏃</Text>
                <View style={styles.subjectHeadingCopy}>
                  <Text style={styles.subjectHeadingTitle}>
                    Health/PE Adventure
                  </Text>
                  <Text style={styles.mutedText}>
                    Choose a lesson to start exploring.
                  </Text>
                </View>
              </View>
              <View style={styles.lessonList}>
                {healthLessons.map((lesson, index) => (
                  <Pressable
                    accessibilityRole="button"
                    key={lesson.title}
                    onPress={() => startHealthLesson(index)}
                    style={styles.lessonCard}
                  >
                    <Text style={styles.lessonNumber}>{index + 1}</Text>
                    <View style={styles.lessonCopy}>
                      <Text style={styles.lessonName}>
                        {lesson.emoji} {lesson.title}
                      </Text>
                      <Text style={styles.mutedText}>
                        {lesson.activities.length} activities
                      </Text>
                    </View>
                    <Text style={styles.lessonArrow}>Start →</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.scienceTopRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={returnToHealthLessons}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>← All Lessons</Text>
                </Pressable>
                <Text style={styles.scienceScorePill}>
                  ⭐ Score: {healthScore}
                </Text>
              </View>
              <View style={styles.scienceHeader}>
                <Text style={styles.scienceEyebrow}>
                  LEARN · PLAY · STAY HEALTHY
                </Text>
                <Text style={styles.scienceTitle}>
                  {healthLesson.emoji} {healthLesson.title}
                </Text>
                <Text style={styles.bodyText}>
                  Make healthy choices and become a Health Hero!
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${healthProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.mutedText}>
                  Lesson {healthLessonIndex! + 1} of {healthLessons.length} ·
                  Activity {healthActivityIndex + 1} of{" "}
                  {healthLesson.activities.length}
                </Text>
              </View>
              <View style={styles.scienceQuestionCard}>
                <Text style={styles.scienceActivityTitle}>
                  {healthActivity.title}
                </Text>
                <Text style={styles.bodyText}>
                  {healthActivity.instruction}
                </Text>
                <Text style={styles.scienceQuestionCount}>
                  Question {healthQuestionIndex + 1} of{" "}
                  {healthActivity.questions.length}
                </Text>
                <Text style={styles.scienceQuestion}>{healthQuestion.q}</Text>
                <View style={styles.quizOptions}>
                  {healthQuestion.options.map((option) => {
                    const isSelected = healthSelectedAnswer === option;
                    const isCorrect = healthQuestion.answer === option;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{
                          selected: isSelected,
                          disabled: healthChecked,
                        }}
                        disabled={healthChecked}
                        key={option}
                        onPress={() => setHealthSelectedAnswer(option)}
                        style={[
                          styles.quizOption,
                          isSelected && styles.quizOptionSelected,
                          healthChecked &&
                            isCorrect &&
                            styles.quizOptionCorrect,
                          healthChecked &&
                            isSelected &&
                            !isCorrect &&
                            styles.quizOptionIncorrect,
                        ]}
                      >
                        <Text style={styles.quizOptionText}>
                          {option}
                          {healthChecked && isCorrect ? "  ✓" : ""}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {healthChecked ? (
                  <Text
                    style={[
                      styles.practiceFeedback,
                      healthSelectedAnswer === healthQuestion.answer
                        ? styles.correctFeedback
                        : styles.retryFeedback,
                    ]}
                    accessibilityLiveRegion="polite"
                  >
                    {healthSelectedAnswer === healthQuestion.answer
                      ? `🎉 Correct! ${healthQuestion.explain}`
                      : `💪 Good try! ${healthQuestion.explain}`}
                  </Text>
                ) : null}
                <View style={styles.scienceActions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={!healthSelectedAnswer && !healthChecked}
                    onPress={
                      healthChecked
                        ? advanceHealthQuestion
                        : checkHealthAnswer
                    }
                    style={[
                      styles.practicePrimaryButton,
                      !healthSelectedAnswer &&
                        !healthChecked &&
                        styles.disabledPracticeButton,
                    ]}
                  >
                    <Text style={styles.practicePrimaryButtonText}>
                      {healthChecked
                        ? healthQuestionIndex + 1 <
                          healthActivity.questions.length
                          ? "Next Question →"
                          : healthActivityIndex + 1 <
                            healthLesson.activities.length
                          ? "Next Activity →"
                          : "Finish Lesson 🎉"
                        : "✓ Check Answer"}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={goToPreviousHealthQuestion}
                    style={styles.scienceBackQuestionButton}
                  >
                    <Text style={styles.practiceSecondaryButtonText}>
                      {healthQuestionIndex === 0 && healthActivityIndex === 0
                        ? "← Back to Lessons"
                        : "← Previous Question"}
                    </Text>
                  </Pressable>
                  {healthActivityIndex > 0 || healthQuestionIndex > 0 ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={restartHealthQuestions}
                      style={styles.scienceBackQuestionButton}
                    >
                      <Text style={styles.practiceSecondaryButtonText}>
                        ↺ Back to First Question
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </>
          )
        ) : !selectedLesson && !selectedEnglishLesson ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={goBackToSubjects}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back to Subjects</Text>
            </Pressable>

            <View style={styles.subjectHeading}>
              <Text style={styles.subjectHeadingEmoji}>
                {selectedSubject.emoji}
              </Text>
              <View style={styles.subjectHeadingCopy}>
                <Text style={styles.subjectHeadingTitle}>
                  {selectedSubject.name}
                </Text>
                <Text style={styles.mutedText}>Choose a lesson to begin!</Text>
              </View>
            </View>

            <View style={styles.lessonList}>
              {englishLessons.map((lesson, index) => (
                <Pressable
                  accessibilityRole="button"
                  key={lesson.id}
                  onPress={() => openEnglishLesson(lesson)}
                  style={styles.lessonCard}
                >
                  <Text style={styles.lessonNumber}>{index + 1}</Text>
                  <View style={styles.lessonCopy}>
                    <Text style={styles.lessonName}>{lesson.title}</Text>
                    <Text style={styles.mutedText}>{lesson.description}</Text>
                  </View>
                  <Text style={styles.lessonArrow}>Start →</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : selectedEnglishLesson ? (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={clearEnglishLesson}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back to English Lessons</Text>
            </Pressable>

            <View style={styles.lessonContent}>
              <Text style={styles.bigEmoji}>{selectedEnglishLesson.emoji}</Text>
              <Text style={styles.subjectLabel}>English</Text>
              <Text style={styles.lessonTitle}>
                {selectedEnglishLesson.title}
              </Text>
              <Text style={styles.bodyText}>
                {selectedEnglishLesson.description}
              </Text>

              <View style={styles.activityBox}>
                <Text style={styles.activityTitle}>
                  {selectedEnglishLesson.storyTitle}
                </Text>
                <Text style={styles.bodyText}>
                  {selectedEnglishLesson.storyLine}
                </Text>
              </View>

              {sentenceScrambleActivities.length > 0 ? (
                <View style={styles.practiceCard}>
                  <Text style={styles.practiceHeading}>
                    🧩 Noun and Pronoun Sentence Scramble
                  </Text>
                  {scrambleFinished ? (
                    <>
                      <Text style={styles.practiceTitle}>
                        🎉 Sentence Scramble Complete!
                      </Text>
                      <Text style={styles.bodyText}>
                        You built {scrambleScore} of{" "}
                        {sentenceScrambleActivities.length} sentences correctly.
                      </Text>
                      <View style={styles.practiceActions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={restartSentenceScramble}
                          style={styles.practicePrimaryButton}
                        >
                          <Text style={styles.practicePrimaryButtonText}>
                            ↻ Play Again
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  ) : sentenceScrambleActivity ? (
                    <>
                      <Text style={styles.mutedText}>
                        Sentence {scrambleQuestionIndex + 1} of{" "}
                        {sentenceScrambleActivities.length} · ⭐ Score:{" "}
                        {scrambleScore}
                      </Text>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${
                                (scrambleQuestionIndex /
                                  sentenceScrambleActivities.length) *
                                100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.practiceTitle}>
                        💭 {sentenceScrambleActivity.question}
                      </Text>
                      <Text style={styles.practiceLabel}>YOUR SENTENCE</Text>
                      <View style={styles.practiceWords}>
                        {scrambleSelectedWordIndexes.length === 0 ? (
                          <Text style={styles.mutedText}>
                            Tap the word cards below to build your sentence.
                          </Text>
                        ) : (
                          scrambleSelectedWordIndexes.map((wordIndex) => (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityLabel={`Remove ${sentenceScrambleActivity.scrambled[wordIndex]}`}
                              disabled={scrambleChecked}
                              key={wordIndex}
                              onPress={() =>
                                setScrambleSelectedWordIndexes((indexes) =>
                                  indexes.filter((index) => index !== wordIndex)
                                )
                              }
                              style={styles.placedPracticeWord}
                            >
                              <Text style={styles.practiceWordText}>
                                {sentenceScrambleActivity.scrambled[wordIndex]}
                              </Text>
                            </Pressable>
                          ))
                        )}
                      </View>
                      <Text style={styles.practiceLabel}>WORD CARDS</Text>
                      <View style={styles.practiceWords}>
                        {sentenceScrambleActivity.scrambled.map((word, wordIndex) => {
                          if (scrambleSelectedWordIndexes.includes(wordIndex)) {
                            return null;
                          }
                          return (
                            <Pressable
                              accessibilityRole="button"
                              disabled={scrambleChecked}
                              key={`${sentenceScrambleActivity.id}-${wordIndex}`}
                              onPress={() =>
                                setScrambleSelectedWordIndexes((indexes) => [
                                  ...indexes,
                                  wordIndex,
                                ])
                              }
                              style={styles.practiceWord}
                            >
                              <Text style={styles.practiceWordText}>{word}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      {scrambleChecked ? (
                        <Text
                          style={[
                            styles.practiceFeedback,
                            isScrambleAnswerCorrect
                              ? styles.correctFeedback
                              : styles.retryFeedback,
                          ]}
                          accessibilityLiveRegion="polite"
                        >
                          {isScrambleAnswerCorrect
                            ? `🎉 Correct! ${sentenceScrambleActivity.explanation}`
                            : `💡 Not quite. ${sentenceScrambleActivity.explanation} Correct sentence: ${sentenceScrambleActivity.answer.join(" ")}`}
                          {"\n"}Noun: {sentenceScrambleActivity.noun}
                          {sentenceScrambleActivity.pronoun
                            ? ` · Pronoun: ${sentenceScrambleActivity.pronoun}`
                            : ""}
                        </Text>
                      ) : null}
                      <View style={styles.practiceActions}>
                        {!scrambleChecked ? (
                          <>
                            <Pressable
                              accessibilityRole="button"
                              disabled={scrambleSelectedWordIndexes.length === 0}
                              onPress={() => setScrambleSelectedWordIndexes([])}
                              style={[
                                styles.practiceSecondaryButton,
                                scrambleSelectedWordIndexes.length === 0 &&
                                  styles.disabledPracticeButton,
                              ]}
                            >
                              <Text style={styles.practiceSecondaryButtonText}>
                                Clear Sentence
                              </Text>
                            </Pressable>
                            <Pressable
                              accessibilityRole="button"
                              disabled={scrambleSelectedWordIndexes.length === 0}
                              onPress={checkSentenceScramble}
                              style={[
                                styles.practicePrimaryButton,
                                scrambleSelectedWordIndexes.length === 0 &&
                                  styles.disabledPracticeButton,
                              ]}
                            >
                              <Text style={styles.practicePrimaryButtonText}>
                                ✓ Check Sentence
                              </Text>
                            </Pressable>
                          </>
                        ) : (
                          <Pressable
                            accessibilityRole="button"
                            onPress={advanceSentenceScramble}
                            style={styles.practicePrimaryButton}
                          >
                            <Text style={styles.practicePrimaryButtonText}>
                              {scrambleQuestionIndex + 1 <
                              sentenceScrambleActivities.length
                                ? "Next Sentence →"
                                : "Finish Activity 🏁"}
                            </Text>
                          </Pressable>
                        )}
                        {scrambleQuestionIndex > 0 ? (
                          <Pressable
                            accessibilityRole="button"
                            onPress={restartSentenceScramble}
                            style={styles.practiceSecondaryButton}
                          >
                            <Text style={styles.practiceSecondaryButtonText}>
                              ↺ Back to First Question
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </>
                  ) : null}
                </View>
              ) : null}

              {detectiveCases.length > 0 ? (
                <View style={styles.practiceCard}>
                  <Text style={styles.practiceHeading}>
                    🕵️ Sentence Detective
                  </Text>
                  {detectiveCompleted ? (
                    <>
                      <Text style={styles.practiceTitle}>
                        🏆 Great Detective Work!
                      </Text>
                      <Text style={styles.bodyText}>
                        You completed all the sentence construction cases.
                      </Text>
                      <Text style={styles.scienceScore}>
                        {detectiveScore}/{detectiveCases.length} Correct Answers
                      </Text>
                      <Text style={styles.bodyText}>
                        {detectiveScore === detectiveCases.length
                          ? "🌟 Master Detective!"
                          : detectiveScore / detectiveCases.length >= 0.6
                            ? "🔎 Excellent Investigation!"
                            : "💪 Keep Practicing!"}
                      </Text>
                      <View style={styles.practiceActions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={restartSentenceDetective}
                          style={styles.practicePrimaryButton}
                        >
                          <Text style={styles.practicePrimaryButtonText}>
                            🔄 Solve Cases Again
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  ) : detectiveCase ? (
                    <>
                      <Text style={styles.mutedText}>
                        📁 Case {detectiveCaseIndex + 1} of{" "}
                        {detectiveCases.length} · ⭐ Score: {detectiveScore}
                      </Text>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${
                                ((detectiveCaseIndex +
                                  (detectiveChecked ? 1 : 0)) /
                                  detectiveCases.length) *
                                100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.lessonTip}>
                        <Text style={styles.activityTitle}>
                          🔍 Case #{detectiveCaseIndex + 1}
                        </Text>
                        <Text style={styles.practiceTitle}>
                          {detectiveCase.question}
                        </Text>
                        <Text style={styles.practiceLabel}>🧩 EVIDENCE</Text>
                        <Text style={styles.practicePrompt}>
                          {detectiveCase.displayText}
                        </Text>
                        <Text style={styles.bodyText}>
                          Examine the clues and select the correct answer.
                        </Text>
                      </View>
                      <View style={styles.quizOptions}>
                        {detectiveCase.choices.map((choice, index) => {
                          const isSelected = detectiveSelectedAnswer === choice;
                          const isAnswer = choice === detectiveCase.answer;
                          return (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{
                                selected: isSelected,
                                disabled: detectiveChecked,
                              }}
                              disabled={detectiveChecked}
                              key={`${detectiveCase.id}-${choice}`}
                              onPress={() =>
                                setDetectiveSelectedAnswer(choice)
                              }
                              style={[
                                styles.quizOption,
                                isSelected && styles.quizOptionSelected,
                                detectiveChecked &&
                                  isAnswer &&
                                  styles.quizOptionCorrect,
                                detectiveChecked &&
                                  isSelected &&
                                  !isAnswer &&
                                  styles.quizOptionIncorrect,
                              ]}
                            >
                              <Text style={styles.quizOptionText}>
                                {String.fromCharCode(65 + index)}. {choice}
                                {detectiveChecked && isAnswer ? "  ✓" : ""}
                                {detectiveChecked &&
                                isSelected &&
                                !isAnswer
                                  ? "  ✗"
                                  : ""}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      {detectiveChecked ? (
                        <Text
                          style={[
                            styles.practiceFeedback,
                            detectiveSelectedAnswer === detectiveCase.answer
                              ? styles.correctFeedback
                              : styles.retryFeedback,
                          ]}
                          accessibilityLiveRegion="polite"
                        >
                          {detectiveSelectedAnswer === detectiveCase.answer
                            ? "🎉 Mystery Solved! Correct! You found the right answer."
                            : `🧐 Keep Investigating! The correct answer is: ${detectiveCase.answer}`}
                          {"\n"}
                          {detectiveCase.explanation}
                        </Text>
                      ) : null}
                      {detectiveShowHint && !detectiveChecked ? (
                        <Text style={styles.practiceFeedback}>
                          💡 Detective Hint: {detectiveCase.explanation}
                        </Text>
                      ) : null}
                      <View style={styles.practiceActions}>
                        {!detectiveChecked ? (
                          <>
                            <Pressable
                              accessibilityRole="button"
                              onPress={() =>
                                setDetectiveShowHint((showHint) => !showHint)
                              }
                              style={styles.practiceSecondaryButton}
                            >
                              <Text style={styles.practiceSecondaryButtonText}>
                                💡{" "}
                                {detectiveShowHint
                                  ? "Hide Hint"
                                  : "Get a Hint"}
                              </Text>
                            </Pressable>
                            <Pressable
                              accessibilityRole="button"
                              disabled={!detectiveSelectedAnswer}
                              onPress={checkDetectiveAnswer}
                              style={[
                                styles.practicePrimaryButton,
                                !detectiveSelectedAnswer &&
                                  styles.disabledPracticeButton,
                              ]}
                            >
                              <Text style={styles.practicePrimaryButtonText}>
                                🔎 Check Answer
                              </Text>
                            </Pressable>
                          </>
                        ) : (
                          <Pressable
                            accessibilityRole="button"
                            onPress={advanceDetectiveCase}
                            style={styles.practicePrimaryButton}
                          >
                            <Text style={styles.practicePrimaryButtonText}>
                              {detectiveCaseIndex + 1 === detectiveCases.length
                                ? "🏁 Finish Investigation"
                                : "➡️ Next Case"}
                            </Text>
                          </Pressable>
                        )}
                        {detectiveCaseIndex > 0 ? (
                          <Pressable
                            accessibilityRole="button"
                            onPress={restartSentenceDetective}
                            style={styles.practiceSecondaryButton}
                          >
                            <Text style={styles.practiceSecondaryButtonText}>
                              ↺ Back to First Question
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                      <Text style={styles.mutedText}>
                        📝 Remember: Start sentences with capital letters and
                        use the correct word order and punctuation.
                      </Text>
                    </>
                  ) : null}
                </View>
              ) : null}

              {guessQuestions.length > 0 ? (
                <View style={styles.practiceCard}>
                  <Text style={styles.practiceHeading}>🔎 Guess the Word!</Text>
                  {guessFinished ? (
                    <>
                      <Text style={styles.practiceTitle}>
                        🎉 Guess the Word Complete!
                      </Text>
                      <Text style={styles.bodyText}>
                        You guessed {guessScore} of {guessQuestions.length} words
                        correctly.
                      </Text>
                      <View style={styles.practiceActions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={restartGuessGame}
                          style={styles.practicePrimaryButton}
                        >
                          <Text style={styles.practicePrimaryButtonText}>
                            ↻ Play Again
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  ) : guessQuestion ? (
                    <>
                      <Text style={styles.mutedText}>
                        Question {guessQuestionIndex + 1} of{" "}
                        {guessQuestions.length} · ⭐ Score: {guessScore}
                      </Text>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${
                                (guessQuestionIndex / guessQuestions.length) *
                                100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.practicePrompt}>
                        <Text style={styles.bigEmoji}>{guessQuestion.emoji}</Text>
                        <Text style={styles.practiceTitle}>
                          {guessQuestion.type === "verb" ? "VERB" : "ADJECTIVE"}
                        </Text>
                        <Text style={styles.bodyText}>{guessQuestion.clue}</Text>
                      </View>
                      <Text style={styles.practiceTitle}>
                        {guessQuestion.sentence}
                      </Text>
                      <View style={styles.quizOptions}>
                        {guessQuestion.choices.map((option) => {
                          const isSelected = guessSelectedAnswer === option;
                          const isCorrect = guessQuestion.answer === option;
                          return (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{
                                selected: isSelected,
                                disabled: guessChecked,
                              }}
                              disabled={guessChecked}
                              key={option}
                              onPress={() => setGuessSelectedAnswer(option)}
                              style={[
                                styles.quizOption,
                                isSelected && styles.quizOptionSelected,
                                guessChecked &&
                                  isCorrect &&
                                  styles.quizOptionCorrect,
                                guessChecked &&
                                  isSelected &&
                                  !isCorrect &&
                                  styles.quizOptionIncorrect,
                              ]}
                            >
                              <Text style={styles.quizOptionText}>{option}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      {guessChecked ? (
                        <Text
                          style={[
                            styles.practiceFeedback,
                            guessSelectedAnswer === guessQuestion.answer
                              ? styles.correctFeedback
                              : styles.retryFeedback,
                          ]}
                          accessibilityLiveRegion="polite"
                        >
                          {guessSelectedAnswer === guessQuestion.answer
                            ? `🎉 Correct! ${guessQuestion.explanation}`
                            : `💡 The answer is ${guessQuestion.answer}. ${guessQuestion.explanation}`}
                        </Text>
                      ) : null}
                      <View style={styles.practiceActions}>
                        {!guessChecked ? (
                          <Pressable
                            accessibilityRole="button"
                            disabled={!guessSelectedAnswer}
                            onPress={checkGuessAnswer}
                            style={[
                              styles.practicePrimaryButton,
                              !guessSelectedAnswer &&
                                styles.disabledPracticeButton,
                            ]}
                          >
                            <Text style={styles.practicePrimaryButtonText}>
                              ✓ Guess the Word
                            </Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            accessibilityRole="button"
                            onPress={advanceGuessQuestion}
                            style={styles.practicePrimaryButton}
                          >
                            <Text style={styles.practicePrimaryButtonText}>
                              {guessQuestionIndex + 1 < guessQuestions.length
                                ? "Next Word →"
                                : "Finish Game 🎉"}
                            </Text>
                          </Pressable>
                        )}
                        {guessQuestionIndex > 0 ? (
                          <Pressable
                            accessibilityRole="button"
                            onPress={restartGuessGame}
                            style={styles.practiceSecondaryButton}
                          >
                            <Text style={styles.practiceSecondaryButtonText}>
                              ↺ Back to First Question
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </>
                  ) : null}
                </View>
              ) : null}

              {storyPredictionRounds.length > 0 ? (
                <View style={styles.practiceCard}>
                  <Text style={styles.practiceHeading}>
                    📖 What Happens Next?
                  </Text>
                  {storyFinished ? (
                    <>
                      <Text style={styles.practiceTitle}>
                        🎉 Adventure Complete!
                      </Text>
                      <Text style={styles.bodyText}>
                        You got {storyScore} of {storyPredictionRounds.length}{" "}
                        predictions correct.
                      </Text>
                      <Text style={styles.scienceScore}>
                        {Math.round(
                          (storyScore / storyPredictionRounds.length) * 100
                        )}
                        % Final Score
                      </Text>
                      <Text style={styles.bodyText}>
                        {storyScore / storyPredictionRounds.length >= 0.8
                          ? "🏆 Amazing! You are becoming a wonderful story detective!"
                          : storyScore / storyPredictionRounds.length >= 0.6
                            ? "🌟 Good job! Keep practicing your predictions."
                            : "📚 Good effort! Read the clues carefully and try again."}
                      </Text>
                      <View style={styles.practiceActions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={restartStoryPrediction}
                          style={styles.practicePrimaryButton}
                        >
                          <Text style={styles.practicePrimaryButtonText}>
                            ↻ Play Again
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  ) : storyPredictionRound ? (
                    <>
                      <Text style={styles.mutedText}>
                        🔎 Story {storyRoundIndex + 1} of{" "}
                        {storyPredictionRounds.length} · ⭐ Score: {storyScore}
                      </Text>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${
                                (storyRoundIndex /
                                  storyPredictionRounds.length) *
                                100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.lessonTip}>
                        <Text style={styles.bigEmoji}>
                          {storyPredictionRound.emoji}
                        </Text>
                        <Text style={styles.activityTitle}>
                          {storyPredictionRound.title}
                        </Text>
                        <Text style={styles.bodyText}>
                          {storyPredictionRound.story}
                        </Text>
                      </View>
                      <Text style={styles.practiceTitle}>
                        {storyPredictionRound.question}
                      </Text>
                      <View style={styles.quizOptions}>
                        {storyPredictionRound.choices.map((choice) => {
                          const isSelected = storySelectedAnswer === choice;
                          const isAnswer = choice === storyPredictionRound.answer;
                          return (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{
                                selected: isSelected,
                                disabled: storyChecked,
                              }}
                              disabled={storyChecked}
                              key={`${storyPredictionRound.id}-${choice}`}
                              onPress={() => setStorySelectedAnswer(choice)}
                              style={[
                                styles.quizOption,
                                isSelected && styles.quizOptionSelected,
                                storyChecked &&
                                  isAnswer &&
                                  styles.quizOptionCorrect,
                                storyChecked &&
                                  isSelected &&
                                  !isAnswer &&
                                  styles.quizOptionIncorrect,
                              ]}
                            >
                              <Text style={styles.quizOptionText}>{choice}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      {storyChecked ? (
                        <Text
                          style={[
                            styles.practiceFeedback,
                            storySelectedAnswer === storyPredictionRound.answer
                              ? styles.correctFeedback
                              : styles.retryFeedback,
                          ]}
                          accessibilityLiveRegion="polite"
                        >
                          {storySelectedAnswer === storyPredictionRound.answer
                            ? `🎉 Correct! ${storyPredictionRound.explanation}`
                            : `💡 The answer is: ${storyPredictionRound.answer}. ${storyPredictionRound.explanation}`}
                        </Text>
                      ) : null}
                      {storyShowHint && !storyChecked ? (
                        <Text style={styles.practiceFeedback}>
                          💡 Hint: {storyPredictionRound.hint}
                        </Text>
                      ) : null}
                      <View style={styles.practiceActions}>
                        {!storyChecked ? (
                          <>
                            <Pressable
                              accessibilityRole="button"
                              onPress={() =>
                                setStoryShowHint((showHint) => !showHint)
                              }
                              style={styles.practiceSecondaryButton}
                            >
                              <Text style={styles.practiceSecondaryButtonText}>
                                💡{" "}
                                {storyShowHint ? "Hide Hint" : "Get a Hint"}
                              </Text>
                            </Pressable>
                            <Pressable
                              accessibilityRole="button"
                              disabled={!storySelectedAnswer}
                              onPress={checkStoryPredictionAnswer}
                              style={[
                                styles.practicePrimaryButton,
                                !storySelectedAnswer &&
                                  styles.disabledPracticeButton,
                              ]}
                            >
                              <Text style={styles.practicePrimaryButtonText}>
                                🔎 Check Answer
                              </Text>
                            </Pressable>
                          </>
                        ) : (
                          <Pressable
                            accessibilityRole="button"
                            onPress={advanceStoryPrediction}
                            style={styles.practicePrimaryButton}
                          >
                            <Text style={styles.practicePrimaryButtonText}>
                              {storyRoundIndex + 1 ===
                              storyPredictionRounds.length
                                ? "🏁 Finish Adventure"
                                : "➡️ Next Story"}
                            </Text>
                          </Pressable>
                        )}
                        {storyRoundIndex > 0 ? (
                          <Pressable
                            accessibilityRole="button"
                            onPress={restartStoryPrediction}
                            style={styles.practiceSecondaryButton}
                          >
                            <Text style={styles.practiceSecondaryButtonText}>
                              ↺ Back to First Question
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </>
                  ) : null}
                </View>
              ) : null}

              {wordMatchRounds.length > 0 ? (
                <View style={styles.practiceCard}>
                  <Text style={styles.practiceHeading}>
                    🔤 Word Match Adventure
                  </Text>
                  {wordMatchFinished ? (
                    <>
                      <Text style={styles.practiceTitle}>
                        🏆 Word Match Complete!
                      </Text>
                      <Text style={styles.bodyText}>
                        You matched {wordMatchScore} of {wordMatchRounds.length}{" "}
                        words correctly.
                      </Text>
                      <Text style={styles.scienceScore}>
                        {Math.round(
                          (wordMatchScore / wordMatchRounds.length) * 100
                        )}
                        % Final Score
                      </Text>
                      <View style={styles.practiceActions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={restartWordMatch}
                          style={styles.practicePrimaryButton}
                        >
                          <Text style={styles.practicePrimaryButtonText}>
                            ↻ Play Again
                          </Text>
                        </Pressable>
                      </View>
                    </>
                  ) : wordMatchRound ? (
                    <>
                      <Text style={styles.mutedText}>
                        🗺️ Match {wordMatchIndex + 1} of {wordMatchRounds.length}
                        {" · "}⭐ Score: {wordMatchScore}
                      </Text>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${
                                (wordMatchIndex / wordMatchRounds.length) * 100
                              }%`,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.lessonTip}>
                        <Text style={styles.practiceLabel}>WORD CLUE</Text>
                        <Text style={styles.practicePrompt}>
                          {wordMatchRound.displayText}
                        </Text>
                        <Text style={styles.practiceTitle}>
                          {wordMatchRound.question}
                        </Text>
                      </View>
                      <Text style={styles.bodyText}>
                        Choose the word that matches the meaning.
                      </Text>
                      <View style={styles.quizOptions}>
                        {wordMatchRound.choices.map((choice, index) => {
                          const isSelected = wordMatchAnswer === choice;
                          const isAnswer = choice === wordMatchRound.answer;
                          return (
                            <Pressable
                              accessibilityRole="button"
                              accessibilityState={{
                                selected: isSelected,
                                disabled: wordMatchChecked,
                              }}
                              disabled={wordMatchChecked}
                              key={`${wordMatchRound.id}-${choice}`}
                              onPress={() => setWordMatchAnswer(choice)}
                              style={[
                                styles.quizOption,
                                isSelected && styles.quizOptionSelected,
                                wordMatchChecked &&
                                  isAnswer &&
                                  styles.quizOptionCorrect,
                                wordMatchChecked &&
                                  isSelected &&
                                  !isAnswer &&
                                  styles.quizOptionIncorrect,
                              ]}
                            >
                              <Text style={styles.quizOptionText}>
                                {String.fromCharCode(65 + index)}. {choice}
                                {wordMatchChecked && isAnswer ? "  ✓" : ""}
                                {wordMatchChecked && isSelected && !isAnswer
                                  ? "  ✗"
                                  : ""}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      {wordMatchChecked ? (
                        <Text
                          style={[
                            styles.practiceFeedback,
                            wordMatchAnswer === wordMatchRound.answer
                              ? styles.correctFeedback
                              : styles.retryFeedback,
                          ]}
                          accessibilityLiveRegion="polite"
                        >
                          {wordMatchAnswer === wordMatchRound.answer
                            ? `🎉 Great match! ${wordMatchRound.explanation}`
                            : `💡 The matching word is ${wordMatchRound.answer}. ${wordMatchRound.explanation}`}
                        </Text>
                      ) : null}
                      <View style={styles.practiceActions}>
                        {!wordMatchChecked ? (
                          <Pressable
                            accessibilityRole="button"
                            disabled={!wordMatchAnswer}
                            onPress={checkWordMatchAnswer}
                            style={[
                              styles.practicePrimaryButton,
                              !wordMatchAnswer &&
                                styles.disabledPracticeButton,
                            ]}
                          >
                            <Text style={styles.practicePrimaryButtonText}>
                              ✓ Check Match
                            </Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            accessibilityRole="button"
                            onPress={advanceWordMatch}
                            style={styles.practicePrimaryButton}
                          >
                            <Text style={styles.practicePrimaryButtonText}>
                              {wordMatchIndex + 1 === wordMatchRounds.length
                                ? "🏁 Finish Adventure"
                                : "➡️ Next Match"}
                            </Text>
                          </Pressable>
                        )}
                        {wordMatchIndex > 0 ? (
                          <Pressable
                            accessibilityRole="button"
                            onPress={restartWordMatch}
                            style={styles.practiceSecondaryButton}
                          >
                            <Text style={styles.practiceSecondaryButtonText}>
                              ↺ Back to First Question
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </>
                  ) : null}
                </View>
              ) : null}

              {selectedEnglishLesson.id !== "grammar-1" &&
              selectedEnglishLesson.id !== "grammar-2" &&
              selectedEnglishLesson.id !== "grammar-3" &&
              selectedEnglishLesson.id !== "fluency-1" &&
              selectedEnglishLesson.id !== "vocabulary-1" ? (
                <View style={styles.lessonTip}>
                  <Text style={styles.activityTitle}>
                    {selectedEnglishLesson.rememberTitle}
                  </Text>
                  <Text style={styles.bodyText}>
                    {selectedEnglishLesson.rememberText}
                  </Text>
                  <Text style={styles.lessonExample}>
                    Example: {selectedEnglishLesson.example}
                  </Text>
                </View>
              ) : null}

              {selectedEnglishLesson.id !== "grammar-1" &&
              selectedEnglishLesson.id !== "grammar-2" &&
              selectedEnglishLesson.id !== "grammar-3" &&
              selectedEnglishLesson.id !== "fluency-1" &&
              selectedEnglishLesson.id !== "vocabulary-1" ? (
              <View style={styles.practiceCard}>
                <Text style={styles.practiceHeading}>Practice</Text>
                {quizFinished ? (
                  <>
                    <Text style={styles.practiceTitle}>
                      🎉 English Adventure Complete!
                    </Text>
                    <Text style={styles.bodyText}>
                      You answered {englishScore} of {totalEnglishQuestions} questions correctly.
                    </Text>
                    <View style={styles.practiceActions}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={restartEnglishAdventure}
                        style={styles.practicePrimaryButton}
                      >
                        <Text style={styles.practicePrimaryButtonText}>
                          ↻ Play Again
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={clearEnglishLesson}
                        style={styles.practiceSecondaryButton}
                      >
                        <Text style={styles.practiceSecondaryButtonText}>
                          Back to Lessons
                        </Text>
                      </Pressable>
                    </View>
                  </>
                ) : englishQuiz ? (
                  <>
                    <Text style={styles.mutedText}>
                      Score: {englishScore} · Problem{" "}
                      {questionsBeforeCurrentLesson + quizProblemIndex + 1} of{" "}
                      {totalEnglishQuestions}
                    </Text>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${englishProgress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.practicePrompt}>
                      {englishQuiz.displayText}
                    </Text>
                    <Text style={styles.practiceTitle}>
                      {englishQuiz.prompt}
                    </Text>
                    <View style={styles.quizOptions}>
                      {englishQuiz.options.map((option) => {
                        const isCorrect = option === englishQuiz.correctAnswer;
                        const isSelected = option === selectedQuizAnswer;
                        return (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            disabled={quizChecked}
                            key={option}
                            onPress={() => setSelectedQuizAnswer(option)}
                            style={[
                              styles.quizOption,
                              isSelected && styles.quizOptionSelected,
                              quizChecked &&
                                isCorrect &&
                                styles.quizOptionCorrect,
                              quizChecked &&
                                isSelected &&
                                !isCorrect &&
                                styles.quizOptionIncorrect,
                            ]}
                          >
                            <Text style={styles.quizOptionText}>{option}</Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {quizChecked ? (
                      <Text
                        style={[
                          styles.practiceFeedback,
                          selectedQuizAnswer === englishQuiz.correctAnswer
                            ? styles.correctFeedback
                            : styles.retryFeedback,
                        ]}
                        accessibilityLiveRegion="polite"
                      >
                        {selectedQuizAnswer === englishQuiz.correctAnswer
                          ? `🎉 Correct! ${englishQuiz.hint}`
                          : `Not quite. The correct answer is ${englishQuiz.correctAnswer}. ${englishQuiz.hint}`}
                      </Text>
                    ) : null}
                    <View style={styles.practiceActions}>
                      {!quizChecked ? (
                        <Pressable
                          accessibilityRole="button"
                          disabled={!selectedQuizAnswer}
                          onPress={checkEnglishAnswer}
                          style={[
                            styles.practicePrimaryButton,
                            !selectedQuizAnswer &&
                              styles.disabledPracticeButton,
                          ]}
                        >
                          <Text style={styles.practicePrimaryButtonText}>
                            ✓ Check Answer
                          </Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          accessibilityRole="button"
                          onPress={advanceEnglishQuiz}
                          style={styles.practicePrimaryButton}
                        >
                          <Text style={styles.practicePrimaryButtonText}>
                            {quizProblemIndex + 1 < englishQuizzes.length
                              ? "Next Problem →"
                              : selectedEnglishLessonIndex + 1 < englishLessons.length
                                ? "Next Lesson →"
                                : "Finish Adventure"}
                          </Text>
                        </Pressable>
                      )}
                      <Pressable
                        accessibilityRole="button"
                        disabled={quizChecked}
                        onPress={() => setSelectedQuizAnswer(null)}
                        style={[
                          styles.practiceSecondaryButton,
                          quizChecked && styles.disabledPracticeButton,
                        ]}
                      >
                        <Text style={styles.practiceSecondaryButtonText}>
                          Clear Answer
                        </Text>
                      </Pressable>
                      {quizProblemIndex > 0 ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={restartEnglishQuizQuestions}
                          style={styles.practiceSecondaryButton}
                        >
                          <Text style={styles.practiceSecondaryButtonText}>
                            ↺ Back to First Question
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </>
                ) : (
                  <Text style={styles.bodyText}>
                    This lesson does not have practice questions yet.
                  </Text>
                )}
              </View>
              ) : null}
            </View>
          </>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedLesson(null)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back to Lessons</Text>
            </Pressable>

            <View style={styles.lessonContent}>
              <Text style={styles.bigEmoji}>{selectedSubject.emoji}</Text>
              <Text style={styles.subjectLabel}>{selectedSubject.name}</Text>
              <Text style={styles.lessonTitle}>{selectedLesson}</Text>
              <Text style={styles.bodyText}>
                Welcome to this lesson! Get ready to explore, practice, and
                discover something new.
              </Text>

              <View style={styles.activityBox}>
                <Text style={styles.activityEmoji}>⭐</Text>
                <Text style={styles.activityTitle}>Learning Time!</Text>
                <Text style={styles.bodyText}>
                  Read your lesson carefully, ask questions, and practice what
                  you learn.
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => setSelectedLesson(null)}
                style={styles.finishButton}
              >
                <Text style={styles.finishButtonText}>Finish Lesson</Text>
              </Pressable>
            </View>
          </>
        )}

        <Text style={styles.footer}>
          🌈 Keep learning, keep growing, Grade 3 superstars!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    width: "100%",
    maxWidth: 1150,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  logoText: {
    fontSize: 32,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: "#3155A4",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#71809A",
    marginTop: 4,
  },
  welcome: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#E6EEFC",
    marginBottom: 28,
  },
  welcomeCopy: {
    flex: 1,
  },
  welcomeTitle: {
    color: "#263654",
    fontSize: 23,
    fontWeight: "800",
    marginBottom: 8,
  },
  welcomeEmoji: {
    fontSize: 56,
  },
  bodyText: {
    color: "#526078",
    fontSize: 15,
    lineHeight: 23,
  },
  sectionTitle: {
    color: "#263654",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 16,
  },
  subjectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  subjectCard: {
    flexGrow: 1,
    flexBasis: 230,
    minHeight: 190,
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  subjectEmoji: {
    fontSize: 38,
    marginBottom: 8,
  },
  subjectName: {
    color: "#263654",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 6,
  },
  subjectDescription: {
    color: "#526078",
  },
  explore: {
    color: "#3155A4",
    fontWeight: "700",
    marginTop: 12,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#3155A4",
    marginBottom: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  subjectHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },
  subjectHeadingEmoji: {
    fontSize: 44,
  },
  subjectHeadingCopy: {
    flex: 1,
  },
  subjectHeadingTitle: {
    color: "#263654",
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 4,
  },
  mutedText: {
    color: "#71809A",
  },
  lessonList: {
    gap: 12,
  },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E7EDF7",
    backgroundColor: "#FFFFFF",
  },
  lessonNumber: {
    minWidth: 38,
    height: 38,
    overflow: "hidden",
    textAlign: "center",
    textAlignVertical: "center",
    borderRadius: 12,
    backgroundColor: "#E6EDFF",
    color: "#3155A4",
    fontWeight: "800",
    paddingTop: 9,
  },
  lessonName: {
    flex: 1,
    color: "#263654",
    fontWeight: "700",
  },
  lessonCopy: {
    flex: 1,
    gap: 5,
  },
  lessonArrow: {
    color: "#3155A4",
    fontWeight: "700",
  },
  lessonContent: {
    alignItems: "center",
    padding: 28,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
  },
  bigEmoji: {
    fontSize: 58,
    marginBottom: 8,
  },
  subjectLabel: {
    color: "#6479B5",
    fontWeight: "700",
  },
  lessonTitle: {
    color: "#263654",
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 12,
  },
  activityBox: {
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    padding: 22,
    borderRadius: 18,
    backgroundColor: "#FFF2D5",
    marginVertical: 22,
  },
  lessonTip: {
    width: "100%",
    maxWidth: 500,
    padding: 22,
    borderRadius: 18,
    backgroundColor: "#EAF2FF",
  },
  lessonExample: {
    color: "#3155A4",
    fontWeight: "700",
    lineHeight: 23,
    marginTop: 12,
  },
  practiceCard: {
    width: "100%",
    maxWidth: 600,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#F7F9FF",
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#E4EAFA",
  },
  scienceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  scienceScorePill: {
    overflow: "hidden",
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: "#FFF2C6",
    color: "#745616",
    fontWeight: "800",
  },
  scienceHeader: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },
  plantScienceHeader: {
    backgroundColor: "#F7FCF5",
    borderWidth: 1,
    borderColor: "#D8ECD5",
  },
  plantScienceTitle: {
    color: "#185B35",
  },
  plantExplorer: {
    width: "100%",
    marginBottom: 18,
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#F7FCF5",
  },
  plantScene: {
    minHeight: 255,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: "#D9F2DB",
    borderWidth: 1,
    borderColor: "#C5E6C3",
  },
  plantSun: {
    position: "absolute",
    top: 14,
    right: 22,
    fontSize: 36,
  },
  plantCloud: {
    position: "absolute",
    fontSize: 31,
    opacity: 0.8,
  },
  plantCloudOne: {
    top: 24,
    left: "14%",
  },
  plantCloudTwo: {
    top: 54,
    right: "16%",
    fontSize: 25,
  },
  plantIllustration: {
    zIndex: 1,
    alignItems: "center",
    marginTop: 18,
    lineHeight: 1,
  },
  plantFlower: {
    fontSize: 54,
  },
  plantLeaves: {
    marginTop: -5,
    fontSize: 42,
  },
  plantStem: {
    height: 28,
    color: "#258746",
    fontSize: 43,
    fontWeight: "900",
    lineHeight: 24,
  },
  plantGround: {
    color: "#805A35",
    fontSize: 18,
    letterSpacing: -3,
  },
  plantRoots: {
    color: "#9C7147",
    fontSize: 22,
    fontWeight: "900",
  },
  plantSceneCaption: {
    zIndex: 1,
    marginTop: 10,
    marginBottom: 14,
    color: "#315D36",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  plantPartsGuide: {
    marginTop: 22,
  },
  plantGuideTitle: {
    color: "#185B35",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  plantGuideSubtitle: {
    color: "#65756A",
  },
  plantPartsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  plantPartCard: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 120,
    padding: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8ECD5",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
  },
  plantPartEmoji: {
    fontSize: 29,
    marginBottom: 7,
  },
  plantPartName: {
    color: "#185B35",
    fontWeight: "800",
    textAlign: "center",
  },
  plantPartJob: {
    marginTop: 5,
    color: "#617267",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  scienceEyebrow: {
    color: "#397C69",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  scienceTitle: {
    color: "#243047",
    fontSize: 25,
    fontWeight: "800",
  },
  scienceQuestionCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#E4EAF2",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  plantQuestionCard: {
    borderColor: "#D7EAD1",
  },
  scienceActivityTitle: {
    color: "#315AA3",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },
  scienceQuestionCount: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 24,
  },
  scienceQuestion: {
    color: "#243047",
    fontSize: 21,
    lineHeight: 30,
    fontWeight: "800",
    marginVertical: 14,
  },
  scienceActions: {
    gap: 10,
    marginTop: 18,
  },
  scienceBackQuestionButton: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "#D5DEE9",
    borderRadius: 13,
    backgroundColor: "#E8EFFF",
  },
  scienceCompletionCard: {
    alignItems: "center",
    padding: 26,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  scienceCompletionEmoji: {
    fontSize: 66,
    marginBottom: 14,
  },
  scienceScore: {
    color: "#268B68",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 16,
    marginBottom: 10,
  },
  practiceHeading: {
    color: "#3155A4",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 14,
  },
  practiceTitle: {
    color: "#263654",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 25,
    marginBottom: 8,
  },
  practicePrompt: {
    color: "#263654",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
    textAlign: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#FFF2D5",
    marginVertical: 14,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DDE5F7",
    marginTop: 10,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#3155A4",
  },
  practiceLabel: {
    color: "#71809A",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 10,
  },
  practiceWords: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  practiceWord: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#C8D7FF",
    backgroundColor: "#E8EFFF",
  },
  practiceWordSelected: {
    borderColor: "#3155A4",
    backgroundColor: "#D9E5FF",
  },
  placedPracticeWord: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#A7DFB7",
    backgroundColor: "#E0F5E6",
  },
  practiceWordText: {
    color: "#294B97",
    fontWeight: "700",
  },
  practiceZones: {
    gap: 12,
    marginTop: 16,
  },
  practiceZone: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CAD6ED",
    backgroundColor: "#FFFDF7",
  },
  practiceZoneTitle: {
    color: "#263654",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  placeWordButton: {
    alignSelf: "flex-start",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#3155A4",
    marginTop: 12,
  },
  placeWordButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  disabledPracticeButton: {
    opacity: 0.45,
  },
  practiceFeedback: {
    padding: 13,
    borderRadius: 12,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 16,
  },
  correctFeedback: {
    color: "#27673B",
    backgroundColor: "#E0F5E6",
  },
  retryFeedback: {
    color: "#875B0B",
    backgroundColor: "#FFF0D7",
  },
  practiceActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  practicePrimaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: "#3155A4",
  },
  practicePrimaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  practiceSecondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 11,
    backgroundColor: "#E8EFFF",
  },
  practiceSecondaryButtonText: {
    color: "#3155A4",
    fontWeight: "700",
  },
  quizOptions: {
    gap: 9,
    marginTop: 8,
  },
  quizOption: {
    padding: 13,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E8F8",
    backgroundColor: "#FFFFFF",
  },
  quizOptionSelected: {
    borderColor: "#527FE0",
    backgroundColor: "#EDF3FF",
  },
  quizOptionCorrect: {
    borderColor: "#68B57D",
    backgroundColor: "#E0F5E6",
  },
  quizOptionIncorrect: {
    borderColor: "#E0A34B",
    backgroundColor: "#FFF0D7",
  },
  quizOptionText: {
    color: "#263654",
    fontWeight: "600",
  },
  activityEmoji: {
    fontSize: 32,
  },
  activityTitle: {
    color: "#263654",
    fontSize: 19,
    fontWeight: "800",
    marginVertical: 8,
  },
  finishButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#3155A4",
  },
  finishButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  footer: {
    color: "#71809A",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 32,
  },
});
