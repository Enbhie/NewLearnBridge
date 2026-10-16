import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";

type PlantChoice = {
  id: string;
  name: string;
  picture: string;
  use: string;
};

type StoryScene = {
  setting: string;
  story: string;
  question: string;
  target: string;
  choices: PlantChoice[];
  success: string;
};

const scenes: StoryScene[] = [
  {
    setting: "A cozy morning",
    story:
      "Mia has a scratchy throat and asks her grown-up for a warm drink. They are choosing something flavorful to add.",
    question: "Which plant is often used to flavor foods and drinks?",
    target: "ginger",
    choices: [
      { id: "ginger", name: "Ginger", picture: "🫚", use: "Adds a warm flavor to foods and drinks." },
      { id: "rose", name: "Rose", picture: "🌹", use: "A flower people grow for its beauty." },
      { id: "cactus", name: "Cactus", picture: "🌵", use: "A plant that stores water in dry places." },
    ],
    success:
      "Ginger is often used in foods and drinks for its flavor. Mia's grown-up decides what is safe and suitable.",
  },
  {
    setting: "A sunny afternoon",
    story:
      "The family is having a picnic. The sun is bright, and they look for a shady place to sit.",
    question: "Which plant can grow tall and give people shade?",
    target: "tree",
    choices: [
      { id: "sunflower", name: "Sunflower", picture: "🌻", use: "A flower that grows toward sunny places." },
      { id: "tree", name: "Tree", picture: "🌳", use: "A tall plant whose leafy branches can make shade." },
      { id: "mint", name: "Mint", picture: "🌿", use: "A leafy herb used to add flavor to food." },
    ],
    success:
      "A leafy tree can make a shady place for the family to enjoy their picnic.",
  },
  {
    setting: "Time for a snack",
    story:
      "After playing, the children are hungry. A grown-up is picking a familiar fruit for their snack.",
    question: "Which plant gives us a long, yellow fruit?",
    target: "banana",
    choices: [
      { id: "fern", name: "Fern", picture: "🌿", use: "A leafy plant often grown in gardens." },
      { id: "banana", name: "Banana plant", picture: "🍌", use: "A plant that grows bananas for people to eat." },
      { id: "daisy", name: "Daisy", picture: "🌼", use: "A flower with a bright center and petals." },
    ],
    success:
      "Bananas grow on banana plants. The family shares a tasty snack and finishes their day together!",
  },
];

type Props = {
  onBack: () => void;
  onFinish: () => void;
};

