import LessonTrailScreen, { rep, type GradeScreenProps, type Subject } from "./LessonTrailScreen";

// ---------- Curriculum data ----------
// Kindergarten: three subjects, five lessons each, one minigame per lesson.
// Built from the K units: Letters and Sounds, Numbers and Shapes,
// Me / Family / Community, and Healthy Habits and Safety.

export const kinderSubjects: Subject[] = [
  {
    id: "reading",
    title: "Reading Comprehension",
    emoji: "📖",
    music: "reading",
    lessons: [
      {
        id: "letter-names",
        title: "Letter Names",
        emoji: "🔠",
        gameName: "Letter Hunt",
        blurb: "Find the letter that matches.",
        learn:
          "There are 26 letters from A to Z. Each letter has its own name and shape. Look closely to tell the letters apart.",
        game: {
          type: "choice",
          rounds: [
            { art: "🔠", q: "Which one is the letter B?", correct: "B", wrong: ["D", "P"] },
            { art: "🔠", q: "Which one is the letter M?", correct: "M", wrong: ["W", "N"] },
            { art: "🔠", q: "Which one is the letter S?", correct: "S", wrong: ["Z", "C"] },
            { art: "🔠", q: "Which one is the letter A?", correct: "A", wrong: ["V", "H"] },
            { art: "🔠", q: "Which one is the letter T?", correct: "T", wrong: ["L", "F"] },
          ],
        },
      },
      {
        id: "sound-safari",
        title: "Sound Safari",
        emoji: "🚌",
        gameName: "Sound Safari",
        blurb: "Ride the bus and find what starts with the sound.",
        learn:
          "Every word starts with a sound. Say the word slowly and listen: ball starts with the sound b, and sun starts with the sound s.",
        game: {
          type: "choice",
          rounds: [
            { art: "🚌", q: "Which one starts with the sound b?", correct: "🐻 bear", wrong: ["🐱 cat", "🐟 fish"] },
            { art: "🚌", q: "Which one starts with the sound s?", correct: "☀️ sun", wrong: ["🌙 moon", "🐶 dog"] },
            { art: "🚌", q: "Which one starts with the sound m?", correct: "🌙 moon", wrong: ["☀️ sun", "🐸 frog"] },
            { art: "🚌", q: "Which one starts with the sound d?", correct: "🐶 dog", wrong: ["🐱 cat", "🐷 pig"] },
            { art: "🚌", q: "Which one starts with the sound f?", correct: "🐟 fish", wrong: ["🐻 bear", "🌙 moon"] },
          ],
        },
      },
      {
        id: "alphabet-order",
        title: "ABC Order",
        emoji: "🔡",
        gameName: "Alphabet Train",
        blurb: "Tap the letters in ABC order.",
        learn:
          "The letters always go in the same order: A, B, C, D, and so on. Singing the ABC song helps us remember.",
        game: {
          type: "order",
          rounds: [
            { art: "🚂", prompt: "Tap the letters in ABC order.", items: ["A", "B", "C"] },
            { art: "🚂", prompt: "Tap the letters in ABC order.", items: ["D", "E", "F"] },
            { art: "🚂", prompt: "Tap the letters in ABC order.", items: ["G", "H", "I", "J"] },
            { art: "🚂", prompt: "Tap the letters in ABC order.", items: ["M", "N", "O", "P"] },
            { art: "🚂", prompt: "Tap the letters in ABC order.", items: ["T", "U", "V", "W"] },
          ],
        },
      },
      {
        id: "big-small-letters",
        title: "Big and Small Letters",
        emoji: "🔤",
        gameName: "Letter Pairs",
        blurb: "Match each big letter to its small letter.",
        learn:
          "Every letter has a big form and a small form. Big A and small a are partners!",
        game: {
          type: "choice",
          rounds: [
            { art: "🔤", q: "Which small letter matches A?", correct: "a", wrong: ["e", "o"] },
            { art: "🔤", q: "Which small letter matches B?", correct: "b", wrong: ["d", "p"] },
            { art: "🔤", q: "Which small letter matches D?", correct: "d", wrong: ["b", "q"] },
            { art: "🔤", q: "Which small letter matches M?", correct: "m", wrong: ["n", "w"] },
            { art: "🔤", q: "Which small letter matches G?", correct: "g", wrong: ["q", "p"] },
          ],
        },
      },
      {
        id: "story-time",
        title: "Listen and Read",
        emoji: "📚",
        gameName: "Story Time",
        blurb: "Read a tiny story, then answer questions about it.",
        learn:
          "Stories have characters and things that happen. Listen to the story first, then answer the questions about it.",
        game: {
          type: "choice",
          passage: "Pip is a small cat. Pip likes milk. Pip naps in the sun.",
          rounds: [
            { art: "🐱", q: "Who is this story about?", correct: "Pip", wrong: ["Mom", "A dog"] },
            { art: "🥛", q: "What does Pip like?", correct: "Milk", wrong: ["Rice", "Bread"] },
            { art: "☀️", q: "Where does Pip nap?", correct: "In the sun", wrong: ["In the rain", "In a car"] },
            { art: "🐱", q: "Is Pip big or small?", correct: "Small", wrong: ["Big", "Tall"] },
          ],
        },
      },
    ],
  },
  {
    id: "math",
    title: "Math",
    emoji: "🔢",
    music: "math",
    lessons: [
      {
        id: "counting",
        title: "Count 1 to 10",
        emoji: "🧺",
        gameName: "Market Count",
        blurb: "Count the items for the vendor's basket.",
        learn:
          "Touch each thing once as you count, and say the next number each time. The last number you say tells how many there are.",
        game: {
          type: "choice",
          rounds: [
            { art: rep("🥭", 3), q: "How many mangoes are there?", correct: "3", wrong: ["2", "4"] },
            { art: rep("🐟", 5), q: "How many fish are there?", correct: "5", wrong: ["4", "6"] },
            { art: rep("🥚", 2), q: "How many eggs are there?", correct: "2", wrong: ["1", "3"] },
            { art: rep("🥭", 7), q: "How many mangoes are there?", correct: "7", wrong: ["6", "8"] },
            { art: rep("🐟", 10), q: "How many fish are there?", correct: "10", wrong: ["9", "8"] },
          ],
        },
      },
      {
        id: "number-order",
        title: "Number Order",
        emoji: "🔟",
        gameName: "Number Hop",
        blurb: "Help the frog hop along the numbers in order.",
        learn:
          "Numbers go in order: 1, 2, 3, 4, 5, and on up to 10. Each number is one more than the one before it.",
        game: {
          type: "order",
          rounds: [
            { art: "🐸", prompt: "Tap the numbers in order.", items: ["1", "2", "3"] },
            { art: "🐸", prompt: "Tap the numbers in order.", items: ["4", "5", "6"] },
            { art: "🐸", prompt: "Tap the numbers in order.", items: ["2", "3", "4", "5"] },
            { art: "🐸", prompt: "Tap the numbers in order.", items: ["6", "7", "8", "9"] },
            { art: "🐸", prompt: "Tap the numbers in order.", items: ["7", "8", "9", "10"] },
          ],
        },
      },
      {
        id: "more-or-less",
        title: "More or Less",
        emoji: "⚖️",
        gameName: "Which Has More?",
        blurb: "Compare two groups and pick the right one.",
        learn:
          "The group with more things has the bigger number. The group with fewer things has the smaller number.",
        game: {
          type: "choice",
          rounds: [
            { art: `${rep("🍎", 3)}  vs  ${rep("🍎", 5)}`, q: "Which group has MORE?", correct: "Right group", wrong: ["Left group", "They are the same"] },
            { art: `${rep("🍌", 4)}  vs  ${rep("🍌", 2)}`, q: "Which group has MORE?", correct: "Left group", wrong: ["Right group", "They are the same"] },
            { art: `${rep("🐟", 6)}  vs  ${rep("🐟", 2)}`, q: "Which group has FEWER?", correct: "Right group", wrong: ["Left group", "They are the same"] },
            { art: `${rep("🥚", 1)}  vs  ${rep("🥚", 4)}`, q: "Which group has FEWER?", correct: "Left group", wrong: ["Right group", "They are the same"] },
            { art: `${rep("🥭", 5)}  vs  ${rep("🥭", 7)}`, q: "Which group has MORE?", correct: "Right group", wrong: ["Left group", "They are the same"] },
          ],
        },
      },
      {
        id: "shapes",
        title: "Shapes",
        emoji: "🔷",
        gameName: "House Builder",
        blurb: "Pick the right shape to build the house.",
        learn:
          "A circle is round. A square has 4 equal sides. A triangle has 3 sides. A rectangle has 4 sides, two long and two short.",
        game: {
          type: "choice",
          rounds: [
            { art: "🏠", q: "Which shape makes the roof?", correct: "Triangle", wrong: ["Circle", "Square"] },
            { art: "🚪", q: "Which shape makes the door?", correct: "Rectangle", wrong: ["Circle", "Triangle"] },
            { art: "☀️", q: "Which shape is the sun?", correct: "Circle", wrong: ["Square", "Rectangle"] },
            { art: "🪟", q: "Which shape is a window with 4 equal sides?", correct: "Square", wrong: ["Triangle", "Circle"] },
            { art: "🧱", q: "Which shape is a long brick?", correct: "Rectangle", wrong: ["Triangle", "Circle"] },
          ],
        },
      },
      {
        id: "put-together",
        title: "Put Them Together",
        emoji: "➕",
        gameName: "Basket Fill",
        blurb: "Count how many in all when two groups join.",
        learn:
          "When two groups join together, count them all to see how many in all. 2 and 1 more makes 3.",
        game: {
          type: "choice",
          rounds: [
            { art: `${rep("🥭", 2)}  ➕  ${rep("🥭", 1)}`, q: "2 mangoes and 1 more. How many in all?", correct: "3", wrong: ["2", "4"] },
            { art: `${rep("🥭", 3)}  ➕  ${rep("🥭", 1)}`, q: "3 mangoes and 1 more. How many in all?", correct: "4", wrong: ["3", "5"] },
            { art: `${rep("🐟", 2)}  ➕  ${rep("🐟", 3)}`, q: "2 fish and 3 more. How many in all?", correct: "5", wrong: ["4", "6"] },
            { art: `${rep("🥚", 3)}  ➕  ${rep("🥚", 3)}`, q: "3 eggs and 3 more. How many in all?", correct: "6", wrong: ["5", "7"] },
            { art: `${rep("🥭", 5)}  ➕  ${rep("🥭", 3)}`, q: "5 mangoes and 3 more. How many in all?", correct: "8", wrong: ["7", "9"] },
          ],
        },
      },
    ],
  },
  {
    id: "science",
    title: "Science",
    emoji: "🌱",
    music: "science",
    lessons: [
      {
        id: "my-family",
        title: "My Family",
        emoji: "👨‍👩‍👧",
        gameName: "Family Match",
        blurb: "Match each picture to the family member.",
        learn:
          "A family is the people who love and take care of you, like mother, father, grandmother, and grandfather. Your name and your age tell who you are.",
        game: {
          type: "choice",
          rounds: [
            { art: "👵", q: "Who is this?", correct: "Grandmother", wrong: ["Sister", "Teacher"] },
            { art: "👴", q: "Who is this?", correct: "Grandfather", wrong: ["Brother", "Doctor"] },
            { art: "👩", q: "Who is this?", correct: "Mother", wrong: ["Father", "Baby"] },
            { art: "👨", q: "Who is this?", correct: "Father", wrong: ["Mother", "Baby"] },
            { art: "👶", q: "Who is this?", correct: "Baby", wrong: ["Father", "Grandfather"] },
          ],
        },
      },
      {
        id: "community-helpers",
        title: "Community Helpers",
        emoji: "🧑‍🚒",
        gameName: "Who Can Help?",
        blurb: "Match the problem to the right helper.",
        learn:
          "Community helpers keep us safe and healthy. Firefighters, doctors, teachers, and mechanics each help in their own way.",
        game: {
          type: "choice",
          rounds: [
            { art: "🔥", q: "There is a fire! Who can help?", correct: "Firefighter", wrong: ["Teacher", "Farmer"] },
            { art: "🚗", q: "The car has a flat tire. Who can help?", correct: "Mechanic", wrong: ["Doctor", "Cook"] },
            { art: "🤒", q: "A child is sick. Who can help?", correct: "Doctor", wrong: ["Firefighter", "Mechanic"] },
            { art: "📚", q: "Who teaches you at school?", correct: "Teacher", wrong: ["Farmer", "Driver"] },
            { art: "💌", q: "Who brings letters to your house?", correct: "Mail carrier", wrong: ["Doctor", "Cook"] },
          ],
        },
      },
      {
        id: "polite-kids",
        title: "Polite Kids",
        emoji: "🙏",
        gameName: "Polite Kids",
        blurb: "Pick the polite thing to say.",
        learn:
          "Polite words make people feel happy: please, thank you, excuse me, and good morning. We say them to show respect.",
        game: {
          type: "choice",
          rounds: [
            { art: "🎁", q: "A friend gives you a gift. What do you say?", correct: "Thank you!", wrong: ["Give me more!", "Nothing"] },
            { art: "🌅", q: "You see your teacher in the morning. What do you say?", correct: "Good morning, Teacher!", wrong: ["Go away!", "Hurry up!"] },
            { art: "🧸", q: "You want to play with a toy. What do you say?", correct: "May I please play?", wrong: ["Give it to me!", "That is mine!"] },
            { art: "🚶", q: "You bump into a friend by accident. What do you say?", correct: "Sorry! Are you okay?", wrong: ["It is your fault!", "Move over!"] },
            { art: "👵", q: "You see your grandmother. What do you say?", correct: "Hello, Grandma!", wrong: ["Go away!", "Who are you?"] },
          ],
        },
      },
      {
        id: "healthy-routine",
        title: "Healthy Routine",
        emoji: "🧼",
        gameName: "Healthy Routine",
        blurb: "Put each healthy routine in the right order.",
        learn:
          "Washing your hands and brushing your teeth keep your body healthy. The steps work best in the right order.",
        game: {
          type: "order",
          rounds: [
            {
              art: "🧼",
              prompt: "Tap the steps to wash your hands in order.",
              items: ["Wet your hands", "Add soap", "Scrub", "Rinse and dry"],
            },
            {
              art: "🪥",
              prompt: "Tap the steps to brush your teeth in order.",
              items: ["Put on toothpaste", "Brush your teeth", "Spit it out", "Rinse your mouth"],
            },
            {
              art: "🍽️",
              prompt: "Tap the steps of dinner time in order.",
              items: ["Wash your hands", "Sit at the table", "Eat your food", "Brush your teeth"],
            },
          ],
        },
      },
      {
        id: "safe-crossing",
        title: "Safe Crossing",
        emoji: "🚦",
        gameName: "Safe Crossing",
        blurb: "Choose the safe way to cross the road.",
        learn:
          "Before you cross, stop at the curb. Wait for the green light, look left and right, and hold a grown-up's hand.",
        game: {
          type: "choice",
          rounds: [
            { art: "🔴", q: "The light is red. What do you do?", correct: "Stop and wait", wrong: ["Run across", "Close your eyes"] },
            { art: "🟢", q: "The light is green. What do you do first?", correct: "Look both ways", wrong: ["Run fast", "Close your eyes"] },
            { art: "🚸", q: "Where should you cross the road?", correct: "At the crosswalk", wrong: ["Between parked cars", "Anywhere"] },
            { art: "🧒", q: "Who should you cross the road with?", correct: "A grown-up", wrong: ["Nobody", "A stranger"] },
            { art: "👀", q: "Which way do you look before crossing?", correct: "Left and right", wrong: ["Up at the sky", "Down at your shoes"] },
          ],
        },
      },
    ],
  },
];

