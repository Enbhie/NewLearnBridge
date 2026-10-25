import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Modal, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { awardModuleBadge } from "../data/badges";
import AnimatedLearningSticker, {
  learningStickerVariantForIndex,
} from "./AnimatedLearningSticker";
import StorybookPicture from "./StorybookPicture";
import type { CategoryId } from "../data/learningContent";
import type { Difficulty as LessonDifficulty } from "./AccountSettingsScreen";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import { AppAppearanceContext } from "./CloudBackdrop";
import { playFeedback } from "../utils/soundEffects";

// Shared "learning trail" screen used by the Kindergarten and Grade 1 online lessons.
// Each grade passes in its own subjects (3 subjects x 5 lessons, one minigame per lesson).

export type ChoiceRound = {
  q: string;
  art?: string;
  correct: string;
  wrong: string[];
};

export type OrderRound = {
  prompt: string;
  art?: string;
  items: string[]; // listed in the correct order; shuffled when played
};

export type ChoiceGame = { type: "choice"; passage?: string; rounds: ChoiceRound[] };
export type OrderGame = { type: "order"; rounds: OrderRound[] };

export type Lesson = {
  id: string;
  title: string;
  emoji: string;
  gameName: string;
  blurb: string;
  learn: string;
  game: ChoiceGame | OrderGame;
};

export type Subject = {
  id: "reading" | "math" | "science";
  title: string;
  emoji: string;
  music: CategoryId;
  lessons: Lesson[];
};

const difficultyLabels: Record<LessonDifficulty, string> = {
  easy: "Easy",
  standard: "Standard",
  challenge: "Challenge",
};

export const rep = (emoji: string, count: number) => emoji.repeat(count);

// ---------- Helpers ----------

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const NEXT_ROUND_DELAY_MS = 900;

function FloatingEmoji({ emoji, style }: { emoji: string; style?: object }) {
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(offset, { toValue: -6, duration: 700, useNativeDriver: true }),
        Animated.timing(offset, { toValue: 6, duration: 700, useNativeDriver: true }),
        Animated.timing(offset, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [offset]);

  return <Animated.Text style={[style, { transform: [{ translateY: offset }] }]}>{emoji}</Animated.Text>;
}

// ---------- Minigame: choose the right answer ----------

function ChoicePlayer({
  game,
  difficulty,
  darkMode,
  onMistake,
  onFinish,
}: {
  game: ChoiceGame;
  difficulty: LessonDifficulty;
  darkMode: boolean;
  onMistake: () => void;
  onFinish: (passed: boolean, correct: number, total: number, mistakes: number) => void;
}) {
  const roundCount = Math.min(
    game.rounds.length,
    difficulty === "easy" ? 3 : difficulty === "standard" ? 4 : 5
  );
  const wrongCount =
    difficulty === "easy" ? 1 : difficulty === "standard" ? 2 : undefined;
  const rounds = useMemo(
    () =>
      shuffle(game.rounds)
        .slice(0, roundCount)
        .map((round) => ({
          ...round,
          options: shuffle([
            round.correct,
            ...(wrongCount === undefined
              ? shuffle(round.wrong)
              : shuffle(round.wrong).slice(0, wrongCount)),
          ]),
        })),
    [game, roundCount, wrongCount]
  );
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const round = rounds[index];
  const choose = (option: string) => {
    if (picked !== null) return;
    const isRight = option === round.correct;
    playFeedback(isRight ? "success" : "error");
    const nextCorrect = correct + (isRight ? 1 : 0);
    const nextMistakes = mistakes + (isRight ? 0 : 1);
    setPicked(option);
    setCorrect(nextCorrect);
    if (!isRight) {
      setMistakes(nextMistakes);
      onMistake();
    }
    timer.current = setTimeout(() => {
      if (index + 1 >= rounds.length) {
        onFinish(nextMistakes === 0, nextCorrect, rounds.length, nextMistakes);
      } else {
        setIndex(index + 1);
        setPicked(null);
      }
    }, NEXT_ROUND_DELAY_MS);
  };

  return (
    <View>
      <Text style={[styles.progressText, darkMode && styles.darkMutedText]}>
        Question {index + 1} of {rounds.length}
      </Text>
      <View style={[styles.questionTrack, darkMode && styles.darkTrack]}>
        <View
          style={[
            styles.questionProgress,
            { width: `${((index + 1) / rounds.length) * 100}%` },
          ]}
        />
      </View>
      {game.passage ? (
        <View style={[styles.passageCard, darkMode && styles.darkCard]}>
          <Text style={[styles.passageText, darkMode && styles.darkText]}>{game.passage}</Text>
        </View>
      ) : null}
      <View style={[styles.playCard, darkMode && styles.darkCard]}>
        {round.art ? <FloatingEmoji emoji={round.art} style={styles.art} /> : null}
        <Text style={[styles.question, darkMode && styles.darkText]}>{round.q}</Text>
      </View>
      {round.options.map((option, optionIndex) => {
        const isPicked = picked === option;
        const isAnswer = picked !== null && option === round.correct;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            celebrateOnPress
            disabled={picked !== null}
            onPress={() => choose(option)}
            style={[
              styles.optionBtn,
              darkMode && styles.darkOption,
              isAnswer && styles.optionRight,
              isPicked && !isAnswer && styles.optionWrong,
              darkMode && isAnswer && styles.darkOptionRight,
              darkMode && isPicked && !isAnswer && styles.darkOptionWrong,
            ]}
          >
            <View style={styles.choiceContent}>
              <StorybookPicture
                label={option}
                size={38}
              />
              <Text style={[styles.optionText, darkMode && styles.darkMutedText]}>{option}</Text>
            </View>
          </Pressable>
        );
      })}
      {picked !== null ? (
        <Text style={[
          styles.feedback,
          picked === round.correct ? styles.good : styles.bad,
          darkMode && (picked === round.correct ? styles.darkGood : styles.darkBad),
        ]}>
          {picked === round.correct ? "Great job!" : `Nice try! The answer is ${round.correct}.`}
        </Text>
      ) : null}
    </View>
  );
}

