import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { playFeedback } from "../utils/soundEffects";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import AnimatedLearningSticker, {
  learningStickerVariantForIndex,
} from "./AnimatedLearningSticker";
import StorybookPicture from "./StorybookPicture";

export type GradeTwoMiniGameId =
  | "story-squeeze"
  | "book-explorer"
  | "clue-detective"
  | "emotion-echo"
  | "place-value-rocket"
  | "snack-shop"
  | "array-garden"
  | "measurement-studio"
  | "eco-sorter"
  | "state-changer"
  | "sky-splitter";

type MiniGameDifficulty = "easy" | "standard" | "challenge";

export const gradeTwoMiniGameInfo: Record<
  GradeTwoMiniGameId,
  { title: string; emoji: string; instruction: string }
> = {
  "story-squeeze": {
    title: "Story Squeeze",
    emoji: "📖",
    instruction: "Tap a story bubble, then tap Beginning, Middle, or End to put the events in order.",
  },
  "book-explorer": {
    title: "Book Explorer",
    emoji: "📚",
    instruction: "Explore book clues, put events in order, and match words with related meanings.",
  },
  "clue-detective": {
    title: "Clue Detective",
    emoji: "🔍",
    instruction: "Scan a clue, then file it under WHO or WHERE to solve each little mystery.",
  },
  "emotion-echo": {
    title: "Mystery Word Challenge",
    emoji: "💬",
    instruction: "Match vocabulary, actions, and feelings to the story clues.",
  },
  "place-value-rocket": {
    title: "Place Value Rocket",
    emoji: "🚀",
    instruction: "Fuel the rocket by setting Hundreds, Tens, and Ones to match the target number!",
  },
  "snack-shop": {
    title: "Snack Shop",
    emoji: "🍎",
    instruction: "Count coins and bills to buy healthy snacks at the shop.",
  },
  "array-garden": {
    title: "Array Garden",
    emoji: "🌱",
    instruction: "Plant seeds in rows and columns to practice repeated addition.",
  },
  "measurement-studio": {
    title: "Measurement Studio",
    emoji: "📏",
    instruction: "Measure objects using standard and non-standard units.",
  },
  "eco-sorter": {
    title: "Eco Sorter",
    emoji: "♻️",
    instruction: "Sort materials into proper environmental bins.",
  },
  "state-changer": {
    title: "State Changer",
    emoji: "🧊",
    instruction: "Observe changes in matter when heat is added or removed.",
  },
  "sky-splitter": {
    title: "Sky Splitter",
    emoji: "⚡",
    instruction: "Answer weather and sky questions to power through the clouds.",
  },
};

interface GradeTwoMiniGameProps {
  game: GradeTwoMiniGameId;
  difficulty: MiniGameDifficulty;
  round: 1 | 2 | 3;
  onPassed: () => void;
}

export function GradeTwoMiniGame({ game, difficulty, round, onPassed }: GradeTwoMiniGameProps) {
  if (game === "place-value-rocket") {
    return <PlaceValueRocketGame round={round} onPassed={onPassed} />;
  }

  return <MiniGameChoice game={game} difficulty={difficulty} round={round} onPassed={onPassed} />;
}

type ChoiceMiniGameId = Exclude<GradeTwoMiniGameId, "place-value-rocket">;

type Activity =
  | { type: "sequence"; prompt: string; cards: string[]; order: string[] }
  | { type: "sort"; prompt: string; item: string; categories: string[]; answer: string }
  | { type: "choice"; prompt: string; options: string[]; answer: string }
  | { type: "coins"; item: string; price: number; coins: number[] }
  | { type: "array"; rows: number; columns: number; prompt: string };

