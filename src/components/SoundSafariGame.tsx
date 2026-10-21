import * as Speech from "expo-speech";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";

type Word = { emoji: string; word: string };
type Tile = Word & { letter: string };

// `say` is a phonetic spelling so text-to-speech says the sound, not the letter name.
// Replace with recorded audio later for best quality.
const BANK: Record<string, { say: string; words: Word[] }> = {
  B: { say: "buh", words: [{ emoji: "🍌", word: "banana" }, { emoji: "🏀", word: "ball" }, { emoji: "🚌", word: "bus" }] },
  M: { say: "mmm", words: [{ emoji: "🥭", word: "mango" }, { emoji: "🌙", word: "moon" }, { emoji: "🐭", word: "mouse" }] },
  S: { say: "sss", words: [{ emoji: "☀️", word: "sun" }, { emoji: "🐍", word: "snake" }, { emoji: "🧦", word: "sock" }] },
  C: { say: "kuh", words: [{ emoji: "🐱", word: "cat" }, { emoji: "🐄", word: "cow" }, { emoji: "🚗", word: "car" }] },
  D: { say: "duh", words: [{ emoji: "🐶", word: "dog" }, { emoji: "🦆", word: "duck" }, { emoji: "🚪", word: "door" }] },
  P: { say: "puh", words: [{ emoji: "🍕", word: "pizza" }, { emoji: "🐷", word: "pig" }, { emoji: "🍍", word: "pineapple" }] },
  T: { say: "tuh", words: [{ emoji: "🐢", word: "turtle" }, { emoji: "🌳", word: "tree" }, { emoji: "🍅", word: "tomato" }] },
  F: { say: "fff", words: [{ emoji: "🐟", word: "fish" }, { emoji: "🌸", word: "flower" }, { emoji: "🔥", word: "fire" }] },
};

const ROUNDS = 3;
const PASS_SCORE = 2;
const LEVEL_LABELS = ["Easy", "Standard", "Challenge"];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRounds(level: number): { letter: string; tiles: Tile[] }[] {
  const correctCount = level === 1 ? 2 : 3;
  const total = level === 1 ? 4 : level === 2 ? 6 : 9;
  return shuffle(Object.keys(BANK))
    .slice(0, ROUNDS)
    .map((letter) => {
      const correct: Tile[] = shuffle(BANK[letter].words)
        .slice(0, correctCount)
        .map((w) => ({ ...w, letter }));
      const distractors: Tile[] = shuffle(
        Object.keys(BANK)
          .filter((l) => l !== letter)
          .flatMap((l) => BANK[l].words.map((w) => ({ ...w, letter: l })))
      ).slice(0, total - correctCount);
      return { letter, tiles: shuffle([...correct, ...distractors]) };
    });
}

