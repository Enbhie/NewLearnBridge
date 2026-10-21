import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutRectangle,
} from "react-native";
import * as Speech from "expo-speech";
import { playFeedback } from "../utils/soundEffects";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import { AppAppearanceContext } from "./CloudBackdrop";

const words = [
  { word: "CAT", clue: "A furry pet that says meow.", emoji: "🐱" },
  { word: "SUN", clue: "It shines bright in the sky.", emoji: "☀️" },
  { word: "DOG", clue: "A friendly pet that barks.", emoji: "🐶" },
];

type GameResults = {
  correct: number;
  total: number;
  breakdown: { label: string; answer: string; correct: boolean }[];
};

type LetterTileProps = {
  id: number;
  letter: string;
  onDrop: (id: number, x: number, y: number) => void;
};

function shuffle<T,>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function DraggableLetter({ id, letter, onDrop }: LetterTileProps) {
  const { darkMode } = useContext(AppAppearanceContext);
  const position = useRef(new Animated.ValueXY()).current;
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event(
          [null, { dx: position.x, dy: position.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (_event, gesture) => {
          onDrop(id, gesture.moveX, gesture.moveY);
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            stiffness: 300,
            damping: 22,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        },
      }),
    [id, onDrop, position]
  );

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.letterTile,
        darkMode && styles.darkLetterTile,
        { transform: position.getTranslateTransform() },
      ]}
      accessibilityLabel={`Drag letter ${letter}`}
      accessibilityRole="button"
    >
      <Text style={styles.letterTileText}>{letter}</Text>
    </Animated.View>
  );
}