const activities: Record<ChoiceMiniGameId, Activity[]> = {
  "story-squeeze": [
    {
      type: "sequence",
      prompt: "Put the seed story in Beginning, Middle, End order.",
      cards: ["A sprout appears.", "Maya waters the seed.", "Maya plants a seed."],
      order: ["Maya plants a seed.", "Maya waters the seed.", "A sprout appears."],
    },
    {
      type: "sequence",
      prompt: "Put Leo's morning in order.",
      cards: ["Leo eats breakfast.", "Leo brushes his teeth.", "Leo wakes up."],
      order: ["Leo wakes up.", "Leo brushes his teeth.", "Leo eats breakfast."],
    },
    {
      type: "sequence",
      prompt: "Put Ben's art project in order.",
      cards: ["Ben colors the picture.", "Ben gets paper.", "Ben draws a dog."],
      order: ["Ben gets paper.", "Ben draws a dog.", "Ben colors the picture."],
    },
  ],
  "book-explorer": [
    { type: "choice", prompt: "Which book part tells the name of the book?", options: ["Title", "Author", "Page number"], answer: "Title" },
    { type: "choice", prompt: "Who writes the words in a book?", options: ["Author", "Illustrator", "Reader"], answer: "Author" },
    { type: "choice", prompt: "Which book part often shows a picture about the story?", options: ["Cover", "Page number", "Index"], answer: "Cover" },
  ],
  "clue-detective": [
    { type: "sort", prompt: "File this clue in the correct folder.", item: "At the beach in the morning", categories: ["File A · Setting", "File B · Character Clues"], answer: "File A · Setting" },
    { type: "sort", prompt: "File this clue in the correct folder.", item: "Mina, a brave young girl", categories: ["File A · Setting", "File B · Character Clues"], answer: "File B · Character Clues" },
    { type: "sort", prompt: "File this clue in the correct folder.", item: "A worried fisherman", categories: ["File A · Setting", "File B · Character Clues"], answer: "File B · Character Clues" },
  ],
  "emotion-echo": [
    { type: "choice", prompt: "A child finds a lost puppy and gently comforts it. What action shows kindness?", options: ["Comforting the puppy", "Walking away", "Shouting loudly"], answer: "Comforting the puppy" },
    { type: "choice", prompt: "Ana's kite gets stuck in a tree. Which word describes how she may feel?", options: ["Disappointed", "Proud", "Sleepy"], answer: "Disappointed" },
    { type: "choice", prompt: "Which word means nearly the same as tiny?", options: ["Small", "Loud", "Late"], answer: "Small" },
  ],
  "snack-shop": [
    { type: "coins", item: "banana cue", price: 30, coins: [10, 20, 50, 100] },
    { type: "coins", item: "juice", price: 70, coins: [10, 20, 50, 100] },
    { type: "coins", item: "rice cake", price: 150, coins: [10, 20, 50, 100] },
  ],
  "array-garden": [
    { type: "array", rows: 2, columns: 3, prompt: "Stamp 2 rows with 3 flowers in each row." },
    { type: "array", rows: 3, columns: 4, prompt: "Stamp 3 rows with 4 flowers in each row." },
    { type: "array", rows: 4, columns: 2, prompt: "Stamp 4 rows with 2 flowers in each row." },
  ],
  "measurement-studio": [
    { type: "choice", prompt: "Which tool measures a pencil's length?", options: ["Ruler", "Clock", "Cup"], answer: "Ruler" },
    { type: "choice", prompt: "Which unit is best for a classroom's length?", options: ["Meters", "Liters", "Pesos"], answer: "Meters" },
    { type: "choice", prompt: "Which tool measures how much water a bottle holds?", options: ["Measuring cup", "Ruler", "Calendar"], answer: "Measuring cup" },
  ],
  "eco-sorter": [
    { type: "sort", prompt: "Sort the item.", item: "Sunflower 🌻", categories: ["Living", "Non-Living"], answer: "Living" },
    { type: "sort", prompt: "Sort the item.", item: "Plastic bottle 🧴", categories: ["Living", "Non-Living"], answer: "Non-Living" },
    { type: "sort", prompt: "Sort the item.", item: "Puppy 🐶", categories: ["Living", "Non-Living"], answer: "Living" },
  ],
  "state-changer": [
    { type: "sort", prompt: "Classify the material.", item: "Ice cube 🧊", categories: ["Solid", "Liquid", "Gas"], answer: "Solid" },
    { type: "sort", prompt: "Classify the material.", item: "Juice 🥤", categories: ["Solid", "Liquid", "Gas"], answer: "Liquid" },
    { type: "sort", prompt: "Classify the material.", item: "Air in a balloon 🎈", categories: ["Solid", "Liquid", "Gas"], answer: "Gas" },
  ],
  "sky-splitter": [
    { type: "sort", prompt: "Place the object in the sky where it is usually seen.", item: "Sun ☀️", categories: ["Day Sky", "Night Sky"], answer: "Day Sky" },
    { type: "sort", prompt: "Place the object in the sky where it is usually seen.", item: "Moon 🌙", categories: ["Day Sky", "Night Sky"], answer: "Night Sky" },
    { type: "sort", prompt: "Place the object in the sky where it is usually seen.", item: "Stars ✨", categories: ["Day Sky", "Night Sky"], answer: "Night Sky" },
    { type: "sort", prompt: "Place the object in the sky where it is usually seen.", item: "Owl 🦉", categories: ["Day Sky", "Night Sky"], answer: "Night Sky" },
    { type: "sort", prompt: "Clouds may appear in the day or night sky. Which answer is correct?", item: "Clouds ☁️", categories: ["Day Sky", "Night Sky", "Both Skies"], answer: "Both Skies" },
  ],
};

