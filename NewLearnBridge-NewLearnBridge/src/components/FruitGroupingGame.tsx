import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutRectangle,
} from "react-native";
import { playFeedback } from "../utils/soundEffects";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";

type Fruit = {
  id: string;
  name: string;
  size: string;
  emoji: string;
  scale: number;
};

type Round = {
  title: string;
  instruction: string;
  fruits: Fruit[];
};

const rounds: Round[] = [
  {
    title: "Same fruit, different sizes",
    instruction: "Drag the apples into the baskets from smallest to largest.",
    fruits: [
      { id: "apple-large", name: "Apple", size: "Large", emoji: "🍎", scale: 1.12 },
      { id: "apple-small", name: "Apple", size: "Small", emoji: "🍎", scale: 0.66 },
      { id: "apple-medium", name: "Apple", size: "Medium", emoji: "🍎", scale: 0.88 },
    ],
  },
  {
    title: "Different fruits",
    instruction: "Put these fruits in order from smallest to largest.",
    fruits: [
      { id: "watermelon", name: "Watermelon", size: "Large", emoji: "🍉", scale: 1.12 },
      { id: "grapes", name: "Grapes", size: "Small", emoji: "🍇", scale: 0.66 },
      { id: "orange", name: "Orange", size: "Medium", emoji: "🍊", scale: 0.88 },
    ],
  },
  {
    title: "Fruits and sizes",
    instruction: "Look at each fruit and size. Sort them from smallest to largest.",
    fruits: [
      { id: "watermelon-small", name: "Watermelon", size: "Medium", emoji: "🍉", scale: 0.88 },
      { id: "strawberry", name: "Strawberry", size: "Small", emoji: "🍓", scale: 0.66 },
      { id: "banana", name: "Banana", size: "Large", emoji: "🍌", scale: 1.02 },
      { id: "blueberries", name: "Blueberries", size: "Tiny", emoji: "🫐", scale: 0.54 },
      { id: "pineapple", name: "Pineapple", size: "Big", emoji: "🍍", scale: 1.16 },
    ],
  },
];

type Slot = LayoutRectangle & { pageX: number; pageY: number };

function shuffle<T,>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function DraggableFruit({
  fruit,
  width,
  isDragging,
  onDragStart,
  onDragMove,
  onDrop,
  onCancel,
}: {
  fruit: Fruit;
  width: number;
  isDragging: boolean;
  onDragStart: (fruit: Fruit, x: number, y: number) => void;
  onDragMove: (id: string, x: number, y: number) => void;
  onDrop: (id: string, x: number, y: number) => void;
  onCancel: (id: string) => void;
}) {
  const callbacks = useRef({ onDragStart, onDragMove, onDrop, onCancel });
  callbacks.current = { onDragStart, onDragMove, onDrop, onCancel };
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (_event, gesture) => {
          callbacks.current.onDragStart(fruit, gesture.x0, gesture.y0);
        },
        onPanResponderMove: (_event, gesture) => {
          callbacks.current.onDragMove(fruit.id, gesture.moveX, gesture.moveY);
        },
        onPanResponderRelease: (_event, gesture) => {
          callbacks.current.onDrop(fruit.id, gesture.moveX, gesture.moveY);
        },
        onPanResponderTerminate: () => callbacks.current.onCancel(fruit.id),
      }),
    [fruit]
  );

  return (
    <View
      {...responder.panHandlers}
      accessibilityLabel={`Drag ${fruit.size.toLowerCase()} ${fruit.name}`}
      accessibilityRole="button"
      style={[styles.fruitTile, { width }, isDragging && styles.fruitTileDragging]}
    >
      <Text style={[styles.fruitEmoji, { fontSize: 48 * fruit.scale }]}>{fruit.emoji}</Text>
      <Text style={styles.fruitName}>{fruit.name}</Text>
      <Text style={styles.fruitSize}>{fruit.size}</Text>
    </View>
  );
}

