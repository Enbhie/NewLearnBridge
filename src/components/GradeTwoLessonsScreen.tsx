import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { gradeTwoLessonQuizBanks } from "../data/gradeTwoLessonQuizBanks";
import {
  gradeTwoQuizBanks,
  type LessonDifficulty,
  type QuizQuestion,
} from "../data/gradeTwoQuizBanks";
import type { CategoryId } from "../data/learningContent";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import { AppAppearanceContext } from "./CloudBackdrop";
import LessonInstructionModal from "./LessonInstructionModal";
import GradeTwoMiniGame, {
  gradeTwoMiniGameInfo,
  type GradeTwoMiniGameId,
} from "./GradeTwoMiniGames";

export type { LessonDifficulty } from "../data/gradeTwoQuizBanks";

type Lesson = {
  id: string;
  miniGame: GradeTwoMiniGameId;
  title: string;
  overview: string;
  topics: string[];
};

type Subject = {
  id: CategoryId;
  title: string;
  emoji: string;
  lessons: Lesson[];
};

const subjects: Subject[] = [
  {
    id: "reading",
    title: "Reading Comprehension",
    emoji: "📖",
    lessons: [
      {
        id: "story-elements",
        miniGame: "clue-detective",
        title: "Quarter 1: Phonemic Awareness and Story Elements",
        overview: "Listen for sounds, connect letters with phonemes, and explore stories and words.",
        topics: [
          "Connect English and Filipino letters with their sounds; identify sounds heard in the environment.",
          "Identify characters, setting, theme, and events in a story.",
          "Recognize common and proper nouns, articles (a/an), and action verbs.",
        ],
      },
      {
        id: "text-features",
        miniGame: "story-squeeze",
        title: "Quarter 2: Text Features and Sequence",
        overview: "Use book parts and story clues to understand what you read and what may happen next.",
        topics: [
          "Identify the cover, title page, author, and illustrator.",
          "Sequence events with first, next, and last; predict outcomes using illustrations and clues.",
          "Build word knowledge with word families, synonyms, and antonyms.",
        ],
      },
      {
        id: "critical-thinking",
        miniGame: "emotion-echo",
        title: "Quarter 3: Critical Thinking and Text Types",
        overview: "Use details to make inferences, tell facts from make-believe, and read with expression.",
        topics: [
          "Answer who, what, where, when, and why questions about passages.",
          "Distinguish factual information from make-believe stories.",
          "Practice choral speaking and echo reading with short poems, rhymes, and stories.",
        ],
      },
      {
        id: "independent-reading",
        miniGame: "book-explorer",
        title: "Quarter 4: Independent Reading and Application",
        overview: "Read short words and stories, notice grammar patterns, and write about what you read.",
        topics: [
          "Read short-vowel CVC and sight words, phrases, and short stories.",
          "Use this/that/these/those and prepositions such as on, under, and in.",
          "Write simple sentences or short responses about characters and illustrations.",
        ],
      },
    ],
  },
  {
    id: "math",
    title: "Math",
    emoji: "🔢",
    lessons: [
      {
        id: "place-value",
        miniGame: "place-value-rocket",
        title: "Quarter 1: Whole Numbers and Place Value",
        overview: "Represent, read, compare, and order whole numbers through 1,000.",
        topics: [
          "Visualize and count numbers up to 1,000; read and write numerals and number words.",
          "Understand ones, tens, and hundreds and compare numbers with >, <, and =.",
          "Skip-count by 2s, 5s, 10s, and 100s.",
        ],
      },
      {
        id: "operations",
        miniGame: "snack-shop",
        title: "Quarter 2: Addition and Subtraction",
        overview: "Choose a strategy to add and subtract larger numbers and solve everyday word problems.",
        topics: [
          "Add 2-digit to 3-digit numbers with or without regrouping.",
          "Subtract 2-digit from 3-digit numbers with or without regrouping.",
          "Use mental addition and subtraction; solve one- and two-step problems, including money.",
        ],
      },
      {
        id: "multiplication-fractions",
        miniGame: "array-garden",
        title: "Quarter 3: Multiplication, Division, and Fractions",
        overview: "Explore equal groups, arrays, sharing, repeated subtraction, and unit fractions.",
        topics: [
          "Build multiplication foundations with repeated addition, equal groups, arrays, and multiples of 2, 3, 4, 5, and 10.",
          "Explore division by sharing equally and subtracting equal groups repeatedly.",
          "Identify unit fractions from one-half through one-tenth.",
        ],
      },
      {
        id: "measurement-geometry-data",
        miniGame: "measurement-studio",
        title: "Quarter 4: Measurement, Geometry, and Data",
        overview: "Read time and money, measure objects, classify shapes, and make sense of data.",
        topics: [
          "Tell time in minutes (a.m./p.m.) on analog and digital clocks; read Philippine pesos and centavos.",
          "Measure length, mass, and capacity using standard units such as meters, centimeters, grams, and kilograms.",
          "Identify half-circles, quarter-circles, and 3D shapes; collect and represent data in scaled pictographs and bar graphs.",
        ],
      },
    ],
  },
  {
    id: "science",
    title: "Science",
    emoji: "🌱",
    lessons: [
      {
        id: "life-science",
        miniGame: "eco-sorter",
        title: "Living Things and Their Environment",
        overview: "Learn how bodies use their senses and how plants and animals meet their needs.",
        topics: [
          "Identify body parts and senses; practice personal hygiene and healthy habits.",
          "Explore the basic needs and habitats of plants and animals.",
          "Practice caring for pets, domestic animals, plants, and the surrounding environment.",
        ],
      },
      {
        id: "matter-physical-world",
        miniGame: "state-changer",
        title: "Matter and the Physical World",
        overview: "Describe materials and notice everyday sources of light, sound, and heat.",
        topics: [
          "Observe objects by shape, size, color, texture, and state (solid or liquid).",
          "Identify natural light sources such as the Sun and everyday energy or sound around home and school.",
        ],
      },
      {
        id: "earth-sky",
        miniGame: "sky-splitter",
        title: "Earth and Sky",
        overview: "Observe local weather and recognize landforms and bodies of water nearby.",
        topics: [
          "Identify sunny, rainy, windy, and cloudy weather and choose suitable clothing or activities.",
          "Recognize landforms and bodies of water in local communities.",
        ],
      },
    ],
  },
];