function MiniGameChoice({
  game,
  difficulty,
  round,
  onPassed,
}: {
  game: ChoiceMiniGameId;
  difficulty: MiniGameDifficulty;
  round: 1 | 2 | 3;
  onPassed: () => void;
}) {
  const [roundComplete, setRoundComplete] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  const [selectedCoins, setSelectedCoins] = useState<number[]>([]);
  const [plantedCells, setPlantedCells] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const info = gradeTwoMiniGameInfo[game];
  const activity = activities[game][round - 1];

  const completeRound = () => {
    if (roundComplete) return;
    setRoundComplete(true);
    playFeedback("success");
    onPassed();
  };

  const retry = () => {
    playFeedback("error");
    setFeedback("Not quite yet. Try again!");
  };

  const selectAnswer = (answer: string) => {
    if (activity.type === "choice" || activity.type === "sort") {
      if (answer === activity.answer) completeRound();
      else retry();
    }
  };

  const chooseEvent = (event: string) => {
    if (activity.type !== "sequence") return;
    const expected = activity.order[sequence.length];
    if (event !== expected) {
      retry();
      return;
    }
    const updated = [...sequence, event];
    setSequence(updated);
    setFeedback("");
    if (updated.length === activity.order.length) completeRound();
  };

  const addCoin = (coin: number) => {
    if (activity.type !== "coins") return;
    const total = selectedCoins.reduce((sum, value) => sum + value, 0);
    if (total + coin > activity.price) {
      retry();
      return;
    }
    setSelectedCoins((current) => [...current, coin]);
    setFeedback("");
  };

  const checkArray = () => {
    if (activity.type !== "array") return;
    const correctCells = Array.from({ length: 25 }, (_, index) => index).filter(
      (index) => Math.floor(index / 5) < activity.rows && index % 5 < activity.columns
    );
    if (
      plantedCells.length === correctCells.length &&
      correctCells.every((index) => plantedCells.includes(index))
    ) {
      completeRound();
    }
    else retry();
  };

  const toggleSeedCell = (index: number) => {
    setPlantedCells((current) =>
      current.includes(index)
        ? current.filter((cell) => cell !== index)
        : [...current, index]
    );
    setFeedback("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.gameCard}>
        <AnimatedLearningSticker
          variant={learningStickerVariantForIndex(round - 1)}
          size={58}
        />
        <Text style={styles.title}>{info.title}</Text>
        <Text style={styles.difficulty}>Difficulty: {difficulty}</Text>
        <Text style={styles.roundLabel}>
          {round === 1 ? "Start Game" : round === 2 ? "Mid-Quiz Checkpoint" : "Final Bonus Round"}
        </Text>
        <Text style={styles.instruction}>{info.instruction}</Text>
        {activity.type === "sequence" ? (
          <>
            <Text style={styles.challengePrompt}>{activity.prompt}</Text>
            <Text style={styles.subtleText}>Tap events in the correct order</Text>
            {activity.cards.map((event) => (
              <Pressable
                accessibilityRole="button"
                key={event}
                disabled={sequence.includes(event)}
                onPress={() => chooseEvent(event)}
                style={({ pressed }) => [
                  styles.choiceButton,
                  sequence.includes(event) && styles.selectedCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.choiceContent}>
                  <StorybookPicture label={event} size={30} />
                  <Text style={styles.choiceText}>
                    {sequence.includes(event) ? `✓ ${event}` : event}
                  </Text>
                </View>
              </Pressable>
            ))}
            <Text style={styles.subtleText}>
              {["Beginning", "Middle", "End"][sequence.length] ?? "Complete"}
            </Text>
          </>
        ) : activity.type === "sort" ? (
          <>
            <Text style={styles.challengePrompt}>{activity.prompt}</Text>
            <View style={styles.itemCard}><Text style={styles.itemText}>{activity.item}</Text></View>
            {game === "state-changer" ? (
              <StateParticlePose state={activity.answer} />
            ) : null}
            <View style={styles.categoryRow}>
              {activity.categories.map((category) => (
                <Pressable
                  accessibilityRole="button"
                  celebrateOnPress
                  key={category}
                  onPress={() => selectAnswer(category)}
                  style={({ pressed }) => [styles.categoryButton, pressed && styles.pressed]}
                >
                  <View style={styles.choiceContent}>
                    <StorybookPicture
                      label={category}
                      size={28}
                    />
                    <Text style={styles.choiceText}>{category}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : activity.type === "choice" ? (
          <>
            <Text style={styles.challengePrompt}>{activity.prompt}</Text>
            {activity.options.map((option) => (
              <Pressable
                accessibilityRole="button"
                celebrateOnPress
                key={option}
                onPress={() => selectAnswer(option)}
                style={({ pressed }) => [styles.choiceButton, pressed && styles.pressed]}
              >
                <View style={styles.choiceContent}>
                  <StorybookPicture
                    label={option}
                    size={30}
                  />
                  <Text style={styles.choiceText}>{option}</Text>
                </View>
              </Pressable>
            ))}
          </>
        ) : activity.type === "coins" ? (
          <>
            <Text style={styles.challengePrompt}>Pay exactly ₱{activity.price} for the {activity.item}.</Text>
            <Text style={styles.subtleText}>
              Your tray: {selectedCoins.length ? selectedCoins.map((coin) => `₱${coin}`).join(" + ") : "empty"}
              {" = ₱"}{selectedCoins.reduce((sum, coin) => sum + coin, 0)}
            </Text>
            <View style={styles.categoryRow}>
              {activity.coins.map((coin) => (
                <Pressable
                  accessibilityRole="button"
                  celebrateOnPress
                  key={coin}
                  onPress={() => addCoin(coin)}
                  style={({ pressed }) => [styles.coinButton, pressed && styles.pressed]}
                >
                  <View style={styles.choiceContent}>
                    <StorybookPicture
                      label={coin <= 20 ? `₱${coin} coin` : `₱${coin} bill`}
                      size={30}
                    />
                    <Text style={styles.choiceText}>{coin <= 20 ? `₱${coin} coin` : `₱${coin} bill`}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectedCoins((current) => current.slice(0, -1))}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.choiceText}>Remove last coin</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (selectedCoins.reduce((sum, coin) => sum + coin, 0) === activity.price) completeRound();
                else retry();
              }}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>PAY EXACT AMOUNT</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.challengePrompt}>{activity.prompt}</Text>
            <Text style={styles.subtleText}>Tap each soil square to plant the correct array.</Text>
            <View style={styles.flowerGrid}>
              {Array.from({ length: 25 }, (_, index) => {
                const planted = plantedCells.includes(index);
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${planted ? "Remove seed from" : "Plant seed in"} square ${index + 1}`}
                    key={index}
                    onPress={() => toggleSeedCell(index)}
                    style={({ pressed }) => [
                      styles.soilCell,
                      planted && styles.plantedCell,
                      pressed && styles.pressed,
                    ]}
                  >
                    {planted ? (
                      <AnimatedLearningSticker
                        variant={learningStickerVariantForIndex(index)}
                        size={28}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.subtleText}>
              {Array.from({ length: activity.rows }, () => activity.columns).join(" + ")} = {activity.rows * activity.columns}
            </Text>
            <Pressable accessibilityRole="button" onPress={checkArray} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>STAMP GARDEN</Text>
            </Pressable>
          </>
        )}
        {feedback ? <Text accessibilityLiveRegion="polite" style={styles.errorText}>{feedback}</Text> : null}
      </View>
    </View>
  );
}

function StateParticlePose({ state }: { state: string }) {
  const spacingStyle =
    state === "Solid"
      ? styles.solidParticles
      : state === "Liquid"
        ? styles.liquidParticles
        : styles.gasParticles;

  return (
    <View style={styles.particleCard}>
      <Text style={styles.particleHeading}>{state} particle pose</Text>
      <View style={[styles.particleArrangement, spacingStyle]}>
        {Array.from({ length: 6 }, (_, index) => (
          <Text key={index} style={styles.particle}>●</Text>
        ))}
      </View>
    </View>
  );
}

export function PlaceValueRocketGame({
  round,
  onPassed,
}: {
  round: 1 | 2 | 3;
  onPassed: () => void;
}) {
  const targetNumber = round === 1 ? 352 : round === 2 ? 690 : 907;
  const [hundreds, setHundreds] = useState(0);
  const [tens, setTens] = useState(0);
  const [ones, setOnes] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLaunch = () => {
    const total = hundreds * 100 + tens * 10 + ones;
    if (total === targetNumber) {
      playFeedback("success");
      onPassed();
    } else {
      playFeedback("error");
      setErrorMsg(`Current value is ${total}. Try to make ${targetNumber}!`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.rocketTitle}>
        <AnimatedLearningSticker variant="coin" size={48} />
        <Text style={styles.title}>Place Value Rocket</Text>
      </View>
      <Text style={styles.targetHeading}>Fuel the rocket to make:</Text>
      <Text style={styles.targetNumber}>{targetNumber}</Text>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <View style={styles.counterRow}>
        {/* Hundreds Column */}
        <View style={styles.columnBox}>
          <View style={styles.blockRow}>
            {Array.from({ length: Math.min(hundreds, 10) }).map((_, i) => (
              <View key={i} style={styles.blueSquare} />
            ))}
          </View>
          <Text style={styles.countText}>{hundreds}</Text>
          <Text style={styles.labelText}>Hundreds</Text>
          <View style={styles.btnGroup}>
            <Pressable accessibilityRole="button" accessibilityLabel="Add one hundred" style={styles.smallBtn} onPress={() => setHundreds((h) => Math.min(h + 1, 9))}>
              <Text style={styles.btnSymbol}>+</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Remove one hundred" style={styles.smallBtn} onPress={() => setHundreds((h) => Math.max(h - 1, 0))}>
              <Text style={styles.btnSymbol}>-</Text>
            </Pressable>
          </View>
        </View>

        {/* Tens Column */}
        <View style={styles.columnBox}>
          <View style={styles.blockRow}>
            {Array.from({ length: Math.min(tens, 10) }).map((_, i) => (
              <View key={i} style={styles.blueSquare} />
            ))}
          </View>
          <Text style={styles.countText}>{tens}</Text>
          <Text style={styles.labelText}>Tens</Text>
          <View style={styles.btnGroup}>
            <Pressable accessibilityRole="button" accessibilityLabel="Add one ten" style={styles.smallBtn} onPress={() => setTens((t) => Math.min(t + 1, 9))}>
              <Text style={styles.btnSymbol}>+</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Remove one ten" style={styles.smallBtn} onPress={() => setTens((t) => Math.max(t - 1, 0))}>
              <Text style={styles.btnSymbol}>-</Text>
            </Pressable>
          </View>
        </View>

        {/* Ones Column */}
        <View style={styles.columnBox}>
          <View style={styles.blockRow}>
            {Array.from({ length: Math.min(ones, 10) }).map((_, i) => (
              <View key={i} style={styles.blueSquare} />
            ))}
          </View>
          <Text style={styles.countText}>{ones}</Text>
          <Text style={styles.labelText}>Ones</Text>
          <View style={styles.btnGroup}>
            <Pressable accessibilityRole="button" accessibilityLabel="Add one one" style={styles.smallBtn} onPress={() => setOnes((o) => Math.min(o + 1, 9))}>
              <Text style={styles.btnSymbol}>+</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Remove one one" style={styles.smallBtn} onPress={() => setOnes((o) => Math.max(o - 1, 0))}>
              <Text style={styles.btnSymbol}>-</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable accessibilityRole="button" style={styles.launchBtn} onPress={handleLaunch}>
        <Text style={styles.launchBtnText}>LAUNCH ROCKET!</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  gameCard: {
    alignItems: "stretch",
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderColor: "#CDEEF1",
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  instruction: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.8,
  },
  rocketTitle: { alignItems: "center", gap: 8 },
  difficulty: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    textAlign: "center",
  },
  roundLabel: { color: "#258EA3", fontSize: 14, fontWeight: "900", marginBottom: 8, textAlign: "center" },
  challengePrompt: { fontSize: 18, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  subtleText: { color: "#536D79", fontSize: 14, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  itemCard: {
    alignItems: "center",
    backgroundColor: "#FFF7DD",
    borderColor: "#F4C451",
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    marginBottom: 14,
    minHeight: 80,
    padding: 14,
  },
  itemText: { color: "#173B53", fontSize: 20, fontWeight: "900", textAlign: "center" },
  particleCard: { alignItems: "center", backgroundColor: "#F4FBFA", borderRadius: 12, marginBottom: 12, padding: 10 },
  particleHeading: { color: "#36566A", fontSize: 13, fontWeight: "800", marginBottom: 8 },
  particleArrangement: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  solidParticles: { gap: 2, width: 56 },
  liquidParticles: { gap: 8, width: 90 },
  gasParticles: { gap: 20, width: 150 },
  particle: { color: "#258EA3", fontSize: 18 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 8 },
  categoryButton: {
    alignItems: "center",
    backgroundColor: "#DDF5F2",
    borderColor: "#78C7D2",
    borderRadius: 12,
    borderWidth: 1.5,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 12,
  },
  choiceButton: {
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    borderColor: "#38bdf8",
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: 8,
    minHeight: 48,
    paddingHorizontal: 14,
    width: "100%",
  },
  choiceContent: { alignItems: "center", flexDirection: "row", gap: 10 },
  selectedCard: { backgroundColor: "#D5F5EB", borderColor: "#66CBB1" },
  choiceText: { color: "#173B53", fontSize: 15, fontWeight: "700", textAlign: "center" },
  coinButton: {
    alignItems: "center",
    backgroundColor: "#FFF7DD",
    borderColor: "#F4C451",
    borderRadius: 24,
    borderWidth: 2,
    height: 58,
    justifyContent: "center",
    minWidth: 58,
    paddingHorizontal: 10,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#F1F4F5",
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 6,
    minHeight: 42,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#258EA3",
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 48,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  flowerGrid: { alignSelf: "center", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginVertical: 8, maxWidth: 250 },
  soilCell: { alignItems: "center", backgroundColor: "#C9A77A", borderColor: "#FFFFFF", borderRadius: 5, borderWidth: 1, height: 42, justifyContent: "center", margin: 1, width: 42 },
  plantedCell: { backgroundColor: "#BDE7C2" },
  flower: { fontSize: 24 },
  pressed: { opacity: 0.72 },
  targetHeading: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
  targetNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0284c7",
    marginBottom: 15,
  },
  counterRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 25,
    width: "100%",
    justifyContent: "center",
  },
  columnBox: {
    flex: 1,
    backgroundColor: "#e0f2fe",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  blockRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  blueSquare: {
    width: 12,
    height: 12,
    backgroundColor: "#2563eb",
    borderRadius: 2,
  },
  countText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
  labelText: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 8,
  },
  btnGroup: {
    flexDirection: "row",
    gap: 8,
  },
  smallBtn: {
    backgroundColor: "#0284c7",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSymbol: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  launchBtn: {
    backgroundColor: "#f97316",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  launchBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  errorText: {
    color: "#dc2626",
    marginBottom: 10,
    fontWeight: "600",
  },
});

export default GradeTwoMiniGame;