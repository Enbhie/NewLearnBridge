import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, PanResponder, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";

export type GameProps = { level: number; onExit: () => void; onPassed: () => void };

const LEVEL_LABELS = ["Easy", "Standard", "Challenge"];
const ROUNDS = 3;
const PASS_SCORE = 2; // "most answers right"

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---------- Shared layout ----------

export function Frame({
  onExit,
  children,
  scrollEnabled = true,
}: {
  onExit: () => void;
  children: ReactNode;
  scrollEnabled?: boolean;
}) {
  return (
    <SafeAreaView style={styles.page}>
      <ScrollView
        scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={onExit} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back</Text>
        </Pressable>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function ResultView({
  passed,
  title,
  sub,
  onExit,
}: {
  passed: boolean;
  title: string;
  sub: string;
  onExit: () => void;
}) {
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.center}>
        <Text style={styles.bigEmoji}>{passed ? "🌟" : "💪"}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{sub}</Text>
        <Pressable onPress={onExit} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>BACK TO GAMES</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ---------- Multiple-choice engine (Who Can Help?, Polite Kids) ----------

export type Option = { emoji?: string; label: string; correct: boolean; note?: string };
export type ChoiceRound = { sceneEmoji: string; scene: string; options: Option[] };

export function ChoiceGame({
  level,
  onExit,
  onPassed,
  title,
  intro,
  buildRounds,
  correctMsg,
  wrongMsg,
  grid,
}: GameProps & {
  grid?: boolean;
  title: string;
  intro: string;
  buildRounds: (level: number) => ChoiceRound[];
  correctMsg: string;
  wrongMsg: string;
}) {
  const rounds = useMemo(() => buildRounds(level), [level, buildRounds]);
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const current = rounds[round];

  const pick = (index: number) => {
    if (chosen !== null) return;
    setChosen(index);
    if (current.options[index].correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (round + 1 >= ROUNDS) {
      setFinished(true);
      if (score >= PASS_SCORE) onPassed();
      return;
    }
    setRound(round + 1);
    setChosen(null);
  };

  if (finished) {
    const passed = score >= PASS_SCORE;
    return (
      <ResultView
        passed={passed}
        title={passed ? "Great job!" : "Try again!"}
        sub={`You got ${score} of ${ROUNDS} right.${passed ? " You earned a star!" : " Get 2 right to earn a star."}`}
        onExit={onExit}
      />
    );
  }

  return (
    <Frame onExit={onExit}>
      <View style={styles.hero}>
        <Text style={styles.meta}>
          Round {round + 1} of {ROUNDS} · {LEVEL_LABELS[level - 1]}
        </Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.bigEmoji}>{current.sceneEmoji}</Text>
        <Text style={styles.scene}>{current.scene}</Text>
        <Text style={styles.sub}>{intro}</Text>
      </View>

      <View style={grid ? styles.optionGrid : undefined}>
      {current.options.map((option, i) => {
        const isChosen = chosen === i;
        const reveal = chosen !== null;
        return (
          <Pressable
            key={`${option.label}-${i}`}
            disabled={reveal}
            onPress={() => pick(i)}
            style={[
              styles.option,
              grid && styles.optionGridItem,
              reveal && option.correct && styles.optionCorrect,
              reveal && isChosen && !option.correct && styles.optionWrong,
            ]}
          >
            {option.emoji ? <Text style={styles.optionEmoji}>{option.emoji}</Text> : null}
            <Text style={styles.optionText}>{option.label}</Text>
          </Pressable>
        );
      })}
      </View>

      {chosen !== null ? (
        <>
          <Text
            style={[styles.feedback, current.options[chosen].correct ? styles.good : styles.bad]}
          >
            {current.options[chosen].note ??
              (current.options[chosen].correct ? correctMsg : wrongMsg)}
          </Text>
          <Pressable onPress={next} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>
              {round + 1 >= ROUNDS ? "SEE RESULTS" : "NEXT"}
            </Text>
          </Pressable>
        </>
      ) : null}
    </Frame>
  );
}

// ----- Who Can Help? -----

const HELPERS = [
  { emoji: "🧑‍🚒", name: "Firefighter" },
  { emoji: "🧑‍⚕️", name: "Doctor" },
  { emoji: "🧑‍🔧", name: "Mechanic" },
  { emoji: "👮", name: "Police officer" },
  { emoji: "🧑‍🏫", name: "Teacher" },
  { emoji: "🚛", name: "Garbage collector" },
];

const PROBLEMS = [
  { emoji: "🔥", text: "There is a fire!", helper: "Firefighter" },
  { emoji: "🛞", text: "The car has a flat tire.", helper: "Mechanic" },
  { emoji: "🤒", text: "A child is sick.", helper: "Doctor" },
  { emoji: "🚨", text: "Someone is lost and needs help getting home.", helper: "Police officer" },
  { emoji: "📚", text: "We want to learn how to read.", helper: "Teacher" },
  { emoji: "🗑️", text: "The street is full of trash.", helper: "Garbage collector" },
];

function buildHelpRounds(level: number): ChoiceRound[] {
  const optionCount = level + 1; // 2, 3, 4 choices
  return shuffle(PROBLEMS)
    .slice(0, ROUNDS)
    .map((problem) => {
      const correct = HELPERS.find((h) => h.name === problem.helper)!;
      const others = shuffle(HELPERS.filter((h) => h.name !== problem.helper)).slice(
        0,
        optionCount - 1
      );
      return {
        sceneEmoji: problem.emoji,
        scene: problem.text,
        options: shuffle([correct, ...others]).map((h) => ({
          emoji: h.emoji,
          label: h.name,
          correct: h.name === problem.helper,
        })),
      };
    });
}

export function WhoCanHelpGame(props: GameProps) {
  return (
    <ChoiceGame
      {...props}
      title="🚒 Who Can Help?"
      intro="Who is the right helper?"
      buildRounds={buildHelpRounds}
      correctMsg="🦉 Yes! That helper can fix this."
      wrongMsg="🦉 Not quite. The green one is the right helper."
    />
  );
}

// ----- Polite Kids -----

const SCENES: { emoji: string; scene: string; good: string; bad: string[] }[] = [
  {
    emoji: "🍪",
    scene: "You want a cookie. What do you say?",
    good: "May I have a cookie, please?",
    bad: ["Give me that cookie!", "I want it now!", "Hmph."],
  },
  {
    emoji: "🎁",
    scene: "A friend gives you a present.",
    good: "Thank you!",
    bad: ["I don't like it.", "Whatever.", "Is that all?"],
  },
  {
    emoji: "🏫",
    scene: "You see your teacher in the morning.",
    good: "Good morning, teacher!",
    bad: ["Hey.", "Move!", "(Look away)"],
  },
  {
    emoji: "🤕",
    scene: "You bump into someone by accident.",
    good: "I'm sorry. Are you okay?",
    bad: ["Watch where you're going!", "It's your fault.", "Ha ha!"],
  },
  {
    emoji: "⚽",
    scene: "You want to join a game.",
    good: "May I play too, please?",
    bad: ["Let me in!", "Give me the ball!", "I'm taking it."],
  },
  {
    emoji: "👋",
    scene: "It's time to go home.",
    good: "Goodbye! See you tomorrow!",
    bad: ["Bye, I don't care.", "(Walk away silently)", "Stop talking."],
  },
];

function buildPoliteRounds(level: number): ChoiceRound[] {
  const optionCount = level + 1;
  return shuffle(SCENES)
    .slice(0, ROUNDS)
    .map((s) => ({
      sceneEmoji: s.emoji,
      scene: s.scene,
      options: shuffle([
        { label: s.good, correct: true },
        ...shuffle(s.bad)
          .slice(0, optionCount - 1)
          .map((label) => ({ label, correct: false })),
      ]),
    }));
}

export function PoliteKidsGame(props: GameProps) {
  return (
    <ChoiceGame
      {...props}
      title="🙏 Polite Kids"
      intro="Pick the polite thing to say."
      buildRounds={buildPoliteRounds}
      correctMsg="😄 So polite! The character is happy."
      wrongMsg="😕 Hmm, try a kinder way. The green one is polite."
    />
  );
}

// ---------- Safe Crossing ----------

export function SafeCrossingGame({ level, onExit, onPassed }: GameProps) {
  const [round, setRound] = useState(0);
  const [light, setLight] = useState<"red" | "green">("red");
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(false);
  const [outcome, setOutcome] = useState<null | { safe: boolean; msg: string }>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (outcome !== null) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const toGreen = () => {
      if (!alive) return;
      setLight("green");
      // Challenge: the green light does not last, so be quick!
      if (level === 3) timer = setTimeout(toRed, 6000);
    };
    const toRed = () => {
      if (!alive) return;
      setLight("red");
      timer = setTimeout(toGreen, 3000);
    };
    setLight("red");
    timer = setTimeout(toGreen, level === 1 ? 2000 : 3500);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [round, outcome, level]);

  const cross = () => {
    if (outcome !== null) return;
    if (light !== "green") {
      setOutcome({ safe: false, msg: "🛑 Oops! Always wait for the green light." });
    } else if (!left || !right) {
      setOutcome({ safe: false, msg: "👀 Oops! Look left and right before you cross." });
    } else {
      setScore((s) => s + 1);
      setOutcome({ safe: true, msg: "✅ Safe crossing! You waited and looked both ways." });
    }
  };

  const next = () => {
    if (round + 1 >= ROUNDS) {
      setFinished(true);
      if (score >= PASS_SCORE) onPassed();
      return;
    }
    setRound(round + 1);
    setLeft(false);
    setRight(false);
    setOutcome(null);
  };

  if (finished) {
    const passed = score >= PASS_SCORE;
    return (
      <ResultView
        passed={passed}
        title={passed ? "Safety star!" : "Try again!"}
        sub={`You crossed safely ${score} of ${ROUNDS} times.${passed ? " You earned a star!" : " Cross safely 2 times to earn a star."}`}
        onExit={onExit}
      />
    );
  }

  return (
    <Frame onExit={onExit}>
      <View style={styles.hero}>
        <Text style={styles.meta}>
          Crossing {round + 1} of {ROUNDS} · {LEVEL_LABELS[level - 1]}
        </Text>
        <Text style={styles.title}>🚦 Safe Crossing</Text>
        <Text style={styles.sub}>Wait for green, look both ways, then cross.</Text>
        <View style={styles.lightRow}>
          <View
            style={[styles.lightDot, { backgroundColor: light === "green" ? "#3FB56B" : "#D84A3A" }]}
          />
          <Text style={styles.lightText}>{light === "green" ? "GREEN: you may go" : "RED: wait"}</Text>
        </View>
        <View style={styles.road}>
          <Text style={styles.roadEmoji}>🚶 🛣️ 🚗 🚕</Text>
        </View>
      </View>

      <View style={styles.lookRow}>
        <Pressable
          disabled={outcome !== null}
          onPress={() => setLeft(true)}
          style={[styles.lookBtn, left && styles.lookBtnDone]}
        >
          <Text style={styles.lookText}>{left ? "✓ " : ""}👈 Look left</Text>
        </Pressable>
        <Pressable
          disabled={outcome !== null}
          onPress={() => setRight(true)}
          style={[styles.lookBtn, right && styles.lookBtnDone]}
        >
          <Text style={styles.lookText}>{right ? "✓ " : ""}Look right 👉</Text>
        </Pressable>
      </View>

      {outcome === null ? (
        <Pressable onPress={cross} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>🚶 CROSS</Text>
        </Pressable>
      ) : (
        <>
          <Text style={[styles.feedback, outcome.safe ? styles.good : styles.bad]}>
            {outcome.msg}
          </Text>
          <Pressable onPress={next} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>
              {round + 1 >= ROUNDS ? "SEE RESULTS" : "NEXT"}
            </Text>
          </Pressable>
        </>
      )}
    </Frame>
  );
}

// ---------- Drag-and-drop primitives (PanResponder, no extra libraries) ----------

export function useSlots() {
  const refs = useRef<Record<string, View | null>>({});
  const register = (key: string) => (node: View | null) => {
    refs.current[key] = node;
  };
  // Returns every registered slot that contains the given screen point.
  const hits = async (px: number, py: number): Promise<string[]> => {
    const results = await Promise.all(
      Object.keys(refs.current).map(
        (key) =>
          new Promise<string | null>((resolve) => {
            const node = refs.current[key];
            if (!node) return resolve(null);
            node.measureInWindow((x, y, w, h) =>
              resolve(px >= x && px <= x + w && py >= y && py <= y + h ? key : null)
            );
          })
      )
    );
    return results.filter((key): key is string => key !== null);
  };
  return { register, hits };
}

export function DraggablePiece({
  children,
  onDrop,
  onDragging,
}: {
  children: ReactNode;
  onDrop: (pageX: number, pageY: number) => Promise<boolean>;
  onDragging: (dragging: boolean) => void;
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const latest = useRef({ onDrop, onDragging });
  latest.current = { onDrop, onDragging };

  const snapBack = () =>
    Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => latest.current.onDragging(true),
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_event, gesture) => {
        latest.current.onDragging(false);
        void latest.current.onDrop(gesture.moveX, gesture.moveY).then((accepted) => {
          if (!accepted) snapBack();
        });
      },
      onPanResponderTerminate: () => {
        latest.current.onDragging(false);
        snapBack();
      },
    })
  ).current;

  return (
    <Animated.View
      {...responder.panHandlers}
      style={{ transform: pan.getTranslateTransform(), zIndex: 20, elevation: 8 }}
    >
      {children}
    </Animated.View>
  );
}