export const gradeTwoLessonCount = subjects.reduce(
  (count, subject) => count + subject.lessons.length,
  0
);

function getLessonProgressId(subject: Subject, lesson: Lesson): string {
  return `grade:2:online:${subject.id}:${lesson.id}`;
}

const difficultyLabels: Record<LessonDifficulty, string> = {
  easy: "Easy",
  standard: "Standard",
  challenge: "Challenge",
};

type MiniGameCheckpoint = "none" | "mid-quiz" | "end-quiz";

function LessonQuestionChallenge({
  questions,
  difficulty,
  darkMode,
  questionIndex,
  onQuestionIndexChange,
  onCheckpoint,
}: {
  questions: QuizQuestion[];
  difficulty: LessonDifficulty;
  darkMode: boolean;
  questionIndex: number;
  onQuestionIndexChange: (questionIndex: number) => void;
  onCheckpoint: (checkpoint: Exclude<MiniGameCheckpoint, "none">) => void;
}) {
  const [selectedOption, setSelectedOption] = useState("");
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [feedback, setFeedback] = useState("");
  const question = questions[questionIndex];
  const levelOffset = difficulty === "easy" ? 0 : difficulty === "standard" ? 1 : 2;
  const answerIndex = question.options.indexOf(question.answer);
  const answerDisplayIndex = (questionIndex + levelOffset) % question.options.length;
  const optionOffset =
    (answerDisplayIndex - answerIndex + question.options.length) % question.options.length;
  const displayedOptions = [
    ...question.options.slice(optionOffset),
    ...question.options.slice(0, optionOffset),
  ];
  const isLastQuestion = questionIndex === questions.length - 1;

  const chooseOption = (option: string) => {
    setSelectedOption(option);
    if (option === question.answer) {
      setAnsweredCorrectly(true);
      setFeedback("Great job! That's correct! ⭐");
    } else {
      setAnsweredCorrectly(false);
      setFeedback("Not quite right. Try again!");
    }
  };

  const continueChallenge = () => {
    if (isLastQuestion) {
      onCheckpoint("end-quiz");
      return;
    }
    if (questionIndex === 4) {
      onCheckpoint("mid-quiz");
      return;
    }
    onQuestionIndexChange(questionIndex + 1);
    setSelectedOption("");
    setAnsweredCorrectly(false);
    setFeedback("");
  };

  return (
    <View style={[styles.questionCard, darkMode && styles.darkCard]}>
      <View style={styles.questionHeading}>
        <Text style={[styles.cardTitle, darkMode && styles.darkText]}>
          🎯 {difficultyLabels[difficulty]} Challenge
        </Text>
        <Text style={[styles.questionCount, darkMode && styles.darkMutedText]}>
          {questionIndex + 1} / {questions.length}
        </Text>
      </View>
      <View style={styles.questionProgress}>
        {questions.map((_, index) => (
          <View
            key={index}
            style={[
              styles.questionProgressDot,
              index <= questionIndex && styles.questionProgressDotActive,
            ]}
          />
        ))}
      </View>
      <Text style={[styles.questionPrompt, darkMode && styles.darkText]}>
        {question.prompt}
      </Text>
      <View style={styles.answerOptions}>
        {displayedOptions.map((option) => {
          const selected = selectedOption === option;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={option}
              onPress={() => chooseOption(option)}
              style={({ pressed }) => [
                styles.answerOption,
                darkMode && styles.darkAnswerOption,
                selected && (answeredCorrectly ? styles.correctAnswer : styles.incorrectAnswer),
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.answerOptionText, darkMode && styles.darkText]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {feedback ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            styles.questionFeedback,
            answeredCorrectly ? styles.correctFeedback : styles.retryFeedback,
          ]}
        >
          {feedback}
        </Text>
      ) : null}
      {answeredCorrectly ? (
        <Pressable
          accessibilityRole="button"
          onPress={continueChallenge}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Text style={styles.primaryButtonText}>
            {isLastQuestion ? "FINISH LESSON ⭐" : "NEXT QUESTION →"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type Props = {
  difficulty: LessonDifficulty;
  onBack: () => void;
  onMusicCategoryChange: (category: CategoryId | null) => void;
  completedLessonIds: string[];
  lessonProgressReady: boolean;
  onCompleteLesson: (lessonId: string) => void;
};

export default function GradeTwoLessonsScreen({
  difficulty,
  onBack,
  onMusicCategoryChange,
  completedLessonIds,
  lessonProgressReady,
  onCompleteLesson,
}: Props) {
  const { darkMode } = useContext(AppAppearanceContext);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [miniGameCheckpoint, setMiniGameCheckpoint] = useState<MiniGameCheckpoint>("none");
  const [finished, setFinished] = useState(false);
  const previousCompletedRef = useRef(new Set(completedLessonIds));
  const [unlockingLessonId, setUnlockingLessonId] = useState<string | null>(null);
  const unlockFade = useRef(new Animated.Value(1)).current;
  const unlockScale = useRef(new Animated.Value(1)).current;

  const currentLessonId =
    activeSubject && activeLesson
      ? getLessonProgressId(activeSubject, activeLesson)
      : null;
  const isLessonComplete = Boolean(
    currentLessonId && completedLessonIds.includes(currentLessonId)
  );
  const lessonIndex =
    activeSubject && activeLesson
      ? activeSubject.lessons.findIndex((lesson) => lesson.id === activeLesson.id)
      : -1;
  const nextLesson =
    activeSubject && lessonIndex >= 0
      ? activeSubject.lessons[lessonIndex + 1] ?? null
      : null;
  const isLessonLocked =
    !lessonProgressReady ||
    Boolean(
      activeSubject &&
        activeSubject.lessons
          .slice(0, lessonIndex)
          .some(
            (lesson) =>
              !completedLessonIds.includes(getLessonProgressId(activeSubject, lesson))
          )
    );
  const miniGameRound: 1 | 2 | 3 = !assessmentStarted
    ? 1
    : miniGameCheckpoint === "mid-quiz"
      ? 2
      : 3;

  useEffect(() => {
    const newlyCompleted = completedLessonIds.find(
      (lessonId) => !previousCompletedRef.current.has(lessonId)
    );
    previousCompletedRef.current = new Set(completedLessonIds);
    if (!newlyCompleted || !activeSubject) return;

    const completedIndex = activeSubject.lessons.findIndex(
      (lesson) => getLessonProgressId(activeSubject, lesson) === newlyCompleted
    );
    if (completedIndex < 0) return;
    const nextLesson = activeSubject.lessons[completedIndex + 1];
    if (!nextLesson) return;

    setUnlockingLessonId(getLessonProgressId(activeSubject, nextLesson));
  }, [activeSubject, completedLessonIds]);

  useEffect(() => {
    if (!unlockingLessonId || activeLesson) return;
    unlockFade.setValue(0.25);
    unlockScale.setValue(0.94);
    const animation = Animated.parallel([
      Animated.timing(unlockFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(unlockScale, {
          toValue: 1.06,
          useNativeDriver: true,
          speed: 14,
          bounciness: 8,
        }),
        Animated.spring(unlockScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 12,
          bounciness: 4,
        }),
      ]),
    ]);
    animation.start(({ finished: animationFinished }) => {
      if (animationFinished) setUnlockingLessonId(null);
    });
    return () => animation.stop();
  }, [activeLesson, unlockFade, unlockScale, unlockingLessonId]);

  const resetGame = () => {
    setAssessmentStarted(false);
    setCurrentQuestionIndex(0);
    setMiniGameCheckpoint("none");
    setFinished(false);
  };

  const handleBack = () => {
    if (activeLesson) {
      setActiveLesson(null);
      setLessonStarted(false);
      resetGame();
    } else if (activeSubject) {
      setActiveSubject(null);
      onMusicCategoryChange(null);
    } else {
      onMusicCategoryChange(null);
      onBack();
    }
  };

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setLessonStarted(false);
    setAssessmentStarted(false);
    setCurrentQuestionIndex(0);
    setMiniGameCheckpoint("none");
    setFinished(false);
  };

  return (
    <SafeAreaView style={[styles.screen, darkMode && styles.darkScreen]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          activeLesson && styles.lessonScreenContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={[styles.header, darkMode && styles.darkCard]}>
          <Text style={styles.headerIcon}>
            {activeSubject?.emoji ?? "🌈"}
          </Text>
          <Text style={[styles.gradeLabel, darkMode && styles.darkMutedText]}>GRADE 2 ONLINE LESSONS</Text>
          <Text style={[styles.title, darkMode && styles.darkText]}>
            {activeLesson?.title ?? activeSubject?.title ?? "Choose an adventure"}
          </Text>
          <Text style={[styles.subtitle, darkMode && styles.darkMutedText]}>
            {activeLesson
              ? "Learn the idea, play the mini-game, then answer 10 questions!"
              : activeSubject
                ? "Choose a quarter on your learning trail."
                : "Math, reading, and science adventures made for Grade 2."}
          </Text>
        </View>

        {activeLesson && activeSubject ? (
          <View style={styles.lessonContent}>
            {finished ? (
              <View style={[styles.finishCard, darkMode && styles.darkCard]}>
                <Text style={styles.finishEmoji}>⭐</Text>
                <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Level complete!</Text>
                <Text style={[styles.finishHint, darkMode && styles.darkMutedText]}>
                  {difficultyLabels[difficulty]} complete! Great work finishing this quarter.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => startLesson(activeLesson)}
                  style={({ pressed }) => [
                    styles.replayButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.replayButtonText}>↻ PLAY AGAIN</Text>
                </Pressable>
              </View>
            ) : isLessonLocked ? (
              <View style={[styles.lockedCard, darkMode && styles.darkCard]}>
                <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Lesson preview</Text>
                <Text style={[styles.bodyText, darkMode && styles.darkMutedText]}>{activeLesson.overview}</Text>
                <Text style={[styles.hintText, darkMode && styles.darkMutedText]}>
                  {!lessonProgressReady
                    ? "Loading your saved lesson progress..."
                    : "Finish the earlier quarter on this subject trail to play this challenge."}
                </Text>
              </View>
            ) : lessonStarted ? (
              <>
                <View style={[styles.learnCard, darkMode && styles.darkCard]}>
                  <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Learn it</Text>
                  <Text style={[styles.bodyText, darkMode && styles.darkMutedText]}>{activeLesson.overview}</Text>
                  {activeLesson.topics.map((topic) => (
                    <View style={styles.topicRow} key={topic}>
                      <Text style={styles.topicBullet}>•</Text>
                      <Text style={[styles.topicText, darkMode && styles.darkMutedText]}>{topic}</Text>
                    </View>
                  ))}
                </View>
                {assessmentStarted && miniGameCheckpoint === "none" ? (
                  <LessonQuestionChallenge
                    key={`${activeSubject.id}-${activeLesson.miniGame}-${difficulty}`}
                    questions={
                      gradeTwoLessonQuizBanks[activeLesson.miniGame]?.[difficulty] ??
                      gradeTwoQuizBanks[activeSubject.id][difficulty]
                    }
                    difficulty={difficulty}
                    darkMode={darkMode}
                    questionIndex={currentQuestionIndex}
                    onQuestionIndexChange={setCurrentQuestionIndex}
                    onCheckpoint={setMiniGameCheckpoint}
                  />
                ) : (
                  <GradeTwoMiniGame
                    key={`${activeSubject.id}-${activeLesson.miniGame}-${difficulty}-${miniGameRound}`}
                    difficulty={difficulty}
                    game={activeLesson.miniGame}
                    round={miniGameRound}
                    onPassed={() => {
                      if (!assessmentStarted) {
                        setAssessmentStarted(true);
                        return;
                      }

                      if (miniGameCheckpoint === "mid-quiz") {
                        setCurrentQuestionIndex((index) => index + 1);
                        setMiniGameCheckpoint("none");
                        return;
                      }

                      if (miniGameCheckpoint === "end-quiz") {
                        if (currentLessonId && !isLessonComplete) {
                          onCompleteLesson(currentLessonId);
                        }
                        setMiniGameCheckpoint("none");
                        setFinished(true);
                      }
                    }}
                  />
                )}
              </>
            ) : null}
          </View>
        ) : activeSubject ? (
          <View style={styles.trail}>
            <View style={styles.trailHeading}>
              <Text style={styles.trailFlag}>🚩</Text>
              <Text style={[styles.trailTitle, darkMode && styles.darkText]}>
                Your {activeSubject.title} adventure
              </Text>
            </View>
            {activeSubject.lessons.map((lesson, index) => {
              const lessonId = getLessonProgressId(activeSubject, lesson);
              const complete = completedLessonIds.includes(lessonId);
              const locked =
                !lessonProgressReady ||
                activeSubject.lessons
                  .slice(0, index)
                  .some(
                    (previous) =>
                      !completedLessonIds.includes(getLessonProgressId(activeSubject, previous))
                  );
              return (
                <View style={styles.trailStep} key={lesson.id}>
                  <View style={styles.roadColumn}>
                    {index < activeSubject.lessons.length - 1 ? (
                      <View
                        style={[
                          styles.roadConnector,
                          complete && styles.roadConnectorComplete,
                        ]}
                      />
                    ) : (
                      <Text style={styles.roadFinish}>🏁</Text>
                    )}
                    <View
                      style={[
                        styles.roadNode,
                        complete && styles.roadNodeComplete,
                        locked && styles.roadNodeLocked,
                      ]}
                    >
                      <Text style={styles.roadNodeText}>{complete ? "✓" : index + 1}</Text>
                    </View>
                  </View>
                  <Animated.View
                    style={[
                      styles.trailCardWrap,
                      unlockingLessonId === lessonId && {
                        opacity: unlockFade,
                        transform: [{ scale: unlockScale }],
                      },
                    ]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${locked ? "Preview locked" : "Open"} lesson ${index + 1}: ${lesson.title}`}
                      onPress={() => startLesson(lesson)}
                      style={({ pressed }) => [
                        styles.lessonCard,
                        darkMode && styles.darkCard,
                        locked && styles.lockedLessonCard,
                        darkMode && locked && styles.darkLockedLessonCard,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.lessonCopy}>
                        <Text
                          style={[
                            styles.stepStatus,
                            darkMode && styles.darkMutedText,
                            complete && (darkMode ? styles.darkCompleteStatus : styles.completeStatus),
                          ]}
                        >
                          {complete ? "COMPLETED · REPLAY" : !lessonProgressReady ? "LOADING" : locked ? "LOCKED · PREVIEW" : "READY · PLAY GAME"}
                        </Text>
                        <Text style={[styles.lessonTitle, darkMode && styles.darkText]}>
                          {lesson.title}
                        </Text>
                        <Text style={[styles.lessonOverview, darkMode && styles.darkMutedText]}>
                          {gradeTwoMiniGameInfo[lesson.miniGame].emoji}{" "}
                          {gradeTwoMiniGameInfo[lesson.miniGame].title} · {lesson.overview}
                        </Text>
                      </View>
                      <Text style={[styles.lessonArrow, darkMode && styles.darkMutedText]}>
                        {locked ? "🔒" : "›"}
                      </Text>
                    </Pressable>
                  </Animated.View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.subjects}>
            {subjects.map((subject) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${subject.title}, ${subject.lessons.length} Grade 2 quarter lessons`}
                key={subject.id}
                onPress={() => {
                  setActiveSubject(subject);
                  onMusicCategoryChange(subject.id);
                }}
                style={({ pressed }) => [
                  styles.subjectCard,
                  darkMode && styles.darkCard,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.subjectIcon}>{subject.emoji}</Text>
                <Text style={[styles.subjectTitle, darkMode && styles.darkText]}>
                  {subject.title}
                </Text>
                <View style={styles.subjectFooter}>
                  <Text style={[styles.subjectCount, darkMode && styles.darkMutedText]}>
                    {subject.lessons.length} lessons
                  </Text>
                  <Text style={[styles.subjectArrow, darkMode && styles.darkMutedText]}>→</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      {activeLesson && finished ? (
        <View style={[styles.quarterFooter, darkMode && styles.darkFooter]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={nextLesson ? "Continue to next quarter" : "Back to lessons"}
            onPress={() => {
              if (nextLesson) {
                startLesson(nextLesson);
              } else {
                setActiveLesson(null);
                setLessonStarted(false);
                resetGame();
              }
            }}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.difficultyButtonText}>
              {nextLesson ? "NEXT QUARTER →" : "BACK TO LESSONS"}
            </Text>
          </Pressable>
        </View>
      ) : null}
      <LessonInstructionModal
        visible={Boolean(activeLesson && !lessonStarted && !isLessonLocked && !finished)}
        title={activeLesson ? gradeTwoMiniGameInfo[activeLesson.miniGame].title : ""}
        instruction={
          activeLesson
            ? `Play ${gradeTwoMiniGameInfo[activeLesson.miniGame].title}, then answer questions to finish this quarter.`
            : ""
        }
        emoji={activeLesson ? gradeTwoMiniGameInfo[activeLesson.miniGame].emoji : ""}
        onStart={() => setLessonStarted(true)}
        onRequestClose={handleBack}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  lessonScreenContent: { flexGrow: 1 },
  backButton: { alignSelf: "flex-start", minHeight: 42, minWidth: 64, borderRadius: 8, backgroundColor: "#C62828", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  backButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  header: { alignItems: "center", backgroundColor: "#DDF5F2", borderRadius: 20, marginBottom: 20, padding: 22 },
  headerIcon: { fontSize: 42 },
  gradeLabel: { color: "#258EA3", fontSize: 11, fontWeight: "900", letterSpacing: 1, marginTop: 8 },
  title: { color: "#173B53", fontSize: 25, fontWeight: "900", marginTop: 5, textAlign: "center" },
  subtitle: { color: "#36566A", fontSize: 15, marginTop: 6, textAlign: "center" },
  subjects: { gap: 12 },
  subjectCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#CDEEF1", borderRadius: 20, borderWidth: 1.5, justifyContent: "center", minHeight: 168, padding: 16 },
  subjectIcon: { fontSize: 54 },
  subjectTitle: { color: "#173B53", fontSize: 17, fontWeight: "900", marginTop: 9, textAlign: "center" },
  subjectFooter: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 8 },
  subjectCount: { color: "#6E8190", fontSize: 14, fontWeight: "700" },
  subjectArrow: { color: "#258EA3", fontSize: 20, fontWeight: "900" },
  trail: { gap: 10 },
  trailHeading: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 4, paddingLeft: 6 },
  trailFlag: { fontSize: 26 },
  trailTitle: { color: "#315C4A", fontSize: 17, fontWeight: "900" },
  trailStep: { alignItems: "stretch", flexDirection: "row", gap: 8 },
  roadColumn: { alignItems: "center", alignSelf: "stretch", position: "relative", width: 42 },
  roadConnector: { position: "absolute", backgroundColor: "#A9D7CE", borderRadius: 3, width: 5, top: 34, bottom: -12 },
  roadConnectorComplete: { backgroundColor: "#6FB78E" },
  roadNode: { alignItems: "center", backgroundColor: "#D6EEF1", borderColor: "#78C7D2", borderRadius: 18, borderWidth: 2, height: 36, justifyContent: "center", marginTop: 15, width: 36, zIndex: 1 },
  roadNodeComplete: { backgroundColor: "#BDE7C2", borderColor: "#72B77D" },
  roadNodeLocked: { backgroundColor: "#E2E7EA", borderColor: "#B7C1C7" },
  roadNodeText: { color: "#173B53", fontSize: 14, fontWeight: "900" },
  roadFinish: { fontSize: 22, marginTop: 19, zIndex: 1 },
  trailCardWrap: { flex: 1 },
  lessonCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#CDEEF1", borderRadius: 18, borderWidth: 1.5, flexDirection: "row", gap: 12, minHeight: 94, padding: 14 },
  lockedLessonCard: { backgroundColor: "#F1F4F5", borderColor: "#D4DEE1" },
  darkLockedLessonCard: { backgroundColor: "#26334A", borderColor: "#3C4B63" },
  lessonCopy: { flex: 1 },
  stepStatus: { color: "#258EA3", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  lessonTitle: { color: "#173B53", fontSize: 15, fontWeight: "900", lineHeight: 20, marginTop: 4 },
  lessonOverview: { color: "#536D79", fontSize: 12, lineHeight: 17, marginTop: 4 },
  lessonArrow: { color: "#258EA3", fontSize: 24, fontWeight: "800" },
  lessonContent: { gap: 12 },
  learnCard: { backgroundColor: "#FFFFFF", borderColor: "#CDEEF1", borderRadius: 18, borderWidth: 1.5, padding: 18 },
  cardTitle: { color: "#173B53", fontSize: 20, fontWeight: "900" },
  bodyText: { color: "#36566A", fontSize: 15, lineHeight: 22, marginTop: 7 },
  topicRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  topicBullet: { color: "#258EA3", fontSize: 18, fontWeight: "900" },
  topicText: { color: "#36566A", flex: 1, fontSize: 14, lineHeight: 21 },
  primaryButton: { alignItems: "center", backgroundColor: "#258EA3", borderRadius: 13, justifyContent: "center", marginTop: 16, minHeight: 50, paddingHorizontal: 14 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", textAlign: "center" },
  lockedCard: { backgroundColor: "#FFFFFF", borderColor: "#CDEEF1", borderRadius: 18, borderWidth: 1.5, padding: 18 },
  hintText: { color: "#8A4F20", fontSize: 14, fontWeight: "700", lineHeight: 21, marginTop: 12 },
  finishCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#F4C451", borderRadius: 18, borderWidth: 1.5, padding: 22 },
  finishEmoji: { fontSize: 54, marginBottom: 10 },
  finishHint: { color: "#536D79", fontSize: 14, fontWeight: "700", marginTop: 8, textAlign: "center" },
  questionCard: { backgroundColor: "#FFFFFF", borderColor: "#CDEEF1", borderRadius: 18, borderWidth: 1.5, padding: 18 },
  questionHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  questionCount: { color: "#258EA3", fontSize: 15, fontWeight: "900" },
  questionProgress: { flexDirection: "row", gap: 4, marginTop: 12 },
  questionProgressDot: { backgroundColor: "#D6EEF1", borderRadius: 4, flex: 1, height: 7 },
  questionProgressDotActive: { backgroundColor: "#F4C451" },
  questionPrompt: { color: "#173B53", fontSize: 18, fontWeight: "900", lineHeight: 25, marginTop: 18, textAlign: "center" },
  answerOptions: { gap: 9, marginTop: 16 },
  answerOption: { alignItems: "center", backgroundColor: "#F4FBFA", borderColor: "#CDEEF1", borderRadius: 14, borderWidth: 2, justifyContent: "center", minHeight: 52, paddingHorizontal: 12, paddingVertical: 10 },
  darkAnswerOption: { backgroundColor: "#26334A", borderColor: "#465671" },
  correctAnswer: { backgroundColor: "#D5F5EB", borderColor: "#66CBB1" },
  incorrectAnswer: { backgroundColor: "#FFF0EB", borderColor: "#F17D65" },
  answerOptionText: { color: "#173B53", fontSize: 15, fontWeight: "800", textAlign: "center" },
  questionFeedback: { fontSize: 14, fontWeight: "800", lineHeight: 20, marginTop: 12, textAlign: "center" },
  correctFeedback: { color: "#315C4A" },
  retryFeedback: { color: "#A94D3D" },
  replayButton: { alignItems: "center", backgroundColor: "#258EA3", borderRadius: 13, justifyContent: "center", marginTop: 16, minHeight: 50, paddingHorizontal: 18 },
  replayButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  quarterFooter: { backgroundColor: "#FFFFFF", borderTopColor: "#CDEEF1", borderTopWidth: 1, paddingHorizontal: 20, paddingVertical: 12 },
  darkFooter: { backgroundColor: "#303D55", borderTopColor: "#465671" },
  continueButton: { alignItems: "center", backgroundColor: "#315C4A", borderRadius: 13, justifyContent: "center", minHeight: 52, paddingHorizontal: 10 },
  difficultyButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  pressed: { opacity: 0.72 },
  darkScreen: { backgroundColor: "rgba(18, 29, 50, 0.32)" },
  darkCard: { backgroundColor: "#303D55", borderColor: "#465671" },
  darkText: { color: "#E4EAF3" },
  darkMutedText: { color: "#B9C5D8" },
  completeStatus: { color: "#397147" },
  darkCompleteStatus: { color: "#9ADAA5" },
});