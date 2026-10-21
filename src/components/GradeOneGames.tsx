import * as Speech from "expo-speech";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import {
  ChoiceGame,
  DraggablePiece,
  Frame,
  ResultView,
  shuffle,
  styles as base,
  useSlots,
  type ChoiceRound,
  type GameProps,
} from "./KindergartenGames";

const LEVEL_LABELS = ["Easy", "Standard", "Challenge"];
const ROUNDS = 3;
const PASS_SCORE = 2; // "most answers right"

const pickN = <T,>(items: T[], n: number): T[] => shuffle(items).slice(0, n);
const randInt = (n: number) => Math.floor(Math.random() * n);

function RoundResult({
  score,
  total,
  passed,
  noun,
  onExit,
}: {
  score: number;
  total: number;
  passed: boolean;
  noun: string;
  onExit: () => void;
}) {
  return (
    <ResultView
      passed={passed}
      title={passed ? "Great job!" : "Try again!"}
      sub={`You got ${score} of ${total} ${noun}.${passed ? " You earned a star!" : " Keep practicing to earn a star."}`}
      onExit={onExit}
    />
  );
}

// ---------- Ordered tiles engine (Blend Train, Sentence Builder) ----------

type OrderRound = { hint: string; prompt: string; tokens: string[]; speak: string };

function OrderTilesGame({
  level,
  onExit,
  onPassed,
  title,
  topEmoji,
  buildRounds,
  joiner,
}: GameProps & {
  title: string;
  topEmoji: string;
  buildRounds: (level: number) => OrderRound[];
  joiner: string;
}) {
  const rounds = useMemo(() => buildRounds(level), [level, buildRounds]);
  const [round, setRound] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [used, setUsed] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [note, setNote] = useState("");
  const [finished, setFinished] = useState(false);
  const current = rounds[round];
  const tiles = useMemo(
    () => shuffle(current.tokens.map((t, i) => ({ t, i }))),
    [current]
  );
  const done = placed === current.tokens.length;

  useEffect(
    () => () => {
      Speech.stop();
    },
    []
  );

  const tap = (k: number) => {
    if (done || used.includes(k)) return;
    if (tiles[k].t === current.tokens[placed]) {
      const nextPlaced = placed + 1;
      setUsed((u) => [...u, k]);
      setPlaced(nextPlaced);
      setNote("");
      if (nextPlaced === current.tokens.length) {
        setNote(`🔊 ${current.speak}`);
        Speech.stop();
        Speech.speak(current.speak, { rate: 0.8 });
      }
    } else {
      setMistakes((m) => m + 1);
      setNote("Not that one. Try again!");
    }
  };

  const next = () => {
    const nextScore = score + (mistakes <= 1 ? 1 : 0);
    setScore(nextScore);
    if (round + 1 >= ROUNDS) {
      setFinished(true);
      if (nextScore >= PASS_SCORE) onPassed();
      return;
    }
    setRound(round + 1);
    setPlaced(0);
    setUsed([]);
    setMistakes(0);
    setNote("");
  };

  if (finished) {
    return (
      <RoundResult
        score={score}
        total={ROUNDS}
        passed={score >= PASS_SCORE}
        noun="rounds right"
        onExit={onExit}
      />
    );
  }

  return (
    <Frame onExit={onExit}>
      <View style={base.hero}>
        <Text style={base.meta}>
          Round {round + 1} of {ROUNDS} · {LEVEL_LABELS[level - 1]}
        </Text>
        <Text style={base.title}>{title}</Text>
        <Text style={base.bigEmoji}>{current.hint}</Text>
        <Text style={base.sub}>{current.prompt}</Text>
      </View>

      <View style={g.slotsRow}>
        <Text style={g.slotTrain}>{topEmoji}</Text>
        {current.tokens.map((token, i) => (
          <View key={i} style={[g.slotBox, i < placed && g.slotBoxFilled]}>
            <Text style={g.slotText}>{i < placed ? token : ""}</Text>
          </View>
        ))}
      </View>

      <View style={g.tileRow}>
        {tiles.map((tile, k) => (
          <Pressable
            key={k}
            disabled={used.includes(k)}
            onPress={() => tap(k)}
            style={[g.tile, used.includes(k) && g.tileUsed]}
          >
            <Text style={g.tileText}>{tile.t}</Text>
          </Pressable>
        ))}
      </View>

      {note ? (
        <Text style={[base.feedback, done ? base.good : base.bad]}>
          {done ? `🦉 ${current.tokens.join(joiner)}` : note}
        </Text>
      ) : null}
      {done ? (
        <Pressable onPress={next} style={base.primaryBtn}>
          <Text style={base.primaryBtnText}>{round + 1 >= ROUNDS ? "SEE RESULTS" : "NEXT"}</Text>
        </Pressable>
      ) : null}
    </Frame>
  );
}