// ---------- House Builder ----------

type Shape = "triangle" | "square" | "rectangle" | "circle";

function ShapeView({
  shape,
  w,
  h,
  color,
  outline,
}: {
  shape: Shape;
  w: number;
  h: number;
  color: string;
  outline?: boolean;
}) {
  if (shape === "triangle") {
    return (
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: w / 2,
          borderRightWidth: w / 2,
          borderBottomWidth: h,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderBottomColor: color,
        }}
      />
    );
  }
  return (
    <View
      style={{
        width: w,
        height: h,
        backgroundColor: color,
        borderRadius: shape === "circle" ? Math.min(w, h) / 2 : 6,
        borderWidth: outline ? 2 : 0,
        borderColor: "#9FB4BB",
        borderStyle: outline ? "dashed" : "solid",
      }}
    />
  );
}

type HouseSlot = {
  key: string;
  shape: Shape;
  left: number;
  top: number;
  w: number;
  h: number;
  color: string;
};

// Order matters: later slots are drawn on top of earlier ones.
const HOUSE_SLOTS: HouseSlot[] = [
  { key: "wall", shape: "square", left: 50, top: 90, w: 180, h: 160, color: "#FFE181" },
  { key: "roof", shape: "triangle", left: 30, top: 10, w: 220, h: 80, color: "#F17D65" },
  { key: "door", shape: "rectangle", left: 120, top: 170, w: 40, h: 80, color: "#8B5E3C" },
  { key: "win1", shape: "circle", left: 65, top: 115, w: 40, h: 40, color: "#9EDCEB" },
  { key: "win2", shape: "circle", left: 175, top: 115, w: 40, h: 40, color: "#9EDCEB" },
];
const HOUSE_KEYS_BY_LEVEL = [
  ["wall", "roof"],
  ["wall", "roof", "door", "win1"],
  ["wall", "roof", "door", "win1", "win2"],
];
const TRAY_SIZE: Record<Shape, { w: number; h: number }> = {
  triangle: { w: 64, h: 54 },
  square: { w: 56, h: 56 },
  rectangle: { w: 36, h: 64 },
  circle: { w: 46, h: 46 },
};

