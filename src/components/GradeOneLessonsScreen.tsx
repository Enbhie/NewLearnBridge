import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { CategoryId } from "../data/learningContent";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import { AppAppearanceContext } from "./CloudBackdrop";
import {
  BlendTrainGame,
  ChooseKindlyGame,
  ChoreQuestGame,
  CommunityBuilderGame,
  NumberHopGame,
  SentenceBuilderGame,
  ShopkeeperGame,
  StoryTimeGame,
  TrashSorterGame,
  WordHuntGame,
} from "./GradeOneGames";

// ---------- Curriculum data ----------
// Grade 1: three subjects, five lessons each, one minigame per lesson.

export const gradeOneSubjects: Subject[] = [
  {
    id: "reading",
    title: "Reading Comprehension",
    emoji: "📖",
    music: "reading",
    lessons: [
      {
        id: "letter-sounds",
        title: "Letter Sounds",
        emoji: "🔤",
        gameName: "Blend Train",
        blurb: "Tap the sounds in order to build a word.",
        learn:
          "Every letter makes a sound. When we blend the sounds together, we can read a word. Say each sound, then slide them together: c, a, t makes cat!",
        game: {
          type: "order",
          rounds: [
            { art: "🐱", prompt: "Tap the sounds in order to build the word.", items: ["c", "a", "t"] },
            { art: "🐶", prompt: "Tap the sounds in order to build the word.", items: ["d", "o", "g"] },
            { art: "☀️", prompt: "Tap the sounds in order to build the word.", items: ["s", "u", "n"] },
            { art: "🐷", prompt: "Tap the sounds in order to build the word.", items: ["p", "i", "g"] },
            { art: "🎩", prompt: "Tap the sounds in order to build the word.", items: ["h", "a", "t"] },
          ],
        },
      },
      {
        id: "sight-words",
        title: "Sight Words",
        emoji: "👀",
        gameName: "Word Hunt",
        blurb: "Find the sight word hiding among look-alikes.",
        learn:
          "Sight words show up in almost every story, like the, and, was, and you. When you know them by sight, reading gets faster.",
        game: {
          type: "choice",
          rounds: [
            { art: "🔎", q: "Which word says was?", correct: "was", wrong: ["saw", "war", "wax"] },
            { art: "🔎", q: "Which word says said?", correct: "said", wrong: ["sad", "sit", "say"] },
            { art: "🔎", q: "Which word says and?", correct: "and", wrong: ["end", "an", "hand"] },
            { art: "🔎", q: "Which word says you?", correct: "you", wrong: ["your", "yet", "toy"] },
            { art: "🔎", q: "Which word says the?", correct: "the", wrong: ["they", "then", "thin"] },
          ],
        },
      },
      {
        id: "sentences",
        title: "Build a Sentence",
        emoji: "🧱",
        gameName: "Sentence Builder",
        blurb: "Put the word tiles in order to make a sentence.",
        learn:
          "A sentence tells a whole idea. It starts with a capital letter, and it makes sense only when the words are in the right order.",
        game: {
          type: "order",
          rounds: [
            { art: "📚", prompt: "Tap the words in order to make a sentence.", items: ["I", "like", "to", "read"] },
            { art: "🐈", prompt: "Tap the words in order to make a sentence.", items: ["The", "cat", "is", "big"] },
            { art: "🏫", prompt: "Tap the words in order to make a sentence.", items: ["We", "go", "to", "school"] },
            { art: "🐕", prompt: "Tap the words in order to make a sentence.", items: ["My", "dog", "can", "run"] },
            { art: "🧢", prompt: "Tap the words in order to make a sentence.", items: ["She", "has", "a", "red", "hat"] },
          ],
        },
      },
      {
        id: "picture-words",
        title: "Picture Words",
        emoji: "🖼️",
        gameName: "Picture Match",
        blurb: "Match each picture to its word.",
        learn:
          "Words name the things around us. Look closely at the picture, then pick the word that matches it.",
        game: {
          type: "choice",
          rounds: [
            { art: "🍎", q: "What is this?", correct: "apple", wrong: ["book", "moon", "shoe"] },
            { art: "🚌", q: "What is this?", correct: "bus", wrong: ["bat", "bed", "box"] },
            { art: "🌳", q: "What is this?", correct: "tree", wrong: ["tray", "star", "sun"] },
            { art: "🐟", q: "What is this?", correct: "fish", wrong: ["frog", "fan", "fork"] },
            { art: "🏠", q: "What is this?", correct: "house", wrong: ["horse", "hand", "hat"] },
          ],
        },
      },
      {
        id: "story-time",
        title: "Story Time",
        emoji: "📚",
        gameName: "Story Quiz",
        blurb: "Read a short story, then answer questions about it.",
        learn:
          "Good readers think about who, what, and why while they read. Read the story first, then answer the questions about it.",
        game: {
          type: "choice",
          passage:
            "Mia has two mangoes. Her friend Ben has none. Mia gives one mango to Ben. Ben says, Thank you! They eat the mangoes together.",
          rounds: [
            { art: "🥭", q: "Who has two mangoes at the start?", correct: "Mia", wrong: ["Ben", "Mom"] },
            { art: "🥭", q: "What does Mia give to Ben?", correct: "A mango", wrong: ["A book", "A ball"] },
            { art: "💬", q: "What does Ben say?", correct: "Thank you!", wrong: ["Goodbye!", "No!"] },
            { art: "🥭", q: "How many mangoes does Mia have after she gives one away?", correct: "One", wrong: ["Two", "Three"] },
            { art: "💛", q: "What kind thing did Mia do?", correct: "She shared", wrong: ["She hid it", "She ate it all"] },
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
        id: "numbers-to-100",
        title: "Numbers to 100",
        emoji: "💯",
        gameName: "Number Hop",
        blurb: "Count, compare, and build numbers on the number line.",
        learn:
          "Count forward and backward to 100. Numbers are made of tens and ones: in 34, the 3 means 3 tens and the 4 means 4 ones.",
        game: {
          type: "choice",
          rounds: [
            { art: "🐸", q: "9, 10, 11, __ What number comes next?", correct: "12", wrong: ["13", "10"] },
            { art: "🐸", q: "Count backward: 30, 29, __", correct: "28", wrong: ["31", "27"] },
            { art: `${rep("🟦", 4)}  ${rep("🟨", 2)}`, q: "4 tens and 2 ones make what number?", correct: "42", wrong: ["24", "6"] },
            { art: "🐸", q: "Which number is greater?", correct: "68", wrong: ["58", "46"] },
            { art: "🐸", q: "What number comes just before 100?", correct: "99", wrong: ["98", "101"] },
          ],
        },
      },
      {
        id: "add-subtract-within-20",
        title: "Add and Subtract Within 20",
        emoji: "➕",
        gameName: "Number Hop: Add and Take Away",
        blurb: "Use small jumps to add and subtract within 20.",
        learn:
          "Addition joins groups together, and subtraction takes some away. Count on to add and count back to subtract, keeping the answer within 20.",
        game: {
          type: "choice",
          rounds: [
            { art: `${rep("🥭", 6)}  ➕  ${rep("🥭", 3)}`, q: "What is 6 + 3?", correct: "9", wrong: ["8", "10"] },
            { art: `${rep("🍎", 12)}  ➖  ${rep("🍎", 4)}`, q: "What is 12 - 4?", correct: "8", wrong: ["7", "9"] },
            { q: "What is 8 + 7?", correct: "15", wrong: ["14", "16"] },
            { q: "What is 17 - 9?", correct: "8", wrong: ["7", "9"] },
            { art: "⚽", q: "You have 10 balls and get 5 more. How many now?", correct: "15", wrong: ["14", "16"] },
          ],
        },
      },
      {
        id: "shapes",
        title: "Shapes Around Us",
        emoji: "🔷",
        gameName: "Shape Match",
        blurb: "Find circles, squares, triangles, and rectangles.",
        learn:
          "A circle is round. A triangle has 3 sides. A square has 4 equal sides, and a rectangle has 4 sides with opposite sides equal.",
        game: {
          type: "choice",
          rounds: [
            { art: "🍕", q: "What shape is a slice of pizza?", correct: "Triangle", wrong: ["Circle", "Square"] },
            { art: "⚽", q: "What shape is a ball?", correct: "Circle", wrong: ["Rectangle", "Triangle"] },
            { art: "🪟", q: "A window has 4 equal sides. What shape is it?", correct: "Square", wrong: ["Circle", "Triangle"] },
            { art: "📕", q: "What shape is a book cover?", correct: "Rectangle", wrong: ["Circle", "Triangle"] },
            { art: "🔺", q: "How many sides does a triangle have?", correct: "3", wrong: ["4", "5"] },
          ],
        },
      },
      {
        id: "telling-time",
        title: "Telling Time",
        emoji: "🕒",
        gameName: "Clock Match",
        blurb: "Read the hour and half-hour on a clock.",
        learn:
          "The short hand shows the hour and the long hand shows the minutes. When the long hand points to 12, it is an o'clock time; when it points to 6, it is half past the hour.",
        game: {
          type: "choice",
          rounds: [
            { art: "🕒", q: "The short hand points to 3 and the long hand to 12. What time is it?", correct: "3 o'clock", wrong: ["12 o'clock", "6 o'clock"] },
            { art: "🕕", q: "The short hand points to 6 and the long hand to 12. What time is it?", correct: "6 o'clock", wrong: ["12 o'clock", "3 o'clock"] },
            { art: "🕞", q: "The short hand is between 3 and 4; the long hand points to 6. What time is it?", correct: "Half past 3", wrong: ["Half past 6", "3 o'clock"] },
            { art: "🕘", q: "The long hand points to 12. Is it an o'clock or half-past time?", correct: "O'clock", wrong: ["Half past", "Quarter past"] },
            { art: "🕡", q: "The long hand points to 6. Is it an o'clock or half-past time?", correct: "Half past", wrong: ["O'clock", "Quarter past"] },
          ],
        },
      },
      {
        id: "money",
        title: "Coins and Change",
        emoji: "🪙",
        gameName: "Shopkeeper: Change Challenge",
        blurb: "Run a corner store and give the right change.",
        learn:
          "Coins and bills have different values. Add money to find the total cost, and subtract the price from the amount paid to find the change.",
        game: {
          type: "choice",
          rounds: [
            { art: "🍬", q: "Candy costs ₱3. You pay ₱5. How much change?", correct: "₱2", wrong: ["₱1", "₱3"] },
            { art: "✏️", q: "A pencil costs ₱6. You pay ₱10. How much change?", correct: "₱4", wrong: ["₱3", "₱5"] },
            { art: "🍞", q: "Bread costs ₱7. You pay ₱10. How much change?", correct: "₱3", wrong: ["₱2", "₱4"] },
            { art: "⚽", q: "A ball costs ₱12. You pay ₱20. How much change?", correct: "₱8", wrong: ["₱6", "₱10"] },
            { art: "🧸", q: "A toy costs ₱15. You pay ₱20. How much change?", correct: "₱5", wrong: ["₱4", "₱10"] },
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
        id: "weather",
        title: "Weather",
        emoji: "🌦️",
        gameName: "Weather Match",
        blurb: "Pick the right thing for each kind of weather.",
        learn:
          "Weather tells us if it is sunny, rainy, or windy. We choose what to wear and what to bring based on the weather.",
        game: {
          type: "choice",
          rounds: [
            { art: "☔", q: "It is raining. What should you bring?", correct: "Umbrella", wrong: ["Sunglasses", "Kite"] },
            { art: "🥵", q: "The sun is very hot. What helps you?", correct: "A hat", wrong: ["A raincoat", "Boots"] },
            { art: "💨", q: "Strong wind is blowing. What can fly high?", correct: "A kite", wrong: ["A rock", "A shoe"] },
            { art: "🌧️", q: "Which is a rainy day?", correct: "🌧️", wrong: ["☀️", "🌈"] },
            { art: "☀️", q: "Which is a sunny day?", correct: "☀️", wrong: ["🌧️", "⛈️"] },
          ],
        },
      },
      {
        id: "plants",
        title: "How Plants Grow",
        emoji: "🌱",
        gameName: "Grow the Plant",
        blurb: "Put the steps of plant growth in order.",
        learn:
          "Plants start as seeds. With water and sunlight, a seed grows into a sprout, then a plant, then a flower.",
        game: {
          type: "order",
          rounds: [
            {
              art: "🌰",
              prompt: "Tap the stages in order, from first to last.",
              items: ["Seed", "Sprout", "Plant", "Flower"],
            },
            {
              art: "🌻",
              prompt: "Tap the plant parts from the ground up.",
              items: ["Roots", "Stem", "Leaves", "Flower"],
            },
            {
              art: "🪴",
              prompt: "Tap the steps to plant a seed in order.",
              items: ["Dig a hole", "Put in the seed", "Cover with soil", "Add water"],
            },
          ],
        },
      },
      {
        id: "animals",
        title: "Animal Friends",
        emoji: "🐄",
        gameName: "Animal Match",
        blurb: "Learn where animals live and what they give us.",
        learn:
          "Animals live in different places and some give us useful things, like eggs from hens and honey from bees.",
        game: {
          type: "choice",
          rounds: [
            { art: "🐄", q: "Where does a cow live?", correct: "Farm", wrong: ["Ocean", "Tree"] },
            { art: "🐟", q: "Where does a fish live?", correct: "Water", wrong: ["Farm", "Nest"] },
            { art: "🐦", q: "Where does a bird make its home?", correct: "Nest", wrong: ["Water", "Barn"] },
            { art: "🐝", q: "What does a bee make?", correct: "Honey", wrong: ["Milk", "Eggs"] },
            { art: "🐔", q: "What does a hen give us?", correct: "Eggs", wrong: ["Honey", "Milk"] },
          ],
        },
      },
      {
        id: "waste",
        title: "Sorting Trash",
        emoji: "♻️",
        gameName: "Trash Sorter",
        blurb: "Drop each item into the right bin.",
        learn:
          "Food and leaves rot and can become compost. Bottles, cans, and paper can be recycled and used again.",
        game: {
          type: "choice",
          rounds: [
            { art: "🍌", q: "Where does a banana peel go?", correct: "Compost bin", wrong: ["Recycle bin"] },
            { art: "🥤", q: "Where does a plastic bottle go?", correct: "Recycle bin", wrong: ["Compost bin"] },
            { art: "🍂", q: "Where do dry leaves go?", correct: "Compost bin", wrong: ["Recycle bin"] },
            { art: "🥫", q: "Where does a tin can go?", correct: "Recycle bin", wrong: ["Compost bin"] },
            { art: "🍎", q: "Where does an apple core go?", correct: "Compost bin", wrong: ["Recycle bin"] },
          ],
        },
      },
      {
        id: "healthy-habits",
        title: "Healthy Habits",
        emoji: "🧼",
        gameName: "Healthy Routine",
        blurb: "Put each healthy routine in the right order.",
        learn:
          "Washing hands, brushing teeth, and sleeping on time keep our bodies healthy. The steps work best in the right order.",
        game: {
          type: "order",
          rounds: [
            {
              art: "🧼",
              prompt: "Tap the steps to wash your hands in order.",
              items: ["Wet your hands", "Add soap", "Scrub for 20 seconds", "Rinse and dry"],
            },
            {
              art: "🪥",
              prompt: "Tap the steps to brush your teeth in order.",
              items: ["Put on toothpaste", "Brush all your teeth", "Spit it out", "Rinse your mouth"],
            },
            {
              art: "😴",
              prompt: "Tap the steps of your bedtime in order.",
              items: ["Eat dinner", "Brush your teeth", "Put on pajamas", "Go to sleep"],
            },
          ],
        },
      },
    ],
  },
];

// Total star slots (games x 3 levels). index.tsx uses this for the progress bar.
export const gradeOneLessonCount =
  gradeOneUnits.reduce((sum, unit) => sum + unit.games.length, 0) * LEVELS.length;

// Prefix matches how index.tsx filters Grade 1 progress.
const levelId = (unitId: string, gameId: string, level: number) =>
  `grade:1:online:${unitId}:${gameId}:L${level}`;

// ---------- Props ----------

type Props = {
  onBack: () => void;
  onMusicCategoryChange: (category: CategoryId | null) => void;
  screenTimeLimitMinutes?: number;
  completedLessonIds: string[];
  lessonProgressReady: boolean;
  onCompleteLesson: (lessonId: string) => void;
};

type View_ =
  | { kind: "units" }
  | { kind: "unit"; unitId: string }
  | { kind: "game"; unitId: string; gameId: string; level: number };

// ---------- Main screen ----------

export default function GradeOneLessonsScreen({
  onBack,
  onMusicCategoryChange,
  completedLessonIds,
  lessonProgressReady,
  onCompleteLesson,
}: Props) {
  const { darkMode } = useContext(AppAppearanceContext);
  const [view, setView] = useState<View_>({ kind: "units" });

  const activeUnit =
    view.kind === "units" ? null : gradeOneUnits.find((u) => u.id === view.unitId) ?? null;

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

  // ----- Game view -----
  if (view.kind === "game" && activeUnit) {
    const game = activeUnit.games.find((g) => g.id === view.gameId);
    if (game) {
      const common = {
        level: view.level,
        onExit: () => setView({ kind: "unit", unitId: activeUnit.id }),
        onPassed: () => onCompleteLesson(levelId(activeUnit.id, game.id, view.level)),
      };
      switch (game.id) {
        case "blend-train": return <BlendTrainGame {...common} />;
        case "word-hunt": return <WordHuntGame {...common} />;
        case "sentence-builder": return <SentenceBuilderGame {...common} />;
        case "story-time": return <StoryTimeGame {...common} />;
        case "shopkeeper": return <ShopkeeperGame {...common} />;
        case "number-hop": return <NumberHopGame {...common} />;
        case "trash-sorter": return <TrashSorterGame {...common} />;
        case "community-builder": return <CommunityBuilderGame {...common} />;
        case "choose-kindly": return <ChooseKindlyGame {...common} />;
        case "chore-quest": return <ChoreQuestGame {...common} />;
      }
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
                      onPress={() =>
                        setView({ kind: "game", unitId: activeUnit.id, gameId: game.id, level })
                      }
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
      </SafeAreaView>
    );
  }

  // ----- Unit picker -----
  return (
    <LessonTrailScreen
      {...props}
      gradeLabel="Grade 1"
      subjects={gradeOneSubjects}
      progressPrefix="grade:1:online"
    />
  );
}