// ----- Blend Train -----

const BLEND_WORDS: { w: string; e: string }[][] = [
  [
    { w: "cat", e: "🐱" }, { w: "sun", e: "☀️" }, { w: "dog", e: "🐶" },
    { w: "pig", e: "🐷" }, { w: "bus", e: "🚌" }, { w: "bed", e: "🛏️" },
  ],
  [
    { w: "frog", e: "🐸" }, { w: "flag", e: "🚩" }, { w: "drum", e: "🥁" },
    { w: "star", e: "⭐" }, { w: "milk", e: "🥛" },
  ],
  [
    { w: "plant", e: "🌱" }, { w: "truck", e: "🚚" }, { w: "bread", e: "🍞" },
    { w: "horse", e: "🐴" }, { w: "train", e: "🚂" },
  ],
];

function buildBlendRounds(level: number): OrderRound[] {
  return pickN(BLEND_WORDS[level - 1], ROUNDS).map((x) => ({
    hint: x.e,
    prompt: "Tap the sounds in order to blend the word!",
    tokens: x.w.split(""),
    speak: x.w,
  }));
}

export function BlendTrainGame(props: GameProps) {
  return (
    <OrderTilesGame
      {...props}
      title="🚂 Blend Train"
      topEmoji="🚂"
      buildRounds={buildBlendRounds}
      joiner="-"
    />
  );
}

// ----- Sentence Builder -----

const SENTENCES: { e: string; words: string[] }[][] = [
  [
    { e: "🥛", words: ["I", "like", "milk"] },
    { e: "🐶", words: ["The", "dog", "runs"] },
    { e: "⚽", words: ["We", "can", "play"] },
    { e: "🐱", words: ["The", "cat", "sleeps"] },
  ],
  [
    { e: "🍎", words: ["I", "eat", "a", "red", "apple"] },
    { e: "☀️", words: ["The", "sun", "is", "hot"] },
    { e: "🚌", words: ["The", "bus", "is", "big"] },
    { e: "📚", words: ["She", "reads", "a", "book"] },
  ],
  [
    { e: "🐶", words: ["My", "dog", "likes", "to", "run", "fast"] },
    { e: "🏫", words: ["We", "go", "to", "school", "every", "day"] },
    { e: "🍌", words: ["He", "gave", "me", "a", "ripe", "banana"] },
  ],
];

function buildSentenceRounds(level: number): OrderRound[] {
  return pickN(SENTENCES[level - 1], ROUNDS).map((s) => ({
    hint: s.e,
    prompt: "Put the words in order to make a sentence.",
    tokens: s.words,
    speak: `${s.words.join(" ")}.`,
  }));
}

export function SentenceBuilderGame(props: GameProps) {
  return (
    <OrderTilesGame
      {...props}
      title="🧱 Sentence Builder"
      topEmoji="✍️"
      buildRounds={buildSentenceRounds}
      joiner=" "
    />
  );
}

// ---------- Word Hunt (grid of sight words) ----------

const SIGHT_WORDS = ["the", "and", "is", "you", "we", "go", "see", "like", "can", "said", "look", "play"];
const LOOKALIKES: Record<string, string[]> = {
  see: ["she", "sea", "seed"],
  the: ["them", "then", "this"],
  can: ["cap", "car", "cat"],
  go: ["got", "ago", "good"],
  is: ["it", "in", "if"],
  we: ["me", "he", "be"],
  like: ["look", "lick", "lake"],
};

function buildWordHuntRounds(level: number): ChoiceRound[] {
  const optionCount = level === 1 ? 4 : level === 2 ? 6 : 8;
  return pickN(SIGHT_WORDS, ROUNDS).map((word) => {
    const others = SIGHT_WORDS.filter((w) => w !== word);
    const pool = level === 3 ? [...(LOOKALIKES[word] ?? []), ...shuffle(others)] : shuffle(others);
    const distractors = Array.from(new Set(pool)).slice(0, optionCount - 1);
    return {
      sceneEmoji: "🏘️",
      scene: `Find the word “${word}”`,
      options: shuffle([word, ...distractors]).map((label) => ({ label, correct: label === word })),
    };
  });
}

export function WordHuntGame(props: GameProps) {
  return (
    <ChoiceGame
      {...props}
      grid
      title="🔎 Word Hunt"
      intro="Look around town. Tap the word you find."
      buildRounds={buildWordHuntRounds}
      correctMsg="🦉 You found it!"
      wrongMsg="🦉 Not that one. The green word is the right one."
    />
  );
}

// ---------- Story Time ----------