export function HouseBuilderGame({ level, onExit, onPassed }: GameProps) {
  const slotDefs = HOUSE_SLOTS.filter((s) => HOUSE_KEYS_BY_LEVEL[level - 1].includes(s.key));
  const pieces = useMemo(
    () => shuffle(slotDefs.map((s) => ({ id: s.key, shape: s.shape, color: s.color }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level]
  );
  const slots = useSlots();
  const [filled, setFilled] = useState<Record<string, boolean>>({});
  const [used, setUsed] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("Drag each shape into its spot!");
  const [finished, setFinished] = useState(false);

  const drop = async (piece: { id: string; shape: Shape }, px: number, py: number) => {
    const hitKeys = await slots.hits(px, py);
    const target = slotDefs.find(
      (s) => hitKeys.includes(s.key) && s.shape === piece.shape && !filled[s.key]
    );
    if (!target) {
      setMessage(`Try another spot for the ${piece.shape}.`);
      return false;
    }
    const nextFilled = { ...filled, [target.key]: true };
    setFilled(nextFilled);
    setUsed((u) => [...u, piece.id]);
    setMessage("Nice fit!");
    if (slotDefs.every((s) => nextFilled[s.key])) {
      setFinished(true);
      onPassed();
    }
    return true;
  };

  if (finished) {
    return (
      <ResultView
        passed
        title="You built a house!"
        sub="Great shape matching. You earned a star!"
        onExit={onExit}
      />
    );
  }

  return (
    <Frame onExit={onExit} scrollEnabled={!dragging}>
      <View style={styles.hero}>
        <Text style={styles.meta}>{LEVEL_LABELS[level - 1]}</Text>
        <Text style={styles.title}>🏠 House Builder</Text>
        <Text style={styles.sub}>{message}</Text>
      </View>

      <View style={styles.houseCanvas}>
        {slotDefs.map((s) => (
          <View
            key={s.key}
            ref={slots.register(s.key)}
            collapsable={false}
            style={{ position: "absolute", left: s.left, top: s.top, width: s.w, height: s.h }}
          >
            <ShapeView
              shape={s.shape}
              w={s.w}
              h={s.h}
              color={filled[s.key] ? s.color : "#CBD9DE"}
              outline={!filled[s.key]}
            />
          </View>
        ))}
      </View>

      <View style={styles.tray}>
        {pieces
          .filter((p) => !used.includes(p.id))
          .map((p) => (
            <View key={p.id} style={styles.trayItem}>
              <DraggablePiece
                onDragging={setDragging}
                onDrop={(px, py) => drop(p, px, py)}
              >
                <ShapeView
                  shape={p.shape}
                  w={TRAY_SIZE[p.shape].w}
                  h={TRAY_SIZE[p.shape].h}
                  color={p.color}
                />
              </DraggablePiece>
              <Text style={styles.trayLabel}>{p.shape}</Text>
            </View>
          ))}
      </View>
    </Frame>
  );
}

// ---------- Healthy Routine ----------

type Step = { emoji: string; text: string };
const ROUTINES: { title: string; steps: Step[] }[] = [
  {
    title: "Brush your teeth",
    steps: [
      { emoji: "🪥", text: "Put toothpaste on the brush" },
      { emoji: "😁", text: "Brush all your teeth" },
      { emoji: "🚰", text: "Spit and rinse your mouth" },
    ],
  },
  {
    title: "Wash your hands",
    steps: [
      { emoji: "💧", text: "Wet your hands" },
      { emoji: "🧼", text: "Add soap" },
      { emoji: "🙌", text: "Scrub your hands" },
      { emoji: "🚿", text: "Rinse off the soap" },
    ],
  },
  {
    title: "Wash your hands",
    steps: [
      { emoji: "💧", text: "Wet your hands" },
      { emoji: "🧼", text: "Add soap" },
      { emoji: "🙌", text: "Scrub your hands" },
      { emoji: "🚿", text: "Rinse off the soap" },
      { emoji: "🧻", text: "Dry your hands" },
    ],
  },
];

export function HealthyRoutineGame({ level, onExit, onPassed }: GameProps) {
  const routine = ROUTINES[level - 1];
  const pieces = useMemo(
    () => shuffle(routine.steps.map((step, order) => ({ ...step, order }))),
    [routine]
  );
  const slots = useSlots();
  const [placed, setPlaced] = useState<Record<number, Step>>({});
  const [used, setUsed] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("Drag the steps into the right order!");
  const [finished, setFinished] = useState(false);

  const drop = async (piece: Step & { order: number }, px: number, py: number) => {
    const hitKeys = await slots.hits(px, py);
    const slotIndex = routine.steps.findIndex((_, i) => hitKeys.includes(`slot-${i}`));
    if (slotIndex === -1 || placed[slotIndex]) {
      setMessage("Drop it on one of the numbered boxes.");
      return false;
    }
    if (slotIndex !== piece.order) {
      setMessage("Not yet. Think about what comes first.");
      return false;
    }
    const nextPlaced = { ...placed, [slotIndex]: piece };
    setPlaced(nextPlaced);
    setUsed((u) => [...u, piece.order]);
    setMessage("Right! Keep going.");
    if (routine.steps.every((_, i) => nextPlaced[i])) {
      setFinished(true);
      onPassed();
    }
    return true;
  };

  if (finished) {
    return (
      <ResultView
        passed
        title="Healthy habit!"
        sub={`You put "${routine.title}" in the right order. You earned a star!`}
        onExit={onExit}
      />
    );
  }

  return (
    <Frame onExit={onExit} scrollEnabled={!dragging}>
      <View style={styles.hero}>
        <Text style={styles.meta}>{LEVEL_LABELS[level - 1]}</Text>
        <Text style={styles.title}>🧼 Healthy Routine</Text>
        <Text style={styles.scene}>{routine.title}</Text>
        <Text style={styles.sub}>{message}</Text>
      </View>

      {routine.steps.map((_, i) => (
        <View
          key={i}
          ref={slots.register(`slot-${i}`)}
          collapsable={false}
          style={[styles.stepSlot, placed[i] && styles.stepSlotFilled]}
        >
          <Text style={styles.stepNumber}>{i + 1}</Text>
          <Text style={styles.stepText}>
            {placed[i] ? `${placed[i].emoji} ${placed[i].text}` : ""}
          </Text>
        </View>
      ))}

      <View style={styles.stepTray}>
        {pieces
          .filter((p) => !used.includes(p.order))
          .map((p) => (
            <DraggablePiece
              key={p.order}
              onDragging={setDragging}
              onDrop={(px, py) => drop(p, px, py)}
            >
              <View style={styles.stepCard}>
                <Text style={styles.stepText}>
                  {p.emoji} {p.text}
                </Text>
              </View>
            </DraggablePiece>
          ))}
      </View>
    </Frame>
  );
}

// ---------- Styles ----------

export const styles = StyleSheet.create({
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  optionGridItem: { width: "47%", marginBottom: 0, justifyContent: "center" },
  page: { flex: 1, backgroundColor: "#F2FBFD" },
  scroll: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  backBtn: { alignSelf: "flex-start", backgroundColor: "#C62828", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 10 },
  backBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  hero: { alignItems: "center", backgroundColor: "#DDF5F1", borderRadius: 20, padding: 16, marginBottom: 14 },
  bigEmoji: { fontSize: 54, marginVertical: 4 },
  title: { color: "#173B53", fontSize: 24, fontWeight: "900", textAlign: "center" },
  scene: { color: "#173B53", fontSize: 18, fontWeight: "800", lineHeight: 25, textAlign: "center", marginTop: 4 },
  sub: { color: "#36566A", fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 4 },
  meta: { color: "#4B6A7A", fontSize: 13, fontWeight: "800" },
  option: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFFFFF", borderColor: "#D5F5EB", borderWidth: 3, borderRadius: 18, padding: 14, marginBottom: 10, minHeight: 64 },
  optionCorrect: { borderColor: "#66CBB1", backgroundColor: "#D5F5EB" },
  optionWrong: { borderColor: "#E53E3E", backgroundColor: "#FFE0DC" },
  optionEmoji: { fontSize: 34 },
  optionText: { flex: 1, color: "#173B53", fontSize: 16, fontWeight: "800" },
  primaryBtn: { alignItems: "center", justifyContent: "center", minHeight: 56, borderRadius: 16, backgroundColor: "#F17D65", paddingHorizontal: 16, marginTop: 8, alignSelf: "stretch" },
  primaryBtnText: { color: "#FFFDF5", fontSize: 16, fontWeight: "800" },
  feedback: { fontSize: 17, fontWeight: "900", textAlign: "center", marginVertical: 8 },
  good: { color: "#28543A" },
  bad: { color: "#9C3E32" },
  lightRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  lightDot: { width: 34, height: 34, borderRadius: 17 },
  lightText: { color: "#173B53", fontSize: 16, fontWeight: "900" },
  road: { alignSelf: "stretch", alignItems: "center", backgroundColor: "#6B7780", borderRadius: 14, paddingVertical: 14, marginTop: 12 },
  roadEmoji: { fontSize: 32 },
  lookRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  lookBtn: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 56, backgroundColor: "#FFF0AA", borderColor: "#F3C451", borderWidth: 2, borderRadius: 14 },
  lookBtnDone: { backgroundColor: "#D5F5EB", borderColor: "#66CBB1" },
  lookText: { color: "#173B53", fontSize: 15, fontWeight: "800" },
  houseCanvas: { width: 280, height: 250, alignSelf: "center", marginVertical: 8 },
  tray: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 20, backgroundColor: "#FFFFFF", borderColor: "#D5F5EB", borderWidth: 2, borderRadius: 18, padding: 14, marginTop: 8, minHeight: 100, zIndex: 10 },
  trayItem: { alignItems: "center", justifyContent: "flex-end" },
  trayLabel: { color: "#4B6A7A", fontSize: 12, fontWeight: "800", marginTop: 4 },
  stepSlot: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56, borderWidth: 2, borderStyle: "dashed", borderColor: "#9FB4BB", backgroundColor: "#EEF4F6", borderRadius: 14, paddingHorizontal: 12, marginBottom: 8 },
  stepSlotFilled: { borderStyle: "solid", borderColor: "#66CBB1", backgroundColor: "#D5F5EB" },
  stepNumber: { color: "#FFFFFF", backgroundColor: "#258EA3", width: 30, height: 30, borderRadius: 15, textAlign: "center", textAlignVertical: "center", lineHeight: 30, fontWeight: "900" },
  stepText: { flex: 1, color: "#173B53", fontSize: 15, fontWeight: "800" },
  stepTray: { gap: 8, marginTop: 10, zIndex: 10 },
  stepCard: { flexDirection: "row", alignItems: "center", minHeight: 52, backgroundColor: "#FFF0AA", borderColor: "#F3C451", borderWidth: 2, borderRadius: 14, paddingHorizontal: 12 },
});
