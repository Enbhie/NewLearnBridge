import { useContext } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedLearningSticker, {
  type LearningStickerVariant,
} from "./AnimatedLearningSticker";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import { AppAppearanceContext } from "./CloudBackdrop";

type Props = {
  visible: boolean;
  title: string;
  instruction: string;
  emoji?: string;
  stickerVariant?: LearningStickerVariant;
  onStart: () => void;
  onRequestClose?: () => void;
};

export default function LessonInstructionModal({
  visible,
  title,
  instruction,
  emoji,
  stickerVariant,
  onStart,
  onRequestClose,
}: Props) {
  const { darkMode } = useContext(AppAppearanceContext);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose ?? onStart}
    >
      <SafeAreaView style={styles.backdrop}>
        <View style={[styles.card, darkMode && styles.darkCard]}>
          {stickerVariant ? (
            <AnimatedLearningSticker variant={stickerVariant} size={72} />
          ) : (
            <Text style={styles.emoji}>{emoji ?? ""}</Text>
          )}
          <Text style={[styles.title, darkMode && styles.darkText]}>{title}</Text>
          <Text style={[styles.instruction, darkMode && styles.darkMutedText]}>
            {instruction}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onStart}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonText}>LET&apos;S PLAY!</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(23, 59, 83, 0.58)",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignItems: "center",
    backgroundColor: "#FFF7DD",
    borderColor: "#F4C451",
    borderRadius: 22,
    borderWidth: 2,
    padding: 24,
  },
  darkCard: { backgroundColor: "#303D55", borderColor: "#F4C451" },
  emoji: { fontSize: 54, marginBottom: 8 },
  title: { color: "#173B53", fontSize: 22, fontWeight: "900", textAlign: "center" },
  instruction: {
    color: "#36566A",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
    textAlign: "center",
  },
  darkText: { color: "#E4EAF3" },
  darkMutedText: { color: "#B9C5D8" },
  button: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "#258EA3",
    borderRadius: 13,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  pressed: { opacity: 0.72 },
});