type StoryQ = { q: string; emoji: string; options: { emoji: string; label: string }[] };
const STORIES: { text: string; qs: StoryQ[] }[] = [
  {
    text: "Mia has a little dog named Pip. Pip likes to run in the park. One day, Pip found a red ball.",
    qs: [
      { q: "Who found a ball?", emoji: "🔎", options: [{ emoji: "🐶", label: "The dog" }, { emoji: "🐱", label: "The cat" }, { emoji: "🐰", label: "The rabbit" }] },
      { q: "What color was the ball?", emoji: "⚽", options: [{ emoji: "🔴", label: "Red" }, { emoji: "🔵", label: "Blue" }, { emoji: "🟢", label: "Green" }] },
      { q: "Where does Pip like to run?", emoji: "🏃", options: [{ emoji: "🌳", label: "In the park" }, { emoji: "🏫", label: "At school" }, { emoji: "🏖️", label: "At the beach" }] },
    ],
  },
  {
    text: "On Saturday, Ben and his mother went to the market. They bought three mangoes and a big fish. Then it began to rain, so they ran home.",
    qs: [
      { q: "Where did Ben go?", emoji: "🛒", options: [{ emoji: "🏪", label: "The market" }, { emoji: "🏫", label: "School" }, { emoji: "🏥", label: "The hospital" }] },
      { q: "What did they buy?", emoji: "🛍️", options: [{ emoji: "🥭", label: "Mangoes and fish" }, { emoji: "🍎", label: "Apples and bread" }, { emoji: "🥛", label: "Milk and eggs" }] },
      { q: "What happened at the end?", emoji: "🏠", options: [{ emoji: "🌧️", label: "It began to rain" }, { emoji: "☀️", label: "It was sunny" }, { emoji: "❄️", label: "It snowed" }] },
    ],
  },
  {
    text: "Lola Rosa has a small garden. Every morning she waters the plants. Last week, a tiny seed grew into a tall sunflower. The bees came to visit it.",
    qs: [
      { q: "Who has a garden?", emoji: "🏡", options: [{ emoji: "👵", label: "Lola Rosa" }, { emoji: "👦", label: "Ben" }, { emoji: "👧", label: "Mia" }] },
      { q: "What grew from the seed?", emoji: "🌱", options: [{ emoji: "🌻", label: "A sunflower" }, { emoji: "🌹", label: "A rose" }, { emoji: "🌴", label: "A tree" }] },
      { q: "Who came to visit the flower?", emoji: "👀", options: [{ emoji: "🐝", label: "Bees" }, { emoji: "🐦", label: "Birds" }, { emoji: "🐛", label: "Worms" }] },
    ],
  },
];

export function StoryTimeGame(props: GameProps) {
  const story = STORIES[props.level - 1];
  const [ready, setReady] = useState(false);
  const build = useCallback(
    (): ChoiceRound[] =>
      story.qs.map((q) => ({
        sceneEmoji: q.emoji,
        scene: q.q,
        options: shuffle(
          q.options.map((o, i) => ({ emoji: o.emoji, label: o.label, correct: i === 0 }))
        ),
      })),
    [story]
  );

  useEffect(
    () => () => {
      Speech.stop();
    },
    []
  );

  const listen = () => {
    Speech.stop();
    Speech.speak(story.text, { rate: 0.85 });
  };

  if (!ready) {
    return (
      <Frame onExit={props.onExit}>
        <View style={base.hero}>
          <Text style={base.meta}>{LEVEL_LABELS[props.level - 1]}</Text>
          <Text style={base.title}>📖 Story Time</Text>
          <Text style={base.sub}>Listen to the story, then answer the questions.</Text>
        </View>
        <View style={g.storyCard}>
          <Text style={g.storyText}>{story.text}</Text>
        </View>
        <Pressable onPress={listen} style={g.listenBtn}>
          <Text style={g.listenText}>🔊 Listen to the story</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Speech.stop();
            setReady(true);
          }}
          style={base.primaryBtn}
        >
          <Text style={base.primaryBtnText}>I'M READY</Text>
        </Pressable>
      </Frame>
    );
  }

  return (
    <ChoiceGame
      {...props}
      title="📖 Story Time"
      intro="Pick the picture that answers the question."
      buildRounds={build}
      correctMsg="🦉 Yes! You listened well."
      wrongMsg="🦉 Not quite. The green answer is right."
    />
  );
}

// ---------- Shopkeeper: Change Challenge ----------

const SHOP_ITEMS = [
  { e: "🍬", n: "candy" }, { e: "🥤", n: "juice" }, { e: "🍪", n: "cookies" },
  { e: "🍞", n: "bread" }, { e: "🥚", n: "egg" }, { e: "🧃", n: "milk drink" },
];