// ---------- Minigame: tap the tiles in order ----------

function OrderPlayer({
  game,
  difficulty,
  darkMode,
  onMistake,
  onFinish,
}: {
  game: OrderGame;
  difficulty: LessonDifficulty;
  darkMode: boolean;
  onMistake: () => void;
  onFinish: (passed: boolean, correct: number, total: number, mistakes: number) => void;
}) {
  const roundCount = Math.min(
    game.rounds.length,
    difficulty === "easy" ? 2 : difficulty === "standard" ? 3 : 5
  );
  const rounds = useMemo(
    () => shuffle(game.rounds).slice(0, roundCount),
    [game, roundCount]
  );
  const tileSets = useMemo(
    () => rounds.map((round) => shuffle(round.items.map((label, order) => ({ label, order })))),
    [rounds]
  );
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [locked, setLocked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const round = rounds[index];
  const tiles = tileSets[index];

  const pick = (order: number) => {
    if (locked || picked.includes(order)) return;
    if (order !== picked.length) {
      playFeedback("error");
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setLocked(true);
      setMessage("Moving to the next puzzle.");
      onMistake();
      timer.current = setTimeout(() => {
        if (index + 1 >= rounds.length) {
          onFinish(false, index, rounds.length, nextMistakes);
        } else {
          setIndex(index + 1);
          setPicked([]);
          setMessage("");
          setLocked(false);
        }
      }, NEXT_ROUND_DELAY_MS);
      return;
    }
    const nextPicked = [...picked, order];
    playFeedback("success");
    setPicked(nextPicked);
    setMessage("");
    if (nextPicked.length === round.items.length) {
      setLocked(true);
      setMessage("You got it!");
      timer.current = setTimeout(() => {
        if (index + 1 >= rounds.length) {
          onFinish(mistakes === 0, rounds.length, rounds.length, mistakes);
        } else {
          setIndex(index + 1);
          setPicked([]);
          setMessage("");
          setLocked(false);
        }
      }, NEXT_ROUND_DELAY_MS);
    }
  };

  return (
    <View>
      <Text style={[styles.progressText, darkMode && styles.darkMutedText]}>
        Puzzle {index + 1} of {rounds.length}
      </Text>
      <View style={[styles.questionTrack, darkMode && styles.darkTrack]}>
        <View
          style={[
            styles.questionProgress,
            { width: `${((index + 1) / rounds.length) * 100}%` },
          ]}
        />
      </View>
      <View style={[styles.playCard, darkMode && styles.darkCard]}>
        {round.art ? <FloatingEmoji emoji={round.art} style={styles.art} /> : null}
        <Text style={[styles.question, darkMode && styles.darkText]}>{round.prompt}</Text>
        <View style={styles.answerRow}>
          {round.items.map((label, slot) => (
            <View key={`${label}-${slot}`} style={[styles.slot, darkMode && styles.darkOption, slot < picked.length && styles.slotFilled]}>
              <Text style={[styles.slotText, darkMode && styles.darkMutedText]}>{slot < picked.length ? label : "?"}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.tileRow}>
        {tiles.map((tile) => {
          const used = picked.includes(tile.order);
          return (
            <Pressable
              key={`${tile.label}-${tile.order}`}
              accessibilityRole="button"
              disabled={used || locked}
              onPress={() => pick(tile.order)}
              style={[styles.tile, darkMode && styles.darkOption, used && styles.tileUsed]}
            >
              <View style={styles.choiceContent}>
                <AnimatedLearningSticker
                  variant={learningStickerVariantForIndex(index * tiles.length + tile.order)}
                  size={34}
                />
                <Text style={[styles.tileText, darkMode && styles.darkMutedText]}>{tile.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {message ? (
        <Text style={[
          styles.feedback,
          message === "You got it!" ? styles.good : styles.bad,
          darkMode && (message === "You got it!" ? styles.darkGood : styles.darkBad),
        ]}>
          {message}
        </Text>
      ) : null}
      <Text style={[styles.mistakeText, darkMode && styles.darkMutedText]}>Mistakes: {mistakes}</Text>
    </View>
  );
}

// ---------- Lesson player: learn, play, result ----------

function LessonPlayer({
  gradeLabel,
  subject,
  lesson,
  lessonNumber,
  difficulty,
  canPlay,
  lessonProgressReady,
  darkMode,
  onMistake,
  onExit,
  onPassed,
}: {
  gradeLabel: string;
  subject: Subject;
  lesson: Lesson;
  lessonNumber: number;
  difficulty: LessonDifficulty;
  canPlay: boolean;
  lessonProgressReady: boolean;
  darkMode: boolean;
  onMistake: () => void;
  onExit: () => void;
  onPassed: () => void;
}) {
  const [phase, setPhase] = useState<"intro" | "play" | "result">("intro");
  const [showGameInstructions, setShowGameInstructions] = useState(canPlay);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({
    passed: false,
    correct: 0,
    total: 0,
    mistakes: 0,
  });
  const gameInstructions =
    lesson.game.type === "choice"
      ? [
          "Look at the picture and listen to the question.",
          "Tap the answer you think is right.",
          "Keep going and collect your stars!",
        ]
      : [
          "Look at all the picture or word tiles.",
          "Tap the tiles one at a time in the right order.",
          "If you tap the wrong tile, try another one!",
        ];

  const finish = (
    passed: boolean,
    correct: number,
    total: number,
    mistakes: number
  ) => {
    setResult({ passed, correct, total, mistakes });
    setPhase("result");
    if (passed) {
      void awardModuleBadge({
        moduleId: `${gradeLabel}:${subject.id}:${lesson.id}`,
        title: lesson.title,
        summary: lesson.learn,
        resultLabel: `${correct}/${total} correct`,
      }).catch((error: unknown) => {
        Alert.alert(
          "Badge not saved",
          error instanceof Error ? error.message : "Check device storage and try again."
        );
      });
      onPassed();
    }
  };

  return (
    <>
      <SafeAreaView style={[styles.page, darkMode && styles.darkScreen]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Pressable accessibilityRole="button" onPress={onExit} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>

        {phase === "intro" ? (
          <View>
            <View style={[styles.hero, darkMode && styles.darkCard]}>
              <AnimatedLearningSticker
                variant={subject.id === "math" ? "coin" : subject.id === "science" ? "plant" : "owl"}
                size={88}
              />
              <Text style={[styles.label, darkMode && styles.darkMutedText]}>{gradeLabel} · {subject.title}</Text>
              <Text style={[styles.lessonNumber, darkMode && styles.darkMutedText]}>Lesson {lessonNumber} of {subject.lessons.length}</Text>
              <Text style={[styles.heroTitle, darkMode && styles.darkText]}>{lesson.title}</Text>
              <Text style={[styles.heroSub, darkMode && styles.darkMutedText]}>{lesson.blurb}</Text>
            </View>
            <View style={[styles.learnCard, darkMode && styles.darkCard]}>
              <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Learn it</Text>
              <Text style={[styles.learnText, darkMode && styles.darkMutedText]}>{lesson.learn}</Text>
            </View>
            <View style={[styles.gameCard, darkMode && styles.darkCard]}>
              <View style={styles.gameCardTitle}>
                <AnimatedLearningSticker
                  variant={learningStickerVariantForIndex(lessonNumber - 1)}
                  size={32}
                />
                <Text style={[styles.cardTitle, darkMode && styles.darkText]}>
                  Minigame: {lesson.gameName}
                </Text>
              </View>
              <Text style={[styles.cardBlurb, darkMode && styles.darkMutedText]}>{lesson.blurb}</Text>
            </View>
            {canPlay ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowGameInstructions(true)}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>How to play</Text>
              </Pressable>
            ) : (
              <View style={[styles.learnCard, darkMode && styles.darkCard]}>
                <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Lesson preview</Text>
                <Text style={[styles.cardBlurb, darkMode && styles.darkMutedText]}>
                  {lessonProgressReady
                    ? "Complete the earlier lessons in this subject to unlock this minigame."
                    : "Loading your saved lesson progress..."}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {phase === "play" ? (
          <View>
            <View style={[styles.hero, darkMode && styles.darkCard]}>
              <Text style={[styles.label, darkMode && styles.darkMutedText]}>{gradeLabel} · {subject.title}</Text>
              <Text style={[styles.lessonNumber, darkMode && styles.darkMutedText]}>Minigame: {lesson.gameName}</Text>
              <Text style={[styles.heroTitle, darkMode && styles.darkText]}>{lesson.title}</Text>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyBadgeText}>
                  {difficultyLabels[difficulty]} difficulty
                </Text>
              </View>
            </View>
            {lesson.game.type === "choice" ? (
              <ChoicePlayer
                key={attempt}
                game={lesson.game}
                difficulty={difficulty}
                darkMode={darkMode}
                onMistake={onMistake}
                onFinish={finish}
              />
            ) : (
              <OrderPlayer
                key={attempt}
                game={lesson.game}
                difficulty={difficulty}
                darkMode={darkMode}
                onMistake={onMistake}
                onFinish={finish}
              />
            )}
          </View>
        ) : null}

        {phase === "result" ? (
          <View>
            <View style={[styles.hero, darkMode && styles.darkCard]}>
              <AnimatedLearningSticker
                variant={result.passed ? "coin" : "owl"}
                size={64}
              />
              <Text style={[styles.heroTitle, darkMode && styles.darkText]}>
                {result.passed ? "Lesson complete!" : "Almost there!"}
              </Text>
              <Text style={[styles.heroSub, darkMode && styles.darkMutedText]}>
                {result.passed
                  ? lesson.game.type === "choice"
                    ? `You got ${result.correct} out of ${result.total} right. Lesson complete!`
                    : "You put everything in order. Lesson complete!"
                  : lesson.game.type === "choice"
                    ? `You got ${result.correct} out of ${result.total} right, with ${result.mistakes} ${result.mistakes === 1 ? "mistake" : "mistakes"}. Try again for a perfect score.`
                    : `You made ${result.mistakes} ${result.mistakes === 1 ? "mistake" : "mistakes"}. Try again for a perfect score.`}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setAttempt(attempt + 1);
                setPhase("play");
              }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>{result.passed ? "Play again" : "Try again"}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onExit} style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>Back to lessons</Text>
            </Pressable>
          </View>
        ) : null}
        </ScrollView>
      </SafeAreaView>
      <Modal
        animationType="fade"
        onRequestClose={() => setShowGameInstructions(false)}
        transparent
        visible={showGameInstructions && canPlay && phase === "intro"}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.instructionsModal, darkMode && styles.darkCard]}>
            <AnimatedLearningSticker
              variant={learningStickerVariantForIndex(subject.lessons.indexOf(lesson))}
              size={64}
            />
            <Text style={[styles.modalEyebrow, darkMode && styles.darkMutedText]}>
              {subject.title} · Game time!
            </Text>
            <Text style={[styles.modalTitle, darkMode && styles.darkText]}>{lesson.gameName}</Text>
            <Text style={[styles.modalHeading, darkMode && styles.darkText]}>
              How to play this mini-game
            </Text>
            <Text style={[styles.modalDescription, darkMode && styles.darkMutedText]}>
              {lesson.blurb}
            </Text>
            <View style={styles.instructionList}>
              {gameInstructions.map((instruction, index) => (
                <View key={instruction} style={styles.instructionRow}>
                  <AnimatedLearningSticker
                    variant={learningStickerVariantForIndex(index)}
                    size={28}
                  />
                  <Text style={[styles.instructionText, darkMode && styles.darkMutedText]}>
                    {instruction}
                  </Text>
                </View>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setShowGameInstructions(false);
                setPhase("play");
              }}
              style={styles.modalPlayButton}
            >
              <Text style={styles.modalPlayButtonText}>LET&apos;S PLAY!</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowGameInstructions(false)}
              style={styles.modalLaterButton}
            >
              <Text style={[styles.modalLaterButtonText, darkMode && styles.darkMutedText]}>
                Not right now
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ---------- Main screen ----------

export type GradeScreenProps = {
  onBack: () => void;
  onMusicCategoryChange: (category: CategoryId | null) => void;
  difficulty: LessonDifficulty;
  screenTimeLimitMinutes?: number;
  completedLessonIds: string[];
  lessonProgressReady: boolean;
  onCompleteLesson: (lessonId: string) => void;
  onRecordMistake: (lessonId: string) => void;
};

type TrailConfig = {
  gradeLabel: string; // e.g. "Grade 1" or "Kindergarten"
  subjects: Subject[];
  progressPrefix: string; // e.g. "grade:1:online" -> grade:1:online:<subject>:<lesson>
};

type ViewState =
  | { kind: "subjects" }
  | { kind: "lessons"; subjectId: Subject["id"] }
  | { kind: "play"; subjectId: Subject["id"]; lessonId: string };

export default function LessonTrailScreen({
  gradeLabel,
  subjects,
  progressPrefix,
  onBack,
  onMusicCategoryChange,
  difficulty,
  completedLessonIds,
  lessonProgressReady,
  onCompleteLesson,
  onRecordMistake,
}: GradeScreenProps & TrailConfig) {
  const { darkMode } = useContext(AppAppearanceContext);
  const isKindergarten = gradeLabel === "Kindergarten";
  const [view, setView] = useState<ViewState>({ kind: "subjects" });

  const lessonKey = (subjectId: string, lessonId: string) =>
    `${progressPrefix}:${subjectId}:${lessonId}`;

  const activeSubject =
    view.kind === "subjects"
      ? null
      : subjects.find((subject) => subject.id === view.subjectId) ?? null;

  useEffect(() => {
    onMusicCategoryChange(activeSubject ? activeSubject.music : null);
  }, [activeSubject, onMusicCategoryChange]);

  const isDone = (subject: Subject, lesson: Lesson) =>
    completedLessonIds.includes(lessonKey(subject.id, lesson.id));

  const doneCount = (subject: Subject) =>
    subject.lessons.filter((lesson) => isDone(subject, lesson)).length;

  // ----- Play view -----
  if (view.kind === "play" && activeSubject) {
    const lesson = activeSubject.lessons.find((item) => item.id === view.lessonId);
    if (lesson) {
      const lessonIndex = activeSubject.lessons.indexOf(lesson);
      const canPlay =
        lessonProgressReady &&
        activeSubject.lessons
          .slice(0, lessonIndex)
          .every((previousLesson) => isDone(activeSubject, previousLesson));
      return (
        <LessonPlayer
          key={lesson.id}
          gradeLabel={gradeLabel}
          subject={activeSubject}
          lesson={lesson}
          lessonNumber={lessonIndex + 1}
          difficulty={difficulty}
          canPlay={canPlay}
          lessonProgressReady={lessonProgressReady}
          darkMode={darkMode}
          onMistake={() =>
            onRecordMistake(lessonKey(activeSubject.id, lesson.id))
          }
          onExit={() => setView({ kind: "lessons", subjectId: activeSubject.id })}
          onPassed={() => onCompleteLesson(lessonKey(activeSubject.id, lesson.id))}
        />
      );
    }
  }

  // ----- Learning trail for one subject -----
  if (view.kind === "lessons" && activeSubject) {
    const total = activeSubject.lessons.length;
    const allDone = doneCount(activeSubject) === total;
    return (
      <SafeAreaView style={[styles.page, darkMode && styles.darkScreen]}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setView({ kind: "subjects" })}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>Back</Text>
            </Pressable>

            <View style={[trail.hero, darkMode && styles.darkCard]}>
              {isKindergarten ? (
                <AnimatedLearningSticker
                  variant={learningStickerVariantForIndex(subjects.indexOf(activeSubject))}
                  size={78}
                />
              ) : (
                <AnimatedLearningSticker
                  variant={learningStickerVariantForIndex(subjects.indexOf(activeSubject))}
                  size={64}
                />
              )}
              <Text style={[styles.label, darkMode && styles.darkMutedText]}>{gradeLabel} online lessons</Text>
              <Text style={[styles.heroTitle, darkMode && styles.darkText]}>{activeSubject.title}</Text>
              <Text style={[styles.heroSub, darkMode && styles.darkMutedText]}>Choose a lesson, learn the idea, then play its minigame.</Text>
              <View style={trail.progressSummary}>
                <AnimatedLearningSticker variant="coin" size={28} />
                <Text style={[styles.starsText, darkMode && styles.darkText]}>
                  {doneCount(activeSubject)} / {total} lessons done
                </Text>
              </View>
            </View>

            <View style={trail.headerRow}>
              <AnimatedLearningSticker variant="plant" size={34} />
              <Text style={[trail.headerText, darkMode && styles.darkText]}>Your {activeSubject.title} adventure</Text>
            </View>

            {activeSubject.lessons.map((lesson, index) => {
              const done = isDone(activeSubject, lesson);
              const unlocked =
                lessonProgressReady &&
                (done ||
                  activeSubject.lessons
                    .slice(0, index)
                    .every((previousLesson) => isDone(activeSubject, previousLesson)));
              const status = done
                ? "Done · Play again"
                : unlocked
                  ? "Ready · Open lesson"
                  : lessonProgressReady
                    ? "Locked · Preview lesson"
                    : "Loading progress";
              return (
                <View key={lesson.id} style={trail.row}>
                  <View style={trail.rail}>
                    <View
                      style={[
                        trail.node,
                        unlocked && trail.nodeReady,
                        done && trail.nodeDone,
                      ]}
                    >
                      <Text style={[trail.nodeText, done && trail.nodeTextDone]}>
                        {done ? "✓" : index + 1}
                      </Text>
                    </View>
                    <View style={trail.railLine} />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${unlocked ? "Open" : "Preview locked"} lesson ${index + 1}: ${lesson.title}. ${status}`}
                    onPress={() =>
                      setView({ kind: "play", subjectId: activeSubject.id, lessonId: lesson.id })
                    }
                    style={[
                      trail.card,
                      darkMode && styles.darkCard,
                      !unlocked && trail.cardLocked,
                      darkMode && !unlocked && styles.darkLockedLessonCard,
                    ]}
                  >
                    <StorybookPicture
                      label={lesson.title}
                      emoji={lesson.emoji}
                      size={48}
                    />
                    <View style={trail.cardBody}>
                      <Text style={[trail.status, darkMode && styles.darkMutedText, done && trail.statusDone, !unlocked && trail.statusLocked]}>
                        {status}
                      </Text>
                      <Text style={[trail.cardTitle, darkMode && styles.darkText, !unlocked && trail.cardTitleLocked]}>
                        Lesson {index + 1}: {lesson.title}
                      </Text>
                      <Text style={[trail.gameLine, darkMode && styles.darkMutedText]}>Lesson + minigame: {lesson.gameName}</Text>
                      <Text style={[trail.cardBlurb, darkMode && styles.darkMutedText]}>{lesson.blurb}</Text>
                    </View>
                    <AnimatedLearningSticker
                      variant={done ? "coin" : learningStickerVariantForIndex(index + 1)}
                      size={34}
                      style={trail.cardSticker}
                    />
                  </Pressable>
                </View>
              );
            })}

            <View style={trail.row}>
              <View style={trail.rail}>
                <View style={[trail.node, allDone && trail.nodeDone]}>
                  <AnimatedLearningSticker variant="coin" size={24} />
                </View>
              </View>
              <View style={[trail.card, trail.badgeCard, darkMode && styles.darkCard, !allDone && trail.cardLocked, darkMode && !allDone && styles.darkLockedLessonCard]}>
                <View style={trail.cardBody}>
                  <Text style={[trail.cardTitle, darkMode && styles.darkText, !allDone && trail.cardTitleLocked]}>
                    {allDone
                      ? "Subject badge earned!"
                      : `Finish all ${total} lessons to earn the subject badge`}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
      </SafeAreaView>
    );
  }

  // ----- Subject picker -----
  return (
    <SafeAreaView style={[styles.page, darkMode && styles.darkScreen]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        <View style={[styles.hero, darkMode && styles.darkCard]}>
          <AnimatedLearningSticker variant="owl" size={78} />
          <Text style={[styles.label, darkMode && styles.darkMutedText]}>{gradeLabel} online lessons</Text>
          <Text style={[styles.heroTitle, darkMode && styles.darkText]}>Choose an adventure</Text>
          <Text style={[styles.heroSub, darkMode && styles.darkMutedText]}>
            Math, reading, and science adventures made for {gradeLabel}.
          </Text>
        </View>
        {subjects.map((subject) => (
          <Pressable
            key={subject.id}
            accessibilityRole="button"
            onPress={() => setView({ kind: "lessons", subjectId: subject.id })}
            style={[styles.card, darkMode && styles.darkCard]}
          >
            <StorybookPicture
              label={subject.title}
              emoji={subject.emoji}
              size={62}
            />
            <Text style={[styles.cardTitle, darkMode && styles.darkText]}>{subject.title}</Text>
            <Text style={[styles.meta, darkMode && styles.darkMutedText]}>
              {subject.lessons.length} lessons · {doneCount(subject)}/{subject.lessons.length} complete
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Trail styles ----------

const trail = StyleSheet.create({
  hero: {
    alignItems: "center",
    backgroundColor: "rgba(221, 245, 241, 0.97)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, paddingRight: 8 },
  flag: { fontSize: 30, width: 44, textAlign: "center" },
  headerText: { flex: 1, color: "#1F5F55", fontSize: 18, fontWeight: "900", marginLeft: 8 },
  row: { flexDirection: "row", alignItems: "stretch", paddingBottom: 12 },
  rail: { width: 44, alignItems: "center" },
  node: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3EEF0",
    borderColor: "#B7C9CD",
    borderWidth: 2,
  },
  nodeReady: { backgroundColor: "#FFFFFF", borderColor: "#258EA3" },
  nodeDone: { backgroundColor: "#397147", borderColor: "#397147" },
  nodeText: { color: "#173B53", fontSize: 14, fontWeight: "900" },
  nodeTextDone: { color: "#FFFFFF" },
  nodeFlag: { fontSize: 15 },
  railLine: { flex: 1, width: 5, borderRadius: 3, backgroundColor: "#A9D7CE", marginTop: 4 },
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  cardLocked: { backgroundColor: "#EEF3F4" },
  badgeCard: { borderColor: "#F3C451", borderWidth: 2 },
  cardBody: { flex: 1 },
  cardSticker: { marginRight: 10 },
  status: { color: "#258EA3", fontSize: 10, fontWeight: "900", letterSpacing: 0.8, textTransform: "uppercase" },
  statusDone: { color: "#397147" },
  statusLocked: { color: "#258EA3" },
  cardTitle: { color: "#173B53", fontSize: 15, fontWeight: "900", marginTop: 2 },
  cardTitleLocked: { color: "#2B4656" },
  gameLine: { color: "#36566A", fontSize: 12, fontWeight: "800", marginTop: 3 },
  cardBlurb: { color: "#4B6A7A", fontSize: 12, lineHeight: 17, marginTop: 2 },
  progressSummary: { alignItems: "center", flexDirection: "row", gap: 8 },
});

// ---------- Styles (same palette as index.tsx) ----------

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "transparent" },
  darkScreen: { backgroundColor: "rgba(18, 29, 50, 0.32)" },
  scroll: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 40 },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#C62828",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  backBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  hero: {
    alignItems: "center",
    backgroundColor: "#DDF5F1",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  bigEmoji: { fontSize: 54, marginBottom: 6 },
  label: { color: "#258EA3", fontSize: 12, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  heroTitle: { color: "#173B53", fontSize: 24, fontWeight: "900", textAlign: "center", marginTop: 4 },
  heroSub: { color: "#36566A", fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 4 },
  starsText: { color: "#173B53", fontSize: 16, fontWeight: "800", marginTop: 8 },
  difficultyBadge: { alignSelf: "center", backgroundColor: "#315C4A", borderRadius: 16, marginTop: 10, paddingHorizontal: 12, paddingVertical: 6 },
  difficultyBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  card: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D5F5EB",
    borderWidth: 2,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardLocked: { backgroundColor: "#F1F4F4", borderColor: "#D6DEDD" },
  cardTitle: { color: "#173B53", fontSize: 17, fontWeight: "900", textAlign: "center" },
  cardBlurb: { color: "#36566A", fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 4 },
  lessonNumber: { color: "#4B6A7A", fontSize: 12, fontWeight: "800", marginBottom: 2 },
  meta: { color: "#4B6A7A", fontSize: 13, fontWeight: "800", marginTop: 6 },
  lessonBtn: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    backgroundColor: "#F17D65",
    borderRadius: 14,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  lessonBtnDone: { backgroundColor: "#397147" },
  lessonBtnLocked: { backgroundColor: "#9FB3B3" },
  lessonBtnText: { color: "#FFFDF5", fontSize: 15, fontWeight: "800", textAlign: "center" },
  badgeCard: {
    alignItems: "center",
    backgroundColor: "#FFF8E7",
    borderColor: "#F3C451",
    borderWidth: 2,
    borderRadius: 20,
    padding: 14,
  },
  learnCard: {
    backgroundColor: "#FFF0AA",
    borderColor: "#F3C451",
    borderWidth: 2,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  learnHeading: { color: "#173B53", fontSize: 17, fontWeight: "900", marginBottom: 6 },
  learnText: { color: "#36566A", fontSize: 16, lineHeight: 24 },
  gameCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D5F5EB",
    borderWidth: 2,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  gameCardTitle: { alignItems: "center", flexDirection: "row", gap: 8 },
  primaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    borderRadius: 16,
    backgroundColor: "#F17D65",
    paddingHorizontal: 16,
    marginTop: 8,
    alignSelf: "stretch",
  },
  primaryBtnText: { color: "#FFFDF5", fontSize: 16, fontWeight: "800" },
  secondaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#258EA3",
    paddingHorizontal: 16,
    marginTop: 10,
    alignSelf: "stretch",
  },
  secondaryBtnText: { color: "#FFFDF5", fontSize: 15, fontWeight: "800" },
  progressText: { color: "#4B6A7A", fontSize: 14, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  questionTrack: { backgroundColor: "#CDEEF1", borderRadius: 5, height: 9, marginBottom: 12, overflow: "hidden" },
  questionProgress: { backgroundColor: "#F17D65", height: "100%" },
  passageCard: {
    backgroundColor: "#FFF8E7",
    borderColor: "#F3C451",
    borderWidth: 2,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  passageText: { color: "#173B53", fontSize: 17, lineHeight: 26 },
  playCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D5F5EB",
    borderWidth: 2,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  art: { fontSize: 44, textAlign: "center", marginBottom: 8 },
  question: { color: "#173B53", fontSize: 19, fontWeight: "900", lineHeight: 26, textAlign: "center" },
  optionBtn: {
    alignItems: "stretch",
    justifyContent: "center",
    minHeight: 58,
    backgroundColor: "#FFF0AA",
    borderColor: "#F3C451",
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  choiceContent: { alignItems: "center", flexDirection: "row", gap: 12 },
  optionRight: { backgroundColor: "#D5F5EB", borderColor: "#66CBB1" },
  optionWrong: { backgroundColor: "#FFDCCF", borderColor: "#F2A28B" },
  optionText: { color: "#173B53", fontSize: 20, fontWeight: "900" },
  answerRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 12 },
  slot: {
    minWidth: 52,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2FBFD",
    borderColor: "#B8EDF3",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  slotFilled: { backgroundColor: "#D5F5EB", borderColor: "#66CBB1" },
  slotText: { color: "#173B53", fontSize: 17, fontWeight: "900" },
  tileRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 8 },
  tile: {
    minWidth: 64,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0AA",
    borderColor: "#F3C451",
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  tileUsed: { opacity: 0.35 },
  tileText: { color: "#173B53", fontSize: 18, fontWeight: "900" },
  feedback: { fontSize: 18, fontWeight: "900", textAlign: "center", marginVertical: 8 },
  mistakeText: { color: "#4B6A7A", fontSize: 13, fontWeight: "700", textAlign: "center", marginTop: 4 },
  good: { color: "#28543A" },
  bad: { color: "#9C3E32" },
  darkGood: { color: "#A7E2BC" },
  darkBad: { color: "#FFC0B5" },
  darkCard: { backgroundColor: "#303D55", borderColor: "#465671" },
  darkText: { color: "#E4EAF3" },
  darkMutedText: { color: "#B9C5D8" },
  darkOption: { backgroundColor: "#29364D", borderColor: "#54647D" },
  darkOptionRight: { backgroundColor: "#22503B", borderColor: "#61B891" },
  darkOptionWrong: { backgroundColor: "#5B2A32", borderColor: "#D7776A" },
  darkLockedLessonCard: { backgroundColor: "#26334A", borderColor: "#3C4B63" },
  darkTrack: { backgroundColor: "#46546A" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(18, 29, 50, 0.68)",
    padding: 16,
  },
  instructionsModal: {
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#FFF8E7",
    borderColor: "#F3C451",
    borderWidth: 2,
    borderRadius: 24,
    padding: 20,
  },
  modalEmoji: { fontSize: 54, marginBottom: 4 },
  modalEyebrow: {
    color: "#258EA3",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  modalTitle: {
    color: "#173B53",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32,
    textAlign: "center",
    marginTop: 4,
  },
  modalHeading: {
    color: "#173B53",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 16,
  },
  modalDescription: {
    color: "#36566A",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 5,
  },
  instructionList: { alignSelf: "stretch", gap: 12, marginTop: 18 },
  instructionRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  instructionText: { color: "#36566A", flex: 1, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  modalPlayButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#258EA3",
    borderRadius: 14,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  modalPlayButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  modalLaterButton: { alignItems: "center", justifyContent: "center", marginTop: 10, minHeight: 40 },
  modalLaterButtonText: { color: "#536D79", fontSize: 14, fontWeight: "800" },
});