// Total lessons across all subjects. index.tsx can use this for the progress bar.
export const kinderCurriculumLessonCount = kinderSubjects.reduce(
  (sum, subject) => sum + subject.lessons.length,
  0
);
export const kinderLessonCount = kinderCurriculumLessonCount;

// Progress keys look like grade:k:online:<subject>:<lesson>.
export function KinderLessonsScreen(props: GradeScreenProps) {
  return (
    <LessonTrailScreen
      {...props}
      gradeLabel="Kindergarten"
      subjects={kinderSubjects}
      progressPrefix="grade:k:online"
    />
  );
}
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { awardModuleBadge } from "../data/badges";
import type { CategoryId } from "../data/learningContent";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import AnimatedLearningSticker from "./AnimatedLearningSticker";
import LessonInstructionModal from "./LessonInstructionModal";
import {
  HealthyRoutineGame,
  HouseBuilderGame,
  PoliteKidsGame,
  SafeCrossingGame,
  WhoCanHelpGame,
} from "./KindergartenGames";
import SoundSafariGame from "./SoundSafariGame";
import { playFeedback } from "../utils/soundEffects";
import { AppAppearanceContext } from "./CloudBackdrop";

// ---------- Curriculum data ----------

type Game = {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  playable: boolean;
};

type Unit = {
  id: string;
  number: number;
  title: string;
  emoji: string;
  focus: string;
  music: CategoryId;
  games: Game[];
};