export default function AlphabetWordGame({
  onBack,
  onFinish,
}: {
  onBack: () => void;
  onFinish: (results: GameResults) => void;
}) {
  const { darkMode } = useContext(AppAppearanceContext);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const slotSize = Math.min(116, Math.max(88, (width - 72) / 3));
  const [roundIndex, setRoundIndex] = useState(0);
  const [placed, setPlaced] = useState<(number | null)[]>([]);
  const [tileOrder, setTileOrder] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("Drag each letter into its matching shadow.");
  const [finishedWord, setFinishedWord] = useState(false);
  const [slots, setSlots] = useState<
    ((LayoutRectangle & { pageX: number; pageY: number }) | null)[]
  >([]);
  const slotRefs = useRef<(View | null)[]>([]);
  const current = words[roundIndex];
  const letters = current.word.split("");

  useEffect(() => {
    setTileOrder(shuffle(letters.map((_, index) => index)));
    setPlaced(letters.map(() => null));
    setSlots(letters.map(() => null));
    slotRefs.current = [];
    setFinishedWord(false);
    setFeedback("Drag each letter into its matching shadow.");
  }, [roundIndex]);

  useEffect(() => {
    if (finishedWord) {
      Speech.speak(current.word, {
        language: "en-US",
        pitch: 1.1,
        rate: 0.82,
      });
    }
    return () => {
      void Speech.stop();
    };
  }, [current.word, finishedWord]);

  const onDrop = useMemo(
    () => (tileId: number, pageX: number, pageY: number) => {
      if (finishedWord || placed.includes(tileId)) return;
      const slotIndex = slots
        .map((slot, index) => ({ slot, index }))
        .filter(
          ({ slot }) =>
            slot !== null &&
            pageX >= slot.pageX - 32 &&
            pageX <= slot.pageX + slot.width + 32 &&
            pageY >= slot.pageY - 32 &&
            pageY <= slot.pageY + slot.height + 32
        )
        .sort((first, second) => {
          const firstSlot = first.slot!;
          const secondSlot = second.slot!;
          const firstDistance = Math.hypot(
            pageX - (firstSlot.pageX + firstSlot.width / 2),
            pageY - (firstSlot.pageY + firstSlot.height / 2)
          );
          const secondDistance = Math.hypot(
            pageX - (secondSlot.pageX + secondSlot.width / 2),
            pageY - (secondSlot.pageY + secondSlot.height / 2)
          );
          return firstDistance - secondDistance;
        })[0]?.index ?? -1;
      if (slotIndex < 0 || placed[slotIndex] !== null) return;

      if (letters[slotIndex] !== letters[tileId]) {
        setFeedback("Not that spot yet. Try another letter!");
        playFeedback("error");
        return;
      }

      const nextPlaced = [...placed];
      nextPlaced[slotIndex] = tileId;
      setPlaced(nextPlaced);
      setFeedback("Great match! Keep going!");
      playFeedback("success");

      if (nextPlaced.every((tile) => tile !== null)) {
        setFinishedWord(true);
        setFeedback(`You spelled ${current.word}! Listen to the word.`);
      }
    },
    [current.word, finishedWord, letters, placed, slots]
  );

  const measureSlot = (index: number) => {
    slotRefs.current[index]?.measureInWindow((pageX, pageY, slotWidth, slotHeight) => {
      setSlots((currentSlots) => {
        const nextSlots = [...currentSlots];
        nextSlots[index] = {
          x: 0,
          y: 0,
          width: slotWidth,
          height: slotHeight,
          pageX,
          pageY,
        };
        return nextSlots;
      });
    });
  };

  const continueGame = () => {
    if (roundIndex + 1 < words.length) {
      setRoundIndex((index) => index + 1);
      return;
    }
    onFinish({
      correct: words.length,
      total: words.length,
      breakdown: words.map(({ word }) => ({
        label: "Build the word",
        answer: word,
        correct: true,
      })),
    });
  };

  return (
    <SafeAreaView style={[styles.screen, darkMode && styles.darkScreen]}>
      <View style={[styles.topBar, darkMode && styles.darkTopBar]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.progressCopy}>
          <Text style={[styles.progressTitle, darkMode && styles.darkText]}>Alphabet Word Builder</Text>
          <Text style={[styles.progressSubtitle, darkMode && styles.darkMutedText]}>Word {roundIndex + 1} of {words.length}</Text>
        </View>
        <Text style={styles.progressEmoji}>🔤</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          isLandscape && styles.bodyLandscape,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.playArea}>
          <View style={[styles.wordPanel, darkMode && styles.darkCard]}>
            <Text style={styles.wordEmoji}>{current.emoji}</Text>
            <Text style={[styles.instruction, darkMode && styles.darkText]}>Build the word!</Text>
            <Text style={[styles.clue, darkMode && styles.darkMutedText]}>{current.clue}</Text>
            <View style={styles.slotsRow}>
              {letters.map((letter, index) => (
                <View
                  key={`${current.word}-${index}`}
                  ref={(ref) => {
                    slotRefs.current[index] = ref;
                  }}
                  onLayout={() => measureSlot(index)}
                  style={[
                    styles.letterSlot,
                    { width: slotSize, height: slotSize * 1.12 },
                    placed[index] !== null && styles.letterSlotFilled,
                  ]}
                >
                  <Text
                    style={[
                      styles.slotLetter,
                      { fontSize: slotSize * 0.72 },
                      placed[index] !== null && styles.slotLetterFilled,
                      darkMode && styles.darkText,
                    ]}
                  >
                    {placed[index] === null ? letter : letters[placed[index]!]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.letterPanel, darkMode && styles.darkCard]}>
            <Text style={[styles.letterPanelTitle, darkMode && styles.darkText]}>Find the letters</Text>
            <View style={styles.letterTray}>
              {tileOrder.map((tileId) =>
                placed.includes(tileId) ? (
                  <View key={tileId} style={styles.letterTilePlaceholder} />
                ) : (
                  <DraggableLetter
                    key={`${roundIndex}-${tileId}`}
                    id={tileId}
                    letter={letters[tileId]}
                    onDrop={onDrop}
                  />
                )
              )}
            </View>
            <Text
              accessibilityLiveRegion="polite"
              style={[
                styles.feedback,
                darkMode && styles.darkMutedText,
                finishedWord && styles.feedbackComplete,
              ]}
            >
              {feedback}
            </Text>
            {finishedWord ? (
              <Pressable
                accessibilityRole="button"
                onPress={continueGame}
                style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
              >
                <Text style={styles.continueText}>
                  {roundIndex + 1 === words.length ? "SEE RESULTS" : "NEXT WORD"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#CDEEF1",
  },
  backButton: {
    minWidth: 64,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#C62828",
    paddingHorizontal: 12,
  },
  backText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  progressCopy: { flex: 1 },
  progressTitle: { color: "#173B53", fontSize: 19, fontWeight: "900" },
  progressSubtitle: { color: "#36566A", fontSize: 13, fontWeight: "700", marginTop: 2 },
  progressEmoji: { fontSize: 30 },
  body: { flexGrow: 1, padding: 16, paddingBottom: 24 },
  bodyLandscape: { justifyContent: "center" },
  playArea: { flex: 1, justifyContent: "center", gap: 12 },
  wordPanel: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: "#DDF5F2",
  },
  wordEmoji: { fontSize: 36 },
  instruction: { color: "#173B53", fontSize: 22, fontWeight: "900", marginTop: 2 },
  clue: { color: "#36566A", fontSize: 15, lineHeight: 20, textAlign: "center", marginTop: 3 },
  slotsRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 12 },
  letterSlot: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderStyle: "dashed",
    borderColor: "#729DA3",
    borderRadius: 20,
    backgroundColor: "#B8DADD",
  },
  letterSlotFilled: { borderStyle: "solid", borderColor: "#39A982", backgroundColor: "#FFFFFF" },
  slotLetter: { color: "#68868A", fontWeight: "900" },
  slotLetterFilled: { color: "#173B53" },
  letterPanel: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 142,
    padding: 12,
    borderRadius: 22,
    backgroundColor: "#FFF0AA",
  },
  letterPanelTitle: { color: "#173B53", fontSize: 17, fontWeight: "900" },
  letterTray: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    minHeight: 82,
    marginTop: 12,
  },
  letterTile: {
    width: 64,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderBottomWidth: 5,
    borderBottomColor: "#187284",
    backgroundColor: "#258EA3",
    zIndex: 2,
  },
  letterTileText: { color: "#FFFFFF", fontSize: 36, fontWeight: "900" },
  letterTilePlaceholder: { width: 64, height: 68 },
  feedback: { minHeight: 24, color: "#36566A", fontSize: 14, fontWeight: "800", textAlign: "center", marginTop: 10 },
  feedbackComplete: { color: "#25805C", fontSize: 16 },
  continueButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    marginTop: 10,
    borderRadius: 15,
    backgroundColor: "#F17D65",
  },
  continueText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  pressed: { opacity: 0.72 },
  darkScreen: { backgroundColor: "rgba(18, 29, 50, 0.32)" },
  darkTopBar: { backgroundColor: "#202B40", borderBottomColor: "#35445F" },
  darkCard: { backgroundColor: "#303D55", borderColor: "#465671" },
  darkLetterTile: { backgroundColor: "#456C7B", borderBottomColor: "#324F5D" },
  darkText: { color: "#E4EAF3" },
  darkMutedText: { color: "#B9C5D8" },
});