export default function PlantStoryGame({ onBack, onFinish }: Props) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [chosenPlant, setChosenPlant] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showFinish, setShowFinish] = useState(false);

  const scene = scenes[sceneIndex];
  const correctChoice = scene.choices.find((choice) => choice.id === scene.target);
  const madeCorrectChoice = chosenPlant === scene.target;

  const choosePlant = (choice: PlantChoice) => {
    setChosenPlant(choice.id);
    if (choice.id === scene.target) {
      setFeedback(`${scene.success} ${choice.use}`);
      return;
    }
    setFeedback(
      `${choice.name} ${choice.use.toLowerCase()} Look for the plant that fits this family's need.`
    );
  };

  const continueStory = () => {
    if (!madeCorrectChoice) return;
    if (sceneIndex === scenes.length - 1) {
      setShowFinish(true);
      onFinish();
      return;
    }
    setSceneIndex((current) => current + 1);
    setChosenPlant(null);
    setFeedback("");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.headerIcon}>{showFinish ? "📖" : "🌱"}</Text>
          <Text style={styles.title}>
            {showFinish ? "A Plant-Powered Story!" : "Story Pick-a-Plant"}
          </Text>
          <Text style={styles.subtitle}>
            {showFinish
              ? "You helped the family with three thoughtful plant choices."
              : `Story stop ${sceneIndex + 1} of ${scenes.length} · ${scene.setting}`}
          </Text>
        </View>

        {showFinish ? (
          <View style={styles.card}>
            <Text style={styles.finishIcon}>🎉</Text>
            <Text style={styles.storyText}>
              Mia and her family enjoyed a cozy morning, a shady picnic, and a yummy snack.
              You helped their story grow!
            </Text>
            <View style={styles.plantSummary}>
              {scenes.map((storyScene) => {
                const plant = storyScene.choices.find(
                  (choice) => choice.id === storyScene.target
                );
                return plant ? (
                  <Text style={styles.summaryChip} key={plant.id}>
                    {plant.picture} {plant.name}
                  </Text>
                ) : null;
              })}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>BACK TO LESSON</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.progress}>
              PLANT {sceneIndex + 1} / {scenes.length}
            </Text>
            <Text style={styles.storyText}>{scene.story}</Text>
            <Text style={styles.question}>{scene.question}</Text>
            <View style={styles.choiceList}>
              {scene.choices.map((choice) => {
                const selected = chosenPlant === choice.id;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={choice.id}
                    onPress={() => choosePlant(choice)}
                    style={({ pressed }) => [
                      styles.choiceCard,
                      selected && (madeCorrectChoice ? styles.correctChoice : styles.selectedChoice),
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.choicePicture}>{choice.picture}</Text>
                    <View style={styles.choiceCopy}>
                      <Text style={styles.choiceName}>{choice.name}</Text>
                      <Text style={styles.choiceUse}>{choice.use}</Text>
                    </View>
                    <Text style={styles.choiceArrow}>›</Text>
                  </Pressable>
                );
              })}
            </View>
            {feedback ? (
              <Text
                accessibilityLiveRegion="polite"
                style={[styles.feedback, madeCorrectChoice && styles.feedbackSuccess]}
              >
                {feedback}
              </Text>
            ) : null}
            {madeCorrectChoice ? (
              <Pressable
                accessibilityRole="button"
                onPress={continueStory}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>
                  {sceneIndex === scenes.length - 1 ? "FINISH THE STORY" : "CONTINUE STORY"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}

        <View style={styles.safetyNote}>
          <Text style={styles.safetyIcon}>🛡️</Text>
          <View style={styles.safetyCopy}>
            <Text style={styles.safetyTitle}>Plant safety first</Text>
            <Text style={styles.safetyText}>
              This is a pretend story, not health advice. Plants do not replace care from a grown-up or doctor. Never taste or touch an unknown plant, or use a plant as medicine. Explore real plants only with a trusted adult.
            </Text>
          </View>
        </View>
        {!showFinish && correctChoice ? (
          <Text style={styles.thinkPrompt}>
            Grown-up tip: Invite your child to explain why they picked a plant.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#EAF5F7" },
  content: { padding: 18, paddingBottom: 28 },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: "#C62828",
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  backButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  header: { alignItems: "center", marginBottom: 14 },
  headerIcon: { fontSize: 44, marginBottom: 4 },
  title: { color: "#173B53", fontSize: 27, fontWeight: "900", textAlign: "center" },
  subtitle: { color: "#36566A", fontSize: 15, textAlign: "center", marginTop: 5 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#24546A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  progress: {
    alignSelf: "center",
    color: "#397147",
    backgroundColor: "#D5F5EB",
    borderRadius: 14,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 12,
  },
  storyText: { color: "#36566A", fontSize: 17, lineHeight: 25, textAlign: "center" },
  question: {
    color: "#173B53",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 18,
    marginBottom: 12,
  },
  choiceList: { gap: 9 },
  choiceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5FAF8",
    borderColor: "#D5E6DF",
    borderWidth: 2,
    borderRadius: 16,
    padding: 12,
  },
  selectedChoice: { borderColor: "#E4A44A", backgroundColor: "#FFF8E7" },
  correctChoice: { borderColor: "#57A878", backgroundColor: "#E8F8EC" },
  choicePicture: { fontSize: 36, width: 52, textAlign: "center", marginRight: 10 },
  choiceCopy: { flex: 1 },
  choiceName: { color: "#173B53", fontSize: 16, fontWeight: "900" },
  choiceUse: { color: "#526778", fontSize: 13, lineHeight: 18, marginTop: 3 },
  choiceArrow: { color: "#258EA3", fontSize: 29, fontWeight: "800", marginLeft: 8 },
  feedback: {
    color: "#82541A",
    backgroundColor: "#FFF3D6",
    borderRadius: 13,
    padding: 12,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    marginTop: 12,
  },
  feedbackSuccess: { color: "#28543A", backgroundColor: "#E8F8EC" },
  primaryButton: {
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#397147",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  safetyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF3D6",
    borderColor: "#F0D28D",
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    marginTop: 14,
  },
  safetyIcon: { fontSize: 24, marginRight: 9 },
  safetyCopy: { flex: 1 },
  safetyTitle: { color: "#704B15", fontSize: 14, fontWeight: "900", marginBottom: 3 },
  safetyText: { color: "#674F2D", fontSize: 13, lineHeight: 19 },
  thinkPrompt: { color: "#526778", fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 10 },
  finishIcon: { fontSize: 56, textAlign: "center", marginBottom: 10 },
  plantSummary: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 16 },
  summaryChip: {
    color: "#28543A",
    backgroundColor: "#D5F5EB",
    borderRadius: 16,
    overflow: "hidden",
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "800",
  },
  pressed: { opacity: 0.75 },
});