const LEVELS = [1, 2, 3] as const;
const LEVEL_LABELS = ["Easy", "Standard", "Challenge"];

export const kindergartenUnits: Unit[] = [
  {
    id: "u1",
    number: 1,
    title: "Letters and Sounds",
    emoji: "🔤",
    focus: "A–Z, letter sounds, first sound of familiar words",
    music: "reading",
    games: [
      {
        id: "sound-safari",
        title: "Sound Safari",
        emoji: "🚌",
        blurb: "Ride the bus through town and tap every animal or object that starts with the sound you hear.",
        playable: true,
      },
    ],
  },
  {
    id: "u2",
    number: 2,
    title: "Numbers and Shapes",
    emoji: "🔢",
    focus: "Count 1–10, more or less, circle, square, triangle, rectangle",
    music: "math",
    games: [
      {
        id: "market-count",
        title: "Market Count",
        emoji: "🥭",
        blurb: "Put the right number of mangoes, fish, or eggs into the vendor's basket.",
        playable: true,
      },
      {
        id: "house-builder",
        title: "House Builder",
        emoji: "🏠",
        blurb: "Drag shapes into the silhouette to build a house.",
        playable: true,
      },
    ],
  },
  {
    id: "u3",
    number: 3,
    title: "Me, My Family, My Community",
    emoji: "👨‍👩‍👧",
    focus: "Full name, age, family, community helpers, polite words and respectful greetings",
    music: "science",
    games: [
      {
        id: "who-can-help",
        title: "Who Can Help?",
        emoji: "🚒",
        blurb: "Match the problem (fire, flat tire, sick child) to the right community helper.",
        playable: true,
      },
      {
        id: "polite-kids",
        title: "Polite Kids",
        emoji: "🙏",
        blurb: "Pick the polite response and watch the character react.",
        playable: true,
      },
    ],
  },
  {
    id: "u4",
    number: 4,
    title: "Healthy Habits and Safety",
    emoji: "🪥",
    focus: "Handwashing, toothbrushing, road safety, address and a parent's name",
    music: "science",
    games: [
      {
        id: "healthy-routine",
        title: "Healthy Routine",
        emoji: "🧼",
        blurb: "Drag the handwashing or toothbrushing steps into order.",
        playable: true,
      },
      {
        id: "safe-crossing",
        title: "Safe Crossing",
        emoji: "🚦",
        blurb: "Wait for the green light and look both ways before the character crosses.",
        playable: true,
      },
    ],
  },
];

