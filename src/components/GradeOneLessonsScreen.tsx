import { useContext, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { CategoryId } from "../data/learningContent";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import { AppAppearanceContext } from "./CloudBackdrop";
import LessonInstructionModal from "./LessonInstructionModal";
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

type Game = {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
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

export const gradeOneUnits: Unit[] = [
  {
    id: "u1",
    number: 1,
    title: "Reading and Literacy",
    emoji: "📖",
    focus: "Letter-sound blending, sight words, reading short sentences and stories",
    music: "reading",
    games: [
      { id: "blend-train", title: "Blend Train", emoji: "🚂", blurb: "Each train car holds a sound. Tap them in order to blend a word and move the train." },
      { id: "word-hunt", title: "Word Hunt", emoji: "🔎", blurb: "Find the hidden sight words in a busy town scene." },
    ],
  },
  {
    id: "u2",
    number: 2,
    title: "Language",
    emoji: "🗣️",
    focus: "Listening and speaking, vocabulary, building and writing simple sentences",
    music: "reading",
    games: [
      { id: "sentence-builder", title: "Sentence Builder", emoji: "🧱", blurb: "Arrange word tiles into a sentence, with audio read-back and a picture hint." },
      { id: "story-time", title: "Story Time", emoji: "📚", blurb: "Listen to a short story, then answer picture-based questions." },
    ],
  },
  {
    id: "u3",
    number: 3,
    title: "Mathematics",
    emoji: "🧮",
    focus: "Numbers to 100, tens and ones, adding and subtracting within 20, shapes, telling time",
    music: "math",
    games: [
      { id: "shopkeeper", title: "Shopkeeper: Change Challenge", emoji: "🏪", blurb: "Run a corner store, take payment, and count out the change with coins and bills." },
      { id: "number-hop", title: "Number Hop", emoji: "🐸", blurb: "A character hops along a number line to solve problems." },
    ],
  },
  {
    id: "u4",
    number: 4,
    title: "Community and Country",
    emoji: "🏘️",
    focus: "Family and community helpers, our community, weather, plants and animals, waste segregation",
    music: "science",
    games: [
      { id: "trash-sorter", title: "Trash Sorter", emoji: "🗑️", blurb: "Drop items into the right bins on a conveyor that speeds up." },
      { id: "community-builder", title: "Community Builder", emoji: "🏗️", blurb: "Build a small town by matching helpers and places to situations." },
    ],
  },
  {
    id: "u5",
    number: 5,
    title: "Good Manners and Real-Life Skills",
    emoji: "🤝",
    focus: "Respect and manners, honesty, chores, coins and bills, buying and getting change, daily schedule",
    music: "science",
    games: [
      { id: "choose-kindly", title: "Choose Kindly", emoji: "💛", blurb: "Short branching stories where you choose what to do and see a gentle consequence." },
      { id: "chore-quest", title: "Chore Quest", emoji: "🧹", blurb: "Order a daily schedule and match chores to the time of day." },
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
  const [pendingGame, setPendingGame] = useState<{
    game: Game;
    unitId: string;
    level: number;
  } | null>(null);

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
          <Text style={styles.bigEmoji}>🌈</Text>
          <Text style={[styles.heroTitle, darkMode && styles.darkText]}>Choose an adventure</Text>
          <Text style={[styles.heroSub, darkMode && styles.darkMutedText]}>Pick a unit to start playing!</Text>
        </View>
        {gradeOneUnits.map((unit) => (
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