export default function FruitGroupingGame({
  onBack,
  onFinish,
}: {
  onBack: () => void;
  onFinish: () => void;
}) {
  const { width } = useWindowDimensions();
  const [roundIndex, setRoundIndex] = useState(0);
  const [tileOrder, setTileOrder] = useState(() =>
    shuffle(rounds[0].fruits.map((fruit) => fruit.id))
  );
  const [placed, setPlaced] = useState<(string | null)[]>(() =>
    rounds[0].fruits.map(() => null)
  );
  const [slots, setSlots] = useState<(Slot | null)[]>(() =>
    rounds[0].fruits.map(() => null)
  );
  const [feedback, setFeedback] = useState("Choose a fruit and drag it into the right basket.");
  const [roundComplete, setRoundComplete] = useState(false);
  const slotRefs = useRef<(View | null)[]>([]);
  const rootRef = useRef<View | null>(null);
  const rootOffset = useRef({ x: 0, y: 0 });
  const dragPosition = useRef(new Animated.ValueXY()).current;
  const dropRotation = useRef(new Animated.Value(0)).current;
  const dropScale = useRef(new Animated.Value(1)).current;
  const pendingDropRef = useRef(false);
  const activeDragIdRef = useRef<string | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const [draggedFruit, setDraggedFruit] = useState<Fruit | null>(null);
  const currentRound = rounds[roundIndex];
  const orderedFruits = [...currentRound.fruits].sort((first, second) => first.scale - second.scale);
  const tileWidth = Math.max(
    48,
    Math.min(132, (width - 44 - (orderedFruits.length - 1) * 8) / orderedFruits.length)
  );
  const tileHeight = 126;

  const handleDragStart = (fruit: Fruit, pageX: number, pageY: number) => {
    if (pendingDropRef.current || activeDragIdRef.current !== null) return;
    activeDragIdRef.current = fruit.id;
    dragPosition.setValue({
      x: pageX - rootOffset.current.x - tileWidth / 2,
      y: pageY - rootOffset.current.y - tileHeight / 2,
    });
    dropRotation.setValue(0);
    dropScale.setValue(1);
    setIsDropping(false);
    setDraggedFruit(fruit);
  };

  const handleDragMove = (fruitId: string, pageX: number, pageY: number) => {
    if (activeDragIdRef.current !== fruitId || pendingDropRef.current) return;
    dragPosition.setValue({
      x: pageX - rootOffset.current.x - tileWidth / 2,
      y: pageY - rootOffset.current.y - tileHeight / 2,
    });
  };

  const clearDraggedFruit = (fruitId: string) => {
    if (activeDragIdRef.current === fruitId && !pendingDropRef.current) {
      activeDragIdRef.current = null;
      setDraggedFruit(null);
    }
  };

  const measureSlot = (index: number) => {
    slotRefs.current[index]?.measureInWindow((pageX, pageY, slotWidth, slotHeight) => {
      setSlots((current) => {
        const next = [...current];
        next[index] = {
          x: 0,
          y: 0,
          width: slotWidth,
          height: slotHeight,
          pageX,
          pageY,
        };
        return next;
      });
    });
  };

  const onDrop = useMemo(
    () => (fruitId: string, pageX: number, pageY: number) => {
      if (activeDragIdRef.current !== fruitId) return;
      if (pendingDropRef.current || roundComplete || placed.includes(fruitId)) {
        activeDragIdRef.current = null;
        setDraggedFruit(null);
        return;
      }
      const horizontalDropTolerance = Math.max(16, tileWidth / 2);
      const verticalDropTolerance = tileHeight / 2;
      const slotIndex = slots
        .map((slot, index) => ({ slot, index }))
        .filter(
          ({ slot }) =>
            slot !== null &&
            pageX >= slot.pageX - horizontalDropTolerance &&
            pageX <= slot.pageX + slot.width + horizontalDropTolerance &&
            pageY >= slot.pageY - verticalDropTolerance &&
            pageY <= slot.pageY + slot.height + verticalDropTolerance
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
      if (slotIndex < 0 || placed[slotIndex] !== null) {
        activeDragIdRef.current = null;
        setDraggedFruit(null);
        setFeedback("Drop the fruit into an empty basket.");
        return;
      }

      if (orderedFruits[slotIndex]?.id !== fruitId) {
        activeDragIdRef.current = null;
        setDraggedFruit(null);
        setFeedback("Try again. Find the fruit that is smaller.");
        playFeedback("error");
        return;
      }

      const slot = slots[slotIndex];
      if (!slot) {
        activeDragIdRef.current = null;
        setDraggedFruit(null);
        return;
      }
      const target = {
        x: slot.pageX - rootOffset.current.x + (slot.width - tileWidth) / 2,
        y: slot.pageY - rootOffset.current.y + 8,
      };
      pendingDropRef.current = true;
      setIsDropping(true);
      setFeedback("Great! Watch the fruit fall into its basket.");

      Animated.parallel([
        Animated.timing(dragPosition, {
          toValue: target,
          duration: 420,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(dropRotation, {
          toValue: 0.08,
          duration: 420,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(dropScale, {
          toValue: 0.78,
          duration: 420,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (!finished) {
          pendingDropRef.current = false;
          activeDragIdRef.current = null;
          setDraggedFruit(null);
          setIsDropping(false);
          return;
        }

        const next = [...placed];
        next[slotIndex] = fruitId;
        setPlaced(next);
        setDraggedFruit(null);
        setIsDropping(false);
        pendingDropRef.current = false;
        activeDragIdRef.current = null;
        playFeedback("success");
        if (next.every((item) => item !== null)) {
          setRoundComplete(true);
          setFeedback("Great sorting! You put the fruits in order.");
        } else {
          setFeedback("Great job! Find the next smallest fruit.");
        }
      });
    },
    [
      dragPosition,
      dropRotation,
      dropScale,
      orderedFruits,
      placed,
      roundComplete,
      slots,
      tileHeight,
      tileWidth,
    ]
  );

  const startNextRound = () => {
    if (roundIndex === rounds.length - 1) {
      onFinish();
      return;
    }
    const nextIndex = roundIndex + 1;
    const nextFruits = rounds[nextIndex].fruits;
    setRoundIndex(nextIndex);
    setTileOrder(shuffle(nextFruits.map((fruit) => fruit.id)));
    setPlaced(nextFruits.map(() => null));
    setSlots(nextFruits.map(() => null));
    slotRefs.current = [];
    dragPosition.setValue({ x: 0, y: 0 });
    dropRotation.setValue(0);
    dropScale.setValue(1);
    pendingDropRef.current = false;
    activeDragIdRef.current = null;
    setIsDropping(false);
    setDraggedFruit(null);
    setRoundComplete(false);
    setFeedback("Choose a fruit and drag it into the right basket.");
  };

  return (
    <SafeAreaView
      ref={rootRef}
      style={styles.screen}
      onLayout={() => {
        rootRef.current?.measureInWindow((pageX, pageY) => {
          rootOffset.current = { x: pageX, y: pageY };
        });
      }}
    >
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          disabled={isDropping}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
            isDropping && styles.disabled,
          ]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.progressCopy}>
          <Text style={styles.title}>Fruit Sorting</Text>
          <Text style={styles.subtitle}>Game {roundIndex + 1} of {rounds.length}</Text>
        </View>
        <Text style={styles.topEmoji}>🍎</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.instructionCard}>
          <Text style={styles.roundTitle}>{currentRound.title}</Text>
          <Text style={styles.instruction}>{currentRound.instruction}</Text>
          <View style={styles.directionRow}>
            <Text style={styles.directionLabel}>SMALLEST</Text>
            <Text style={styles.directionArrow}>→</Text>
            <Text style={styles.directionLabel}>LARGEST</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.slotRow}
          showsHorizontalScrollIndicator={false}
        >
          {orderedFruits.map((fruit, index) => {
            const placedFruit = placed[index]
              ? currentRound.fruits.find((item) => item.id === placed[index])
              : null;
            return (
              <View
                key={`slot-${fruit.id}`}
                ref={(ref) => {
                  slotRefs.current[index] = ref;
                }}
                onLayout={() => measureSlot(index)}
                accessibilityLabel={`Basket ${index + 1}${placedFruit ? ` with ${placedFruit.size.toLowerCase()} ${placedFruit.name}` : ", empty"}`}
                style={[
                  styles.basketTarget,
                  { width: tileWidth, minHeight: 144 },
                ]}
              >
                <View style={styles.basketHandle} />
                {placedFruit ? (
                  <View style={styles.basketContents}>
                    <Text style={[styles.basketFruit, { fontSize: 48 * placedFruit.scale }]}>
                      {placedFruit.emoji}
                    </Text>
                  </View>
                ) : null}
                <View style={[styles.basketBody, placedFruit && styles.basketBodyFilled]}>
                  <View style={styles.basketRim} />
                  <View style={styles.basketWeaveLine} />
                  <View style={styles.basketWeaveLine} />
                </View>
                {placedFruit ? (
                  <Text style={styles.basketLabel}>{placedFruit.size}</Text>
                ) : (
                  <View style={styles.emptyBasketContents}>
                    <Text style={styles.emptyBasketNumber}>{index + 1}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <Text style={styles.trayTitle}>Drag the fruits from here</Text>
        <ScrollView
          horizontal
          contentContainerStyle={styles.trayRow}
          showsHorizontalScrollIndicator={false}
        >
          {tileOrder.map((id) => {
            if (placed.includes(id)) {
              return <View key={id} style={[styles.fruitPlaceholder, { width: tileWidth }]} />;
            }
            const fruit = currentRound.fruits.find((item) => item.id === id);
            return fruit ? (
              <DraggableFruit
                key={`${roundIndex}-${id}`}
                fruit={fruit}
                width={tileWidth}
                isDragging={draggedFruit?.id === fruit.id}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDrop={onDrop}
                onCancel={clearDraggedFruit}
              />
            ) : null;
          })}
        </ScrollView>

        <Text accessibilityLiveRegion="polite" style={styles.feedback}>
          {feedback}
        </Text>
        {roundComplete ? (
          <Pressable
            accessibilityRole="button"
            onPress={startNextRound}
            style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
          >
            <Text style={styles.nextButtonText}>
              {roundIndex === rounds.length - 1 ? "FINISH GAME" : "NEXT GAME"}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
      {draggedFruit ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dragOverlay,
            isDropping && styles.dragOverlayDropping,
            { width: tileWidth, height: tileHeight },
            {
              transform: [
                ...dragPosition.getTranslateTransform(),
                { rotate: dropRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }) },
                { scale: dropScale },
              ],
            },
          ]}
        >
          <Text style={[styles.fruitEmoji, { fontSize: 48 * draggedFruit.scale }]}>
            {draggedFruit.emoji}
          </Text>
          {!isDropping ? (
            <>
              <Text style={styles.fruitName}>{draggedFruit.name}</Text>
              <Text style={styles.fruitSize}>{draggedFruit.size}</Text>
            </>
          ) : null}
        </Animated.View>
      ) : null}
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
    borderBottomColor: "#F0DFAF",
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
  title: { color: "#523B24", fontSize: 19, fontWeight: "900" },
  subtitle: { color: "#785F42", fontSize: 13, fontWeight: "700", marginTop: 2 },
  topEmoji: { fontSize: 30 },
  content: { flexGrow: 1, alignItems: "center", padding: 14, paddingBottom: 24, gap: 12 },
  instructionCard: {
    width: "100%",
    maxWidth: 860,
    alignItems: "center",
    backgroundColor: "#FFE9A8",
    borderRadius: 18,
    padding: 14,
  },
  roundTitle: { color: "#523B24", fontSize: 20, fontWeight: "900", textAlign: "center" },
  instruction: { color: "#654C31", fontSize: 15, lineHeight: 21, textAlign: "center", marginTop: 4 },
  directionRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  directionLabel: { color: "#8A4F20", fontSize: 12, fontWeight: "900" },
  directionArrow: { color: "#C76E29", fontSize: 20, fontWeight: "900" },
  slotRow: { justifyContent: "center", alignItems: "stretch", gap: 8, paddingHorizontal: 8 },
  basketTarget: {
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  basketHandle: {
    position: "absolute",
    top: 0,
    width: "58%",
    height: 76,
    borderWidth: 6,
    borderBottomWidth: 0,
    borderColor: "#A96832",
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    opacity: 0.9,
  },
  basketContents: {
    position: "absolute",
    top: 15,
    width: "100%",
    height: 76,
    alignItems: "center",
    justifyContent: "center",
  },
  basketFruit: { textAlign: "center" },
  basketLabel: {
    position: "absolute",
    bottom: 17,
    zIndex: 3,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    textShadowColor: "#70421F",
    textShadowRadius: 3,
  },
  emptyBasketContents: {
    position: "absolute",
    bottom: 23,
    zIndex: 3,
  },
  emptyBasketNumber: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", textShadowColor: "#70421F", textShadowRadius: 3 },
  basketBody: {
    width: "94%",
    height: 76,
    alignItems: "center",
    justifyContent: "space-evenly",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#9A5A2D",
    borderTopWidth: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "#C98443",
    zIndex: 2,
  },
  basketBodyFilled: { backgroundColor: "#B9783E" },
  basketRim: {
    position: "absolute",
    top: 0,
    left: -3,
    right: -3,
    height: 12,
    borderWidth: 3,
    borderColor: "#8C4F27",
    borderRadius: 8,
    backgroundColor: "#DDA05D",
  },
  basketWeaveLine: {
    width: "100%",
    height: 5,
    borderTopWidth: 2,
    borderBottomWidth: 1,
    borderColor: "#A96832",
    backgroundColor: "#D99A56",
  },
  trayTitle: { color: "#523B24", fontSize: 15, fontWeight: "900", marginTop: 2 },
  trayRow: { alignItems: "stretch", justifyContent: "center", gap: 8, paddingHorizontal: 8 },
  fruitTile: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 126,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#F0DFAF",
    paddingVertical: 7,
    paddingHorizontal: 3,
    elevation: 2,
  },
  fruitTileDragging: { opacity: 0.2 },
  dragOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 20,
    elevation: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#F0DFAF",
    paddingVertical: 7,
    paddingHorizontal: 3,
  },
  dragOverlayDropping: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    elevation: 0,
  },
  fruitPlaceholder: { minHeight: 126 },
  fruitEmoji: { textAlign: "center" },
  fruitName: { color: "#523B24", fontSize: 12, fontWeight: "900", textAlign: "center" },
  fruitSize: { color: "#785F42", fontSize: 11, fontWeight: "700", marginTop: 2 },
  feedback: { color: "#654C31", fontSize: 15, fontWeight: "800", textAlign: "center", marginTop: 2 },
  nextButton: {
    minHeight: 48,
    minWidth: 180,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B9E43",
    borderRadius: 12,
    paddingHorizontal: 20,
    marginTop: 2,
  },
  nextButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.72 },
});