// Total star slots (games x 3 levels). index.tsx uses this for the progress bar.
export const kindergartenLessonCount =
  kindergartenUnits.reduce((sum, unit) => sum + unit.games.length, 0) * LEVELS.length;

// Keeps the "kindergarten:" prefix that index.tsx already filters on.
const levelId = (unitId: string, gameId: string, level: number) =>
  `kindergarten:${unitId}:${gameId}:L${level}`;

// ---------- Props ----------

type Props = {
  onBack: () => void;
  onMusicCategoryChange: (category: CategoryId | null) => void;
  screenTimeLimitMinutes?: number;
  completedLessonIds: string[];
  lessonProgressReady: boolean;
  onCompleteLesson: (lessonId: string) => void;
  onRecordMistake: (lessonId: string) => void;
};

type View_ =
  | { kind: "units" }
  | { kind: "unit"; unitId: string }
  | { kind: "game"; unitId: string; gameId: string; level: number };

// ---------- Main screen ----------

export default function KindergartenLessonsScreen({
  onBack,
  onMusicCategoryChange,
  completedLessonIds,
  lessonProgressReady,
  onCompleteLesson,
  onRecordMistake,
}: Props) {
  const { darkMode } = useContext(AppAppearanceContext);
  const [view, setView] = useState<View_>({ kind: "units" });
  const [pendingGame, setPendingGame] = useState<{
    game: Game;
    unitId: string;
    level: number;
  } | null>(null);

  const activeUnit =
    view.kind === "units" ? null : kindergartenUnits.find((u) => u.id === view.unitId) ?? null;

  useEffect(() => {
    onMusicCategoryChange(activeUnit ? activeUnit.music : null);
  }, [activeUnit, onMusicCategoryChange]);

  const isDone = (unitId: string, gameId: string, level: number) =>
    completedLessonIds.includes(levelId(unitId, gameId, level));

  const unitStars = (unit: Unit) =>
    unit.games.reduce(
      (sum, g) => sum + LEVELS.filter((l) => isDone(unit.id, g.id, l)).length,
      0
    );

  const isUnitComplete = (unit: Unit) =>
    unitStars(unit) === unit.games.length * LEVELS.length;

  const completeLevel = (unit: Unit, game: Game, level: number) => {
    const completedId = levelId(unit.id, game.id, level);
    onCompleteLesson(completedId);
    const unitComplete = unit.games.every((unitGame) =>
      LEVELS.every(
        (unitLevel) =>
          (unitGame.id === game.id && unitLevel === level) ||
          isDone(unit.id, unitGame.id, unitLevel)
      )
    );
    if (!unitComplete) return;

    void awardModuleBadge({
      moduleId: `kindergarten:${unit.id}`,
      title: `Unit ${unit.number}: ${unit.title}`,
      summary: unit.focus,
      resultLabel: "Completed every level with a perfect score",
    }).catch((error: unknown) => {
      Alert.alert(
        "Badge not saved",
        error instanceof Error ? error.message : "Check device storage and try again."
      );
    });
  };

  // ----- Game view -----
  if (view.kind === "game" && activeUnit) {
    const game = activeUnit.games.find((g) => g.id === view.gameId);
    if (game) {
      const exit = () => setView({ kind: "unit", unitId: activeUnit.id });
      if (game.id === "market-count") {
        return (
          <MarketCountGame
            level={view.level}
            onExit={exit}
            onPassed={() => completeLevel(activeUnit, game, view.level)}
            onMistake={() => onRecordMistake(levelId(activeUnit.id, game.id, view.level))}
          />
        );
      }
      if (game.id === "sound-safari") {
        return (
          <SoundSafariGame
            level={view.level}
            onExit={exit}
            onPassed={() => completeLevel(activeUnit, game, view.level)}
            onMistake={() => onRecordMistake(levelId(activeUnit.id, game.id, view.level))}
          />
        );
      }
      const common = {
        level: view.level,
        onExit: exit,
        onPassed: () => completeLevel(activeUnit, game, view.level),
        onMistake: () => onRecordMistake(levelId(activeUnit.id, game.id, view.level)),
      };
      if (game.id === "who-can-help") return <WhoCanHelpGame {...common} />;
      if (game.id === "polite-kids") return <PoliteKidsGame {...common} />;
      if (game.id === "safe-crossing") return <SafeCrossingGame {...common} />;
      if (game.id === "house-builder") return <HouseBuilderGame {...common} />;
      if (game.id === "healthy-routine") return <HealthyRoutineGame {...common} />;
      return (
        <SafeAreaView style={[styles.page, darkMode && styles.darkScreen]}>
          <View style={styles.centerPanel}>
            <Text style={styles.bigEmoji}>{game.emoji}</Text>
            <Text style={styles.heroTitle}>{game.title}</Text>
            <Text style={styles.heroSub}>This game is coming soon!</Text>
            <Pressable onPress={exit} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }
  }

  // ----- Unit view -----
  if (view.kind === "unit" && activeUnit) {
    return (
      <SafeAreaView style={[styles.page, darkMode && styles.darkScreen]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => setView({ kind: "units" })} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
          <View style={[styles.hero, darkMode && styles.darkCard]}>
            <Text style={styles.bigEmoji}>{activeUnit.emoji}</Text>
            <Text style={[styles.heroTitle, darkMode && styles.darkText]}>
              Unit {activeUnit.number}: {activeUnit.title}
            </Text>
            <Text style={[styles.heroSub, darkMode && styles.darkMutedText]}>{activeUnit.focus}</Text>
            <Text style={[styles.starsText, darkMode && styles.darkText]}>
              ⭐ {unitStars(activeUnit)} / {activeUnit.games.length * LEVELS.length}
            </Text>
          </View>

          {activeUnit.games.map((game) => (
            <View key={game.id} style={[styles.card, darkMode && styles.darkCard]}>
              <Text style={styles.cardEmoji}>{game.emoji}</Text>
              <Text style={[styles.cardTitle, darkMode && styles.darkText]}>{game.title}</Text>
              <Text style={[styles.cardBlurb, darkMode && styles.darkMutedText]}>{game.blurb}</Text>
              {!game.playable ? <Text style={styles.soon}>COMING SOON</Text> : null}
              <View style={styles.levelRow}>
                {LEVELS.map((level) => {
                  const done = isDone(activeUnit.id, game.id, level);
                  const unlocked =
                    lessonProgressReady &&
                    (level === 1 || isDone(activeUnit.id, game.id, level - 1));
                  return (
                    <Pressable
                      key={level}
                      disabled={!unlocked}
                      onPress={() => setPendingGame({ game, unitId: activeUnit.id, level })}
                      style={[
                        styles.levelBtn,
                        done && styles.levelBtnDone,
                        !unlocked && styles.levelBtnLocked,
                      ]}
                    >
                      <Text style={styles.levelStar}>{done ? "⭐" : unlocked ? "▶" : "🔒"}</Text>
                      <Text style={[styles.levelText, darkMode && styles.darkText]}>{LEVEL_LABELS[level - 1]}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          <View style={[styles.badgeCard, darkMode && styles.darkCard]}>
            <Text style={[styles.cardTitle, darkMode && styles.darkText]}>
              {unitStars(activeUnit) === activeUnit.games.length * LEVELS.length
                ? "🏅 Unit badge earned!"
                : "🏅 Finish every level to earn the unit badge"}
            </Text>
          </View>
        </ScrollView>
        <LessonInstructionModal
          visible={pendingGame !== null}
          title={pendingGame?.game.title ?? ""}
          instruction={pendingGame?.game.blurb ?? ""}
          emoji={pendingGame?.game.emoji ?? ""}
          onStart={() => {
            if (!pendingGame) return;
            setView({
              kind: "game",
              unitId: pendingGame.unitId,
              gameId: pendingGame.game.id,
              level: pendingGame.level,
            });
            setPendingGame(null);
          }}
          onRequestClose={() => setPendingGame(null)}
        />
      </SafeAreaView>
    );
  }

  // ----- Unit picker -----
  return (
    <SafeAreaView style={[styles.page, darkMode && styles.darkScreen]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        <View style={[styles.hero, darkMode && styles.darkCard]}>
          <AnimatedLearningSticker variant="owl" size={78} />
          <Text style={[styles.heroTitle, darkMode && styles.darkText]}>Choose an adventure</Text>
          <Text style={[styles.heroSub, darkMode && styles.darkMutedText]}>Pick a unit to start playing!</Text>
        </View>
        {kindergartenUnits.map((unit, index) => {
          const unlocked =
            lessonProgressReady &&
            (index === 0 || isUnitComplete(kindergartenUnits[index - 1]));
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !unlocked }}
              disabled={!unlocked}
              key={unit.id}
              onPress={() => setView({ kind: "unit", unitId: unit.id })}
              style={[styles.card, darkMode && styles.darkCard, !unlocked && { opacity: 0.6 }]}
            >
              <Text style={styles.cardEmoji}>{unit.emoji}</Text>
              <Text style={[styles.cardTitle, darkMode && styles.darkText]}>
                Unit {unit.number}: {unit.title}
              </Text>
              <Text style={[styles.meta, darkMode && styles.darkMutedText]}>
                {unit.games.length} {unit.games.length === 1 ? "game" : "games"} · ⭐{" "}
                {unitStars(unit)}/{unit.games.length * LEVELS.length} ·{" "}
                {unlocked ? "Open →" : "🔒 Locked"}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Palengke Count (playable) ----------

const ROUNDS = 3;
const MAX_BY_LEVEL = [5, 8, 10];
const PRODUCE = [
  { emoji: "🥭", name: "mangoes" },
  { emoji: "🐟", name: "fish" },
  { emoji: "🥚", name: "eggs" },
];

function MarketCountGame({
  level,
  onExit,
  onPassed,
  onMistake,
}: {
  level: number;
  onExit: () => void;
  onPassed: () => void;
  onMistake: () => void;
}) {
  const { darkMode } = useContext(AppAppearanceContext);
  const max = MAX_BY_LEVEL[level - 1] ?? 5;
  const targets = useMemo(
    () => Array.from({ length: ROUNDS }, () => 1 + Math.floor(Math.random() * max)),
    [max]
  );
  const [round, setRound] = useState(0);
  const [count, setCount] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [finished, setFinished] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const item = PRODUCE[round % PRODUCE.length];
  const target = targets[round];

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    []
  );

  const next = (wasWrong = false) => {
    const nextMistakes = mistakes + (wasWrong ? 1 : 0);
    setMistakes(nextMistakes);
    if (round + 1 >= ROUNDS) {
      setFinished(true);
      if (nextMistakes === 0) onPassed();
      return;
    }
    setRound(round + 1);
    setCount(0);
    setChecked(null);
  };

  const check = () => {
    const correct = count === target;
    setChecked(correct);
    playFeedback(correct ? "success" : "error");
    if (correct) setScore((s) => s + 1);
    else {
      onMistake();
      advanceTimer.current = setTimeout(() => next(true), 900);
    }
  };

  if (finished) {
    const passed = mistakes === 0;
    return (
      <SafeAreaView style={[styles.page, darkMode && styles.darkScreen]}>
        <View style={styles.centerPanel}>
          <Text style={styles.bigEmoji}>{passed ? "🌟" : "💪"}</Text>
          <Text style={[styles.heroTitle, darkMode && styles.darkText]}>{passed ? "Great job!" : "Try again!"}</Text>
          <Text style={[styles.heroSub, darkMode && styles.darkMutedText]}>
            You got {score} of {ROUNDS} right, with {mistakes} {mistakes === 1 ? "mistake" : "mistakes"}.
            {passed ? " You earned a star!" : " Try the whole lesson again for a perfect score."}
          </Text>
          <Pressable onPress={onExit} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>BACK TO GAMES</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.page, darkMode && styles.darkScreen]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={onExit} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        <View style={[styles.hero, darkMode && styles.darkCard]}>
          <Text style={[styles.meta, darkMode && styles.darkMutedText]}>
            Round {round + 1} of {ROUNDS} · {LEVEL_LABELS[level - 1]}
          </Text>
          <Text style={[styles.heroTitle, darkMode && styles.darkText]}>Market Count</Text>
          <Text style={[styles.heroSub, darkMode && styles.darkMutedText]}>
            Put {target} {item.name} in the basket!
          </Text>
          <Text style={[styles.targetNumber, darkMode && styles.darkText]}>{target}</Text>
        </View>

        <View style={[styles.basket, darkMode && styles.darkCard]}>
          <Text style={[styles.basketLabel, darkMode && styles.darkText]}>🧺 Basket: {count}</Text>
          <View style={styles.basketItems}>
            {Array.from({ length: count }, (_, i) => (
              <Text key={i} style={styles.basketEmoji}>
                {item.emoji}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.counterRow}>
          <Pressable
            disabled={checked !== null || count === 0}
            onPress={() => setCount((c) => Math.max(0, c - 1))}
            style={[styles.counterBtn, styles.counterMinus]}
          >
            <Text style={styles.counterText}>−</Text>
          </Pressable>
          <Text style={styles.counterEmoji}>{item.emoji}</Text>
          <Pressable
            disabled={checked !== null || count >= max}
            onPress={() => setCount((c) => Math.min(max, c + 1))}
            style={styles.counterBtn}
          >
            <Text style={styles.counterText}>+</Text>
          </Pressable>
        </View>

        {checked === null ? (
          <Pressable onPress={check} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>CHECK</Text>
          </Pressable>
        ) : (
          <>
            <Text style={[styles.feedback, checked ? styles.good : styles.bad]}>
              {checked ? "🦉 Correct! Great counting!" : `🦉 Almost! The answer was ${target}.`}
            </Text>
            {checked ? (
              <Pressable onPress={() => next()} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>
                  {round + 1 >= ROUNDS ? "SEE RESULTS" : "NEXT"}
                </Text>
              </Pressable>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Styles (same palette as index.tsx) ----------

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "transparent" },
  scroll: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 40 },
  centerPanel: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
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
  heroTitle: { color: "#173B53", fontSize: 24, fontWeight: "900", textAlign: "center" },
  heroSub: { color: "#36566A", fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 4 },
  starsText: { color: "#173B53", fontSize: 16, fontWeight: "800", marginTop: 8 },
  card: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D5F5EB",
    borderWidth: 2,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardEmoji: { fontSize: 42, marginBottom: 4 },
  cardTitle: { color: "#173B53", fontSize: 17, fontWeight: "900", textAlign: "center" },
  cardBlurb: { color: "#36566A", fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 4 },
  meta: { color: "#4B6A7A", fontSize: 13, fontWeight: "800", marginTop: 6 },
  soon: { color: "#A85B17", fontSize: 12, fontWeight: "900", marginTop: 6 },
  levelRow: { flexDirection: "row", gap: 8, marginTop: 12, width: "100%" },
  levelBtn: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFF0AA",
    borderColor: "#F3C451",
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 10,
  },
  levelBtnDone: { backgroundColor: "#D5F5EB", borderColor: "#66CBB1" },
  levelBtnLocked: { backgroundColor: "#E2E8E7", borderColor: "#B9C6C4", opacity: 0.8 },
  levelStar: { fontSize: 20 },
  levelText: { color: "#173B53", fontSize: 12, fontWeight: "800", marginTop: 2 },
  badgeCard: {
    alignItems: "center",
    backgroundColor: "#FFF8E7",
    borderColor: "#F3C451",
    borderWidth: 2,
    borderRadius: 20,
    padding: 14,
  },
  targetNumber: { color: "#F17D65", fontSize: 64, fontWeight: "900", marginTop: 4 },
  basket: {
    backgroundColor: "#FFF0AA",
    borderColor: "#F3C451",
    borderWidth: 2,
    borderRadius: 20,
    padding: 14,
    minHeight: 120,
    marginBottom: 14,
  },
  basketLabel: { color: "#173B53", fontSize: 16, fontWeight: "900", marginBottom: 8 },
  darkScreen: { backgroundColor: "rgba(18, 29, 50, 0.32)" },
  darkCard: { backgroundColor: "#303D55", borderColor: "#465671" },
  darkText: { color: "#E4EAF3" },
  darkMutedText: { color: "#B9C5D8" },
  basketItems: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  basketEmoji: { fontSize: 32 },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 16,
  },
  counterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#258EA3",
  },
  counterMinus: { backgroundColor: "#B85B42" },
  counterText: { color: "#FFFFFF", fontSize: 40, fontWeight: "900", lineHeight: 44 },
  counterEmoji: { fontSize: 48 },
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
  feedback: { fontSize: 18, fontWeight: "900", textAlign: "center", marginVertical: 8 },
  good: { color: "#28543A" },
  bad: { color: "#9C3E32" },
});
