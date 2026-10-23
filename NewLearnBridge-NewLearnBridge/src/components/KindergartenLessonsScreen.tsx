import { useContext, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { CategoryId } from "../data/learningContent";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
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
}: Props) {
  const { darkMode } = useContext(AppAppearanceContext);
  const [view, setView] = useState<View_>({ kind: "units" });

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
            onPassed={() => onCompleteLesson(levelId(activeUnit.id, game.id, view.level))}
          />
        );
      }
      if (game.id === "sound-safari") {
        return (
          <SoundSafariGame
            level={view.level}
            onExit={exit}
            onPassed={() => onCompleteLesson(levelId(activeUnit.id, game.id, view.level))}
          />
        );
      }
      const common = {
        level: view.level,
        onExit: exit,
        onPassed: () => onCompleteLesson(levelId(activeUnit.id, game.id, view.level)),
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
    <SafeAreaView style={[styles.page, darkMode && styles.darkScreen]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        <View style={[styles.hero, darkMode && styles.darkCard]}>
          <Text style={styles.bigEmoji}>🌈</Text>
          <Text style={[styles.heroTitle, darkMode && styles.darkText]}>Choose an adventure</Text>
          <Text style={[styles.heroSub, darkMode && styles.darkMutedText]}>Pick a unit to start playing!</Text>
        </View>
        {kindergartenUnits.map((unit) => (
          <Pressable
            key={unit.id}
            onPress={() => setView({ kind: "unit", unitId: unit.id })}
            style={[styles.card, darkMode && styles.darkCard]}
          >
            <Text style={styles.cardEmoji}>{unit.emoji}</Text>
            <Text style={[styles.cardTitle, darkMode && styles.darkText]}>
              Unit {unit.number}: {unit.title}
            </Text>
            <Text style={[styles.meta, darkMode && styles.darkMutedText]}>
              {unit.games.length} {unit.games.length === 1 ? "game" : "games"} · ⭐{" "}
              {unitStars(unit)}/{unit.games.length * LEVELS.length} →
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------- Palengke Count (playable) ----------

const ROUNDS = 3;
const PASS_SCORE = 2; // "most answers right"
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
}: {
  level: number;
  onExit: () => void;
  onPassed: () => void;
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
  const [checked, setChecked] = useState<null | boolean>(null);
  const [finished, setFinished] = useState(false);

  const item = PRODUCE[round % PRODUCE.length];
  const target = targets[round];

  const check = () => {
    const correct = count === target;
    setChecked(correct);
    playFeedback(correct ? "success" : "error");
    if (correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (round + 1 >= ROUNDS) {
      setFinished(true);
      // score state is already updated by now because check() ran earlier
      if (score >= PASS_SCORE) onPassed();
      return;
    }
    setRound(round + 1);
    setCount(0);
    setChecked(null);
  };

  if (finished) {
    const passed = score >= PASS_SCORE;
    return (
      <SafeAreaView style={[styles.page, darkMode && styles.darkScreen]}>
        <View style={styles.centerPanel}>
          <Text style={styles.bigEmoji}>{passed ? "🌟" : "💪"}</Text>
          <Text style={[styles.heroTitle, darkMode && styles.darkText]}>{passed ? "Great job!" : "Try again!"}</Text>
          <Text style={[styles.heroSub, darkMode && styles.darkMutedText]}>
            You got {score} of {ROUNDS} right.
            {passed ? " You earned a star!" : " Get 2 right to earn a star."}
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
            <Pressable onPress={next} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>
                {round + 1 >= ROUNDS ? "SEE RESULTS" : "NEXT"}
              </Text>
            </Pressable>
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