export default function SoundSafariGame({
  level,
  onExit,
  onPassed,
}: {
  level: number;
  onExit: () => void;
  onPassed: () => void;
}) {
  const rounds = useMemo(() => buildRounds(level), [level]);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = rounds[round];
  const sound = BANK[current.letter].say;

  const speakPrompt = () => {
    Speech.stop();
    Speech.speak(`Which pictures start with the sound, ${sound}?`, { rate: 0.8 });
  };

  useEffect(() => {
    if (!finished) speakPrompt();
    return () => {
      Speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, finished]);

  const toggle = (index: number) => {
    if (checked !== null) return;
    Speech.stop();
    Speech.speak(current.tiles[index].word, { rate: 0.8 });
    setPicked((p) => (p.includes(index) ? p.filter((i) => i !== index) : [...p, index]));
  };

  const check = () => {
    const correct = current.tiles.every(
      (tile, i) => (tile.letter === current.letter) === picked.includes(i)
    );
    setChecked(correct);
    if (correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (round + 1 >= ROUNDS) {
      setFinished(true);
      if (score >= PASS_SCORE) onPassed();
      return;
    }
    setRound(round + 1);
    setPicked([]);
    setChecked(null);
  };

  if (finished) {
    const passed = score >= PASS_SCORE;
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.center}>
          <Text style={styles.bigEmoji}>{passed ? "🌟" : "💪"}</Text>
          <Text style={styles.title}>{passed ? "Great listening!" : "Try again!"}</Text>
          <Text style={styles.sub}>
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
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={onExit} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <Text style={styles.meta}>
            Round {round + 1} of {ROUNDS} · {LEVEL_LABELS[level - 1]}
          </Text>
          <Text style={styles.title}>🚐 Sound Safari</Text>
          <Text style={styles.sub}>Tap every picture that starts with this sound!</Text>
          <Text style={styles.letter}>{current.letter}</Text>
          <Pressable onPress={speakPrompt} style={styles.replayBtn}>
            <Text style={styles.replayText}>🔊 Hear it again</Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {current.tiles.map((tile, i) => {
            const isPicked = picked.includes(i);
            const isTarget = tile.letter === current.letter;
            return (
              <Pressable
                key={`${tile.word}-${i}`}
                onPress={() => toggle(i)}
                style={[
                  styles.tile,
                  isPicked && styles.tilePicked,
                  checked !== null && isTarget && styles.tileCorrect,
                  checked !== null && isPicked && !isTarget && styles.tileWrong,
                ]}
              >
                <Text style={styles.tileEmoji}>{tile.emoji}</Text>
                {checked !== null ? <Text style={styles.tileWord}>{tile.word}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        {checked === null ? (
          <Pressable
            disabled={picked.length === 0}
            onPress={check}
            style={[styles.primaryBtn, picked.length === 0 && styles.disabled]}
          >
            <Text style={styles.primaryBtnText}>CHECK</Text>
          </Pressable>
        ) : (
          <>
            <Text style={[styles.feedback, checked ? styles.good : styles.bad]}>
              {checked ? "🦉 You found them all!" : "🦉 Almost! Green ones start with the sound."}
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

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F2FBFD" },
  scroll: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  backBtn: { alignSelf: "flex-start", backgroundColor: "#C62828", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 10 },
  backBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  hero: { alignItems: "center", backgroundColor: "#DDF5F1", borderRadius: 20, padding: 16, marginBottom: 14 },
  bigEmoji: { fontSize: 54, marginBottom: 6 },
  title: { color: "#173B53", fontSize: 24, fontWeight: "900", textAlign: "center" },
  sub: { color: "#36566A", fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 4 },
  meta: { color: "#4B6A7A", fontSize: 13, fontWeight: "800" },
  letter: { color: "#F17D65", fontSize: 72, fontWeight: "900", marginTop: 2 },
  replayBtn: { backgroundColor: "#258EA3", borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16, marginTop: 4 },
  replayText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 12 },
  tile: { width: "30%", aspectRatio: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderColor: "#D5F5EB", borderWidth: 3, borderRadius: 18 },
  tilePicked: { borderColor: "#F3C451", backgroundColor: "#FFF0AA" },
  tileCorrect: { borderColor: "#66CBB1", backgroundColor: "#D5F5EB" },
  tileWrong: { borderColor: "#E53E3E", backgroundColor: "#FFE0DC" },
  tileEmoji: { fontSize: 40 },
  tileWord: { color: "#173B53", fontSize: 12, fontWeight: "800", marginTop: 2 },
  primaryBtn: { alignItems: "center", justifyContent: "center", minHeight: 56, borderRadius: 16, backgroundColor: "#F17D65", paddingHorizontal: 16, marginTop: 8, alignSelf: "stretch" },
  primaryBtnText: { color: "#FFFDF5", fontSize: 16, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  feedback: { fontSize: 17, fontWeight: "900", textAlign: "center", marginVertical: 8 },
  good: { color: "#28543A" },
  bad: { color: "#9C3E32" },
});