export function ShopkeeperGame({ level, onExit, onPassed }: GameProps) {
  const denoms = [[1, 5], [1, 5, 10], [1, 5, 10, 20]][level - 1];
  const rounds = useMemo(() => {
    const paid = [10, 20, 50][level - 1];
    return pickN(SHOP_ITEMS, ROUNDS).map((item) => {
      const price =
        level === 1 ? 3 + randInt(7) : level === 2 ? 6 + randInt(13) : 12 + randInt(35);
      return { ...item, price, paid, change: paid - price };
    });
  }, [level]);
  const [round, setRound] = useState(0);
  const [given, setGiven] = useState<number[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const current = rounds[round];
  const total = given.reduce((a, b) => a + b, 0);

  const check = () => {
    const ok = total === current.change;
    setChecked(ok);
    if (ok) setScore((s) => s + 1);
  };
  const next = () => {
    if (round + 1 >= ROUNDS) {
      setFinished(true);
      if (score >= PASS_SCORE) onPassed();
      return;
    }
    setRound(round + 1);
    setGiven([]);
    setChecked(null);
  };

  if (finished) {
    return (
      <RoundResult
        score={score}
        total={ROUNDS}
        passed={score >= PASS_SCORE}
        noun="customers right"
        onExit={onExit}
      />
    );
  }

  return (
    <Frame onExit={onExit}>
      <View style={base.hero}>
        <Text style={base.meta}>
          Customer {round + 1} of {ROUNDS} · {LEVEL_LABELS[level - 1]}
        </Text>
        <Text style={base.title}>🏪 Shopkeeper</Text>
        <Text style={base.bigEmoji}>{current.e}</Text>
        <Text style={base.scene}>
          {`The ${current.n} costs ₱${current.price}. The customer pays ₱${current.paid}.`}
        </Text>
        <Text style={base.sub}>Count out the change!</Text>
      </View>

      <View style={g.changeBox}>
        <Text style={g.changeLabel}>Change given</Text>
        <Text style={g.changeTotal}>₱{total}</Text>
      </View>

      <View style={g.coinRow}>
        {denoms.map((d) => (
          <Pressable
            key={d}
            disabled={checked !== null}
            onPress={() => setGiven((x) => [...x, d])}
            style={[g.coinBtn, d >= 10 && g.billBtn]}
          >
            <Text style={g.coinText}>₱{d}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        disabled={checked !== null || given.length === 0}
        onPress={() => setGiven((x) => x.slice(0, -1))}
        style={g.undoBtn}
      >
        <Text style={g.undoText}>↩ Take back last</Text>
      </Pressable>

      {checked === null ? (
        <Pressable
          disabled={given.length === 0}
          onPress={check}
          style={[base.primaryBtn, given.length === 0 && g.disabled]}
        >
          <Text style={base.primaryBtnText}>GIVE CHANGE</Text>
        </Pressable>
      ) : (
        <>
          <Text style={[base.feedback, checked ? base.good : base.bad]}>
            {checked ? "🦉 Correct change!" : `🦉 Not quite. The change is ₱${current.change}.`}
          </Text>
          <Pressable onPress={next} style={base.primaryBtn}>
            <Text style={base.primaryBtnText}>{round + 1 >= ROUNDS ? "SEE RESULTS" : "NEXT"}</Text>
          </Pressable>
        </>
      )}
    </Frame>
  );
}

// ---------- Number Hop ----------

type HopRound = { start: number; add: boolean; n: number; target: number };

export function NumberHopGame({ level, onExit, onPassed }: GameProps) {
  const max = level === 1 ? 10 : 20;
  const rounds = useMemo<HopRound[]>(() => {
    const cap = level === 3 ? 9 : 5;
    return Array.from({ length: ROUNDS }, () => {
      const add = level === 1 ? true : Math.random() < 0.5;
      if (add) {
        const start = randInt(max - 2);
        const n = 1 + randInt(Math.min(level === 1 ? 4 : cap, max - start));
        return { start, add, n, target: start + n };
      }
      const start = 3 + randInt(max - 2);
      const n = 1 + randInt(Math.min(cap, start));
      return { start, add, n, target: start - n };
    });
  }, [level, max]);
  const [round, setRound] = useState(0);
  const [pos, setPos] = useState(rounds[0].start);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const current = rounds[round];

  const check = () => {
    const ok = pos === current.target;
    setChecked(ok);
    if (ok) setScore((s) => s + 1);
  };
  const next = () => {
    if (round + 1 >= ROUNDS) {
      setFinished(true);
      if (score >= PASS_SCORE) onPassed();
      return;
    }
    setRound(round + 1);
    setPos(rounds[round + 1].start);
    setChecked(null);
  };

  if (finished) {
    return (
      <RoundResult
        score={score}
        total={ROUNDS}
        passed={score >= PASS_SCORE}
        noun="hops right"
        onExit={onExit}
      />
    );
  }

  return (
    <Frame onExit={onExit}>
      <View style={base.hero}>
        <Text style={base.meta}>
          Problem {round + 1} of {ROUNDS} · {LEVEL_LABELS[level - 1]}
        </Text>
        <Text style={base.title}>🐸 Number Hop</Text>
        <Text style={base.scene}>
          {`${current.start} ${current.add ? "+" : "−"} ${current.n} = ?`}
        </Text>
        <Text style={base.sub}>
          {`Start at ${current.start}. Hop ${current.add ? "forward" : "back"} ${current.n} ${current.n === 1 ? "time" : "times"}, then check.`}
        </Text>
      </View>

      <View style={g.lane}>
        {Array.from({ length: max + 1 }, (_, n) => (
          <View key={n} style={[g.numChip, n === pos && g.numChipActive]}>
            <Text style={g.numText}>{n === pos ? "🐸" : n}</Text>
          </View>
        ))}
      </View>
      <Text style={g.posText}>The frog is on {pos}</Text>

      <View style={g.hopRow}>
        <Pressable
          disabled={checked !== null || pos <= 0}
          onPress={() => setPos((p) => p - 1)}
          style={[g.hopBtn, g.hopBack]}
        >
          <Text style={g.hopText}>⬅ Hop back</Text>
        </Pressable>
        <Pressable
          disabled={checked !== null || pos >= max}
          onPress={() => setPos((p) => p + 1)}
          style={g.hopBtn}
        >
          <Text style={g.hopText}>Hop ➡</Text>
        </Pressable>
      </View>

      {checked === null ? (
        <Pressable onPress={check} style={base.primaryBtn}>
          <Text style={base.primaryBtnText}>CHECK</Text>
        </Pressable>
      ) : (
        <>
          <Text style={[base.feedback, checked ? base.good : base.bad]}>
            {checked ? "🦉 You landed on it!" : `🦉 Almost! The answer is ${current.target}.`}
          </Text>
          <Pressable onPress={next} style={base.primaryBtn}>
            <Text style={base.primaryBtnText}>{round + 1 >= ROUNDS ? "SEE RESULTS" : "NEXT"}</Text>
          </Pressable>
        </>
      )}
    </Frame>
  );
}

// ---------- Trash Sorter (conveyor that speeds up) ----------

const BINS = [
  { id: "recycle", label: "Recycle", emoji: "♻️" },
  { id: "compost", label: "Compost", emoji: "🍂" },
  { id: "trash", label: "Trash", emoji: "🗑️" },
];
const TRASH = [
  { e: "📰", bin: "recycle" }, { e: "🥫", bin: "recycle" }, { e: "🧴", bin: "recycle" },
  { e: "🍌", bin: "compost" }, { e: "🍎", bin: "compost" }, { e: "🥬", bin: "compost" },
  { e: "🍬", bin: "trash" }, { e: "🧻", bin: "trash" }, { e: "🧸", bin: "trash" },
];
const TRASH_COUNT = 6;
const TRASH_PASS = 4;
const BASE_MS = [6000, 4500, 3200];

export function TrashSorterGame({ level, onExit, onPassed }: GameProps) {
  const items = useMemo(() => pickN(TRASH, TRASH_COUNT), [level]);
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [laneW, setLaneW] = useState(300);
  const x = useRef(new Animated.Value(0)).current;
  const answered = useRef(false);
  const scoreRef = useRef(0);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const item = items[i];

  const resolve = (binId: string | null) => {
    if (answered.current) return;
    answered.current = true;
    animRef.current?.stop();
    const ok = binId === item.bin;
    if (ok) scoreRef.current += 1;
    const right = BINS.find((b) => b.id === item.bin)!.label;
    setMsg(ok ? "✅ Great sorting!" : binId === null ? `⏱️ Too slow! It goes in ${right}.` : `❌ It goes in ${right}.`);
    timerRef.current = setTimeout(() => {
      setMsg(null);
      if (i + 1 >= TRASH_COUNT) {
        setFinished(true);
        if (scoreRef.current >= TRASH_PASS) onPassed();
      } else {
        setI(i + 1);
      }
    }, 900);
  };
  const resolveRef = useRef(resolve);
  resolveRef.current = resolve;

  useEffect(() => {
    if (finished) return;
    answered.current = false;
    x.setValue(0);
    const duration = Math.max(1800, BASE_MS[level - 1] - i * 350); // gets faster
    const anim = Animated.timing(x, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    animRef.current = anim;
    anim.start(({ finished: ok }) => {
      if (ok) resolveRef.current(null);
    });
    return () => anim.stop();
  }, [i, finished, level, x]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  if (finished) {
    return (
      <RoundResult
        score={scoreRef.current}
        total={TRASH_COUNT}
        passed={scoreRef.current >= TRASH_PASS}
        noun="items sorted right"
        onExit={onExit}
      />
    );
  }

  return (
    <Frame onExit={onExit}>
      <View style={base.hero}>
        <Text style={base.meta}>
          Item {i + 1} of {TRASH_COUNT} · {LEVEL_LABELS[level - 1]}
        </Text>
        <Text style={base.title}>🗑️ Trash Sorter</Text>
        <Text style={base.sub}>Tap the right bin before the item reaches the end!</Text>
      </View>

      <View style={g.belt} onLayout={(e) => setLaneW(e.nativeEvent.layout.width)}>
        <Animated.View
          style={{
            transform: [
              { translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(0, laneW - 64)] }) },
            ],
          }}
        >
          <Text style={g.beltItem}>{item.e}</Text>
        </Animated.View>
      </View>

      <Text style={[base.feedback, msg?.startsWith("✅") ? base.good : base.bad]}>{msg ?? " "}</Text>

      <View style={g.binRow}>
        {BINS.map((bin) => (
          <Pressable key={bin.id} disabled={msg !== null} onPress={() => resolve(bin.id)} style={g.binBtn}>
            <Text style={g.binEmoji}>{bin.emoji}</Text>
            <Text style={g.binText}>{bin.label}</Text>
          </Pressable>
        ))}
      </View>
    </Frame>
  );
}

// ---------- Community Builder ----------

const SITUATIONS = [
  { e: "🤒", t: "A child is very sick.", helper: "Doctor", place: "Hospital" },
  { e: "🔥", t: "There is a fire in town!", helper: "Firefighter", place: "Fire station" },
  { e: "✉️", t: "You want to send a letter.", helper: "Mail carrier", place: "Post office" },
  { e: "📚", t: "You want to borrow a book.", helper: "Librarian", place: "Library" },
  { e: "🥕", t: "We need vegetables for dinner.", helper: "Vendor", place: "Market" },
  { e: "💇", t: "Your hair is too long.", helper: "Barber", place: "Barbershop" },
];
const PLACE_EMOJI: Record<string, string> = {
  Hospital: "🏥", "Fire station": "🚒", "Post office": "📮", Library: "📚", Market: "🏪", Barbershop: "💈",
};
const HELPER_EMOJI: Record<string, string> = {
  Doctor: "🧑‍⚕️", Firefighter: "🧑‍🚒", "Mail carrier": "📬", Librarian: "🧑‍💼", Vendor: "🧑‍🌾", Barber: "✂️",
};

function buildTownRounds(level: number): ChoiceRound[] {
  return pickN(SITUATIONS, ROUNDS).map((s) => {
    const others = shuffle(SITUATIONS.filter((o) => o !== s));
    let options: ChoiceRound["options"];
    if (level === 1) {
      options = [s.place, ...others.slice(0, 2).map((o) => o.place)].map((place) => ({
        emoji: PLACE_EMOJI[place], label: place, correct: place === s.place,
      }));
    } else if (level === 2) {
      options = [s.helper, ...others.slice(0, 2).map((o) => o.helper)].map((helper) => ({
        emoji: HELPER_EMOJI[helper], label: helper, correct: helper === s.helper,
      }));
    } else {
      const label = (h: string, p: string) => `${h} at the ${p.toLowerCase()}`;
      options = [
        { label: label(s.helper, s.place), correct: true },
        { label: label(others[0].helper, s.place), correct: false },
        { label: label(s.helper, others[1].place), correct: false },
        { label: label(others[2].helper, others[2].place), correct: false },
      ];
    }
    return { sceneEmoji: s.e, scene: s.t, options: shuffle(options) };
  });
}

export function CommunityBuilderGame(props: GameProps) {
  const intro =
    props.level === 1
      ? "Where should we go?"
      : props.level === 2
        ? "Who can help?"
        : "Pick the right helper and place.";
  return (
    <ChoiceGame
      {...props}
      title="🏘️ Community Builder"
      intro={intro}
      buildRounds={buildTownRounds}
      correctMsg="🦉 Yes! Your town is growing."
      wrongMsg="🦉 Not quite. The green answer fits best."
    />
  );
}

// ---------- Choose Kindly (branching stories with gentle consequences) ----------

const DILEMMAS: { e: string; t: string; good: [string, string]; bad: [string, string][] }[] = [
  { e: "🍱", t: "Your friend dropped her lunch and looks sad. What do you do?", good: ["Share some of my lunch.", "Your friend smiled. Sharing is kind!"], bad: [["Laugh at her.", "Your friend felt even sadder. A kind choice would help."], ["Walk away.", "She is still sad. Maybe try helping next time."]] },
  { e: "🖍️", t: "You broke your classmate's crayon by accident.", good: ["Tell the truth and say sorry.", "Your classmate said thank you for being honest."], bad: [["Hide it and say nothing.", "Later, your classmate felt confused and upset."], ["Blame someone else.", "That was unfair, and someone's feelings got hurt."]] },
  { e: "🪙", t: "You find a coin on the classroom floor.", good: ["Give it to the teacher.", "The teacher found the owner. Being honest feels good!"], bad: [["Keep it quietly.", "Someone is missing their coin and feels worried."], ["Hide it in my bag.", "You feel nervous now. Honesty feels better."]] },
  { e: "👵", t: "Your grandmother is carrying heavy bags.", good: ["Help carry them.", "Grandma smiled and said thank you!"], bad: [["Keep playing.", "Grandma had a hard time with the bags."], ["Tell her to wait.", "Grandma felt tired waiting."]] },
  { e: "🧸", t: "It is time to clean up the toys.", good: ["Put the toys away.", "The room looks neat and everyone is happy!"], bad: [["Leave them on the floor.", "Someone almost tripped on the toys."], ["Ask someone else to do it.", "Your friend had to do all the work alone."]] },
  { e: "🧍", t: "A new classmate is standing alone.", good: ["Invite them to play.", "Your new friend smiled and joined in!"], bad: [["Ignore them.", "The new classmate felt lonely."], ["Whisper about them.", "That hurt their feelings. Kind words are better."]] },
];

function buildKindlyRounds(level: number): ChoiceRound[] {
  const optionCount = level + 1;
  return pickN(DILEMMAS, ROUNDS).map((d) => ({
    sceneEmoji: d.e,
    scene: d.t,
    options: shuffle([
      { label: d.good[0], correct: true, note: `😊 ${d.good[1]}` },
      ...shuffle(d.bad)
        .slice(0, optionCount - 1)
        .map(([label, note]) => ({ label, correct: false, note: `😕 ${note}` })),
    ]),
  }));
}

export function ChooseKindlyGame(props: GameProps) {
  return (
    <ChoiceGame
      {...props}
      title="💛 Choose Kindly"
      intro="What would you choose to do?"
      buildRounds={buildKindlyRounds}
      correctMsg="😊 That was kind!"
      wrongMsg="😕 Let's try a kinder choice next time."
    />
  );
}

// ---------- Chore Quest (drag chores to the right time of day) ----------

type TimeOfDay = "Morning" | "Afternoon" | "Evening";
const TIME_EMOJI: Record<TimeOfDay, string> = { Morning: "☀️", Afternoon: "🌤️", Evening: "🌙" };
const CHORES: { emoji: string; text: string; time: TimeOfDay }[] = [
  { emoji: "🪥", text: "Brush teeth", time: "Morning" },
  { emoji: "🥣", text: "Eat breakfast", time: "Morning" },
  { emoji: "🛏️", text: "Make the bed", time: "Morning" },
  { emoji: "👕", text: "Get dressed", time: "Morning" },
  { emoji: "📚", text: "Do homework", time: "Afternoon" },
  { emoji: "🍱", text: "Eat lunch", time: "Afternoon" },
  { emoji: "⚽", text: "Play outside", time: "Afternoon" },
  { emoji: "🛁", text: "Take a bath", time: "Evening" },
  { emoji: "🍲", text: "Eat dinner", time: "Evening" },
  { emoji: "📖", text: "Read a story", time: "Evening" },
  { emoji: "😴", text: "Go to bed", time: "Evening" },
];

export function ChoreQuestGame({ level, onExit, onPassed }: GameProps) {
  const times: TimeOfDay[] = level === 1 ? ["Morning", "Evening"] : ["Morning", "Afternoon", "Evening"];
  const perTime = level === 3 ? 3 : 2;
  const chores = useMemo(
    () => shuffle(times.flatMap((t) => pickN(CHORES.filter((c) => c.time === t), perTime))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level]
  );
  const slots = useSlots();
  const [placed, setPlaced] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("Drag each chore to the right time of day!");
  const [finished, setFinished] = useState(false);

  const drop = async (chore: (typeof CHORES)[number], px: number, py: number) => {
    const hitKeys = await slots.hits(px, py);
    const time = times.find((t) => hitKeys.includes(`bucket-${t}`));
    if (!time) {
      setMessage("Drop it on one of the time boxes.");
      return false;
    }
    if (time !== chore.time) {
      setMessage(`Hmm, when do you usually "${chore.text.toLowerCase()}"?`);
      return false;
    }
    const nextPlaced = [...placed, chore.text];
    setPlaced(nextPlaced);
    setMessage("Right! Keep going.");
    if (nextPlaced.length === chores.length) {
      setFinished(true);
      onPassed();
    }
    return true;
  };

  if (finished) {
    return (
      <ResultView
        passed
        title="Chore champion!"
        sub="Your daily schedule is all set. You earned a star!"
        onExit={onExit}
      />
    );
  }

  return (
    <Frame onExit={onExit} scrollEnabled={!dragging}>
      <View style={base.hero}>
        <Text style={base.meta}>{LEVEL_LABELS[level - 1]}</Text>
        <Text style={base.title}>🧹 Chore Quest</Text>
        <Text style={base.sub}>{message}</Text>
      </View>

      {times.map((t) => (
        <View key={t} ref={slots.register(`bucket-${t}`)} collapsable={false} style={g.bucket}>
          <Text style={g.bucketTitle}>
            {TIME_EMOJI[t]} {t}
          </Text>
          <View style={g.bucketItems}>
            {chores
              .filter((c) => c.time === t && placed.includes(c.text))
              .map((c) => (
                <Text key={c.text} style={g.bucketChip}>
                  {c.emoji} {c.text}
                </Text>
              ))}
          </View>
        </View>
      ))}

      <View style={base.stepTray}>
        {chores
          .filter((c) => !placed.includes(c.text))
          .map((c) => (
            <DraggablePiece key={c.text} onDragging={setDragging} onDrop={(px, py) => drop(c, px, py)}>
              <View style={base.stepCard}>
                <Text style={base.stepText}>
                  {c.emoji} {c.text}
                </Text>
              </View>
            </DraggablePiece>
          ))}
      </View>
    </Frame>
  );
}

// ---------- Styles ----------

const g = StyleSheet.create({
  slotsRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 12 },
  slotTrain: { fontSize: 32 },
  slotBox: { minWidth: 44, minHeight: 48, alignItems: "center", justifyContent: "center", borderWidth: 2, borderStyle: "dashed", borderColor: "#9FB4BB", backgroundColor: "#EEF4F6", borderRadius: 10, paddingHorizontal: 8 },
  slotBoxFilled: { borderStyle: "solid", borderColor: "#66CBB1", backgroundColor: "#D5F5EB" },
  slotText: { color: "#173B53", fontSize: 20, fontWeight: "900" },
  tileRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 8 },
  tile: { minWidth: 56, minHeight: 56, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF0AA", borderColor: "#F3C451", borderWidth: 2, borderRadius: 14, paddingHorizontal: 12 },
  tileUsed: { opacity: 0.25 },
  tileText: { color: "#173B53", fontSize: 22, fontWeight: "900" },
  storyCard: { backgroundColor: "#FFF8E7", borderColor: "#F3C451", borderWidth: 2, borderRadius: 18, padding: 16, marginBottom: 10 },
  storyText: { color: "#173B53", fontSize: 18, lineHeight: 28, fontWeight: "700" },
  listenBtn: { alignItems: "center", backgroundColor: "#258EA3", borderRadius: 14, paddingVertical: 14, marginBottom: 6 },
  listenText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  changeBox: { alignItems: "center", backgroundColor: "#FFF0AA", borderColor: "#F3C451", borderWidth: 2, borderRadius: 18, padding: 12, marginBottom: 12 },
  changeLabel: { color: "#36566A", fontSize: 14, fontWeight: "800" },
  changeTotal: { color: "#173B53", fontSize: 40, fontWeight: "900" },
  coinRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 6 },
  coinBtn: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center", backgroundColor: "#E8B84A", borderWidth: 3, borderColor: "#C99A2E" },
  billBtn: { borderRadius: 12, width: 96, height: 64, backgroundColor: "#7FC79B", borderColor: "#4FA570" },
  coinText: { color: "#173B53", fontSize: 18, fontWeight: "900" },
  undoBtn: { alignSelf: "center", paddingVertical: 8, paddingHorizontal: 14 },
  undoText: { color: "#36566A", fontSize: 14, fontWeight: "800" },
  disabled: { opacity: 0.5 },
  lane: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 6 },
  numChip: { width: 44, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderColor: "#D5F5EB", borderWidth: 2, borderRadius: 10 },
  numChipActive: { backgroundColor: "#D5F5EB", borderColor: "#66CBB1" },
  numText: { color: "#173B53", fontSize: 16, fontWeight: "900" },
  posText: { color: "#36566A", fontSize: 14, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  hopRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  hopBtn: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 56, backgroundColor: "#258EA3", borderRadius: 14 },
  hopBack: { backgroundColor: "#B85B42" },
  hopText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  belt: { height: 90, justifyContent: "center", backgroundColor: "#6B7780", borderRadius: 14, paddingHorizontal: 4, marginBottom: 6, overflow: "hidden" },
  beltItem: { fontSize: 48, width: 60, textAlign: "center" },
  binRow: { flexDirection: "row", gap: 10 },
  binBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14, backgroundColor: "#FFFFFF", borderColor: "#D5F5EB", borderWidth: 3, borderRadius: 16 },
  binEmoji: { fontSize: 34 },
  binText: { color: "#173B53", fontSize: 13, fontWeight: "900", marginTop: 2 },
  bucket: { minHeight: 84, backgroundColor: "#FFF8E7", borderColor: "#F3C451", borderWidth: 2, borderStyle: "dashed", borderRadius: 16, padding: 10, marginBottom: 8 },
  bucketTitle: { color: "#173B53", fontSize: 16, fontWeight: "900" },
  bucketItems: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  bucketChip: { color: "#28543A", backgroundColor: "#D5F5EB", borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, fontSize: 13, fontWeight: "800", overflow: "hidden" },
});
