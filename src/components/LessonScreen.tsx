import { useContext, useEffect, useRef, useState } from "react";
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { categoryMeta, lessonContent, type CategoryId } from "../data/learningContent";
import { gradeLabels } from "../data/offlineMissions";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import AnimatedLearningSticker from "./AnimatedLearningSticker";
import { AppAppearanceContext } from "./CloudBackdrop";
import LessonInstructionModal from "./LessonInstructionModal";

type Props = {
  category: CategoryId;
  onBack: () => void;
  onContinue: () => void;
};

function FloatingEmoji({ emoji, style }: { emoji: string; style?: object }) {
  const offset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(offset, { toValue: -6, duration: 700, useNativeDriver: true }),
        Animated.timing(offset, { toValue: 6, duration: 700, useNativeDriver: true }),
        Animated.timing(offset, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    return () => offset.stopAnimation();
  }, [offset]);

  return <Animated.Text style={[style, { transform: [{ translateY: offset }] }]}>{emoji}</Animated.Text>;
}

export default function LessonScreen({ category, onBack, onContinue }: Props) {
  const { darkMode } = useContext(AppAppearanceContext);
  const [lessonStarted, setLessonStarted] = useState(false);
  const content = lessonContent[category];
  const meta = categoryMeta[category];
  const gradeLabel = content.grade === "K" ? gradeLabels.K : gradeLabels[content.grade];

  return (
    <SafeAreaView style={[styles.screen, darkMode && styles.darkScreen]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={[styles.progressTrack, darkMode && styles.darkTrack]}>
          <View style={styles.progressValue} />
        </View>
        <Text style={styles.hearts}>❤️❤️❤️</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={[styles.banner, darkMode && styles.darkBanner]}>
          <View style={styles.pill}>
            <Text style={[styles.pillText, darkMode && styles.darkText]}>{gradeLabel} · Lesson 1</Text>
          </View>
          <Text style={styles.bannerTitle}>{content.title}</Text>
          <AnimatedLearningSticker
            variant="owl"
            size={76}
            style={styles.bannerSticker}
          />
        </View>

        <View style={[styles.storeStrip, darkMode && styles.darkCard]}>
          <View style={styles.storeTag}>
            <Text style={styles.storeTagText}>{content.theme}</Text>
          </View>
          <View style={styles.storeRow}>
            <View style={styles.storeStall}>
              <FloatingEmoji emoji={content.items[0]?.emoji ?? meta.emoji} style={styles.storeEmoji} />
            </View>
            <View style={[styles.speechBubble, darkMode && styles.darkInnerCard]}>
              <Text style={[styles.speechText, darkMode && styles.darkText]}>{content.storyLine}</Text>
            </View>
            <View style={styles.storeFriends}>
              <AnimatedLearningSticker variant="owl" size={48} />
              <AnimatedLearningSticker variant="plant" size={36} />
            </View>
          </View>
        </View>

        <View style={[styles.rememberCard, darkMode && styles.darkCard]}>
          <View style={styles.rememberHeader}>
            <FloatingEmoji emoji="💡" style={styles.lightbulb} />
            <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>{content.rememberTitle}</Text>
          </View>
          <Text style={[styles.mutedText, darkMode && styles.darkMutedText]}>{content.rememberText}</Text>
          <View style={[styles.equationBox, darkMode && styles.darkInnerCard]}>
            <Text style={[styles.equation, darkMode && styles.darkText]}>{content.equation}</Text>
          </View>
        </View>

        <Text style={[styles.itemsTitle, darkMode && styles.darkText]}>Key ideas:</Text>
        <View style={styles.itemsRow}>
          {content.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.priceTag,
                index === 0 ? styles.priceTagBlue : index === 1 ? styles.priceTagCoral : styles.priceTagYellow,
              ]}
            >
              <FloatingEmoji emoji={item.emoji} style={styles.itemEmoji} />
              <Text style={[styles.itemName, darkMode && styles.darkText]}>{item.name}</Text>
              {item.price !== undefined ? (
                <Text style={styles.itemPrice}>₱{item.price}</Text>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, darkMode && styles.darkFooter]}>
        <Pressable
          accessibilityRole="button"
          soundEffect="open"
          onPress={onContinue}
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
        >
          <Text style={styles.continueText}>CONTINUE</Text>
        </Pressable>
      </View>
      <LessonInstructionModal
        visible={!lessonStarted}
        title={content.title}
        instruction="Read the lesson, then tap Continue to start the quiz."
        emoji={meta.emoji}
        onStart={() => setLessonStarted(true)}
        onRequestClose={onBack}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  backButton: {
    minWidth: 64,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#C62828",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  backText: { fontSize: 14, color: "#FFFFFF", fontWeight: "800" },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#CDEEF1",
    overflow: "hidden",
  },
  progressValue: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F17D65",
  },
  hearts: { fontSize: 14 },
  body: { padding: 20, paddingBottom: 24 },
  banner: { backgroundColor: "#258EA3", borderRadius: 22, padding: 20, paddingRight: 84, borderBottomWidth: 7, borderBottomColor: "#F4C451", overflow: "hidden" },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: "#FFE181",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  pillText: { color: "#173B53", fontSize: 13, fontWeight: "800" },
  bannerTitle: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", marginTop: 8 },
  bannerSticker: { position: "absolute", right: 8, bottom: 4 },
  storeStrip: {
    backgroundColor: "#B8EDF3",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#78C7D2",
    padding: 18,
    marginTop: 12,
  },
  storeTag: {
    alignSelf: "flex-start",
    backgroundColor: "#315C4A",
    borderRadius: 7,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  storeTagText: { color: "#FFFDF5", fontSize: 11, fontWeight: "800" },
  storeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  storeStall: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#FFE181",
    alignItems: "center",
    justifyContent: "center",
  },
  storeEmoji: { fontSize: 44 },
  speechBubble: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  speechText: { color: "#173B53", fontSize: 14, lineHeight: 19, fontWeight: "900", textAlign: "center" },
  storeFriends: { alignItems: "center" },
  rememberCard: {
    backgroundColor: "#FFEAA4",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#F4C451",
    padding: 18,
    marginTop: 12,
  },
  rememberHeader: { flexDirection: "row", alignItems: "center" },
  lightbulb: { fontSize: 18, marginRight: 8 },
  sectionTitle: { color: "#173B53", fontSize: 19, fontWeight: "900" },
  mutedText: { color: "#36566A", fontSize: 15, lineHeight: 22, marginTop: 6 },
  equationBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#F17D65",
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  equation: { color: "#173B53", fontSize: 24, fontWeight: "900" },
  itemsTitle: { color: "#173B53", fontSize: 19, fontWeight: "900", marginTop: 20, marginBottom: 10 },
  itemsRow: { flexDirection: "row", gap: 8 },
  priceTag: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  priceTagBlue: { backgroundColor: "#C9F0F3" },
  priceTagCoral: { backgroundColor: "#FFDCCF" },
  priceTagYellow: { backgroundColor: "#FFEAA4" },
  itemEmoji: { fontSize: 28 },
  itemName: { color: "#173B53", fontSize: 14, fontWeight: "800", marginTop: 4 },
  itemPrice: { color: "#C64F39", fontSize: 18, fontWeight: "900", marginTop: 2 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: "#CDEEF1", backgroundColor: "#FFFFFF" },
  continueButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    borderRadius: 15,
    backgroundColor: "#F17D65",
  },
  continueText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  pressed: { opacity: 0.7 },
  darkScreen: { backgroundColor: "rgba(18, 29, 50, 0.32)" },
  darkBanner: { backgroundColor: "#425E76", borderBottomColor: "#9B8C65" },
  darkCard: { backgroundColor: "#303D55", borderColor: "#465671" },
  darkInnerCard: { backgroundColor: "#29364D", borderColor: "#54647D" },
  darkTrack: { backgroundColor: "#46546A" },
  darkFooter: { backgroundColor: "#202B40", borderTopColor: "#35445F" },
  darkText: { color: "#E4EAF3" },
  darkMutedText: { color: "#B9C5D8" },
});
