import { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";

const characters = [
  {
    id: "leo",
    emoji: "🧑",
    name: "Kuya Leo",
    meta: "Age 8",
    role: "The helpful big brother",
    description:
      "Leo loves math and always helps out at Lola's store. He's great at counting change!",
    traits: ["Math Whiz", "Shop Helper"],
  },
  {
    id: "bea",
    emoji: "👧",
    name: "Bea",
    meta: "Age 6",
    role: "The curious little sister",
    description:
      "Bea loves asking questions and finding shapes and colors in the world around her.",
    traits: ["Explorer", "Artist"],
  },
  {
    id: "lola",
    emoji: "👵",
    name: "Lola Nena",
    meta: "The guide",
    role: "Owner of the Sari-Sari Store",
    description:
      "Lola Nena runs the neighborhood store and teaches the kids to count and budget.",
    traits: ["Wise", "Kind"],
  },
];

type Props = {
  gradeLabel: string;
  lessonTitle: string;
  onSelect: (characterId: string) => void;
};

export default function CharacterSelectScreen({ gradeLabel, lessonTitle, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>Who's shopping today?</Text>
        <Text style={styles.subtitle}>
          {gradeLabel} · {lessonTitle}
        </Text>
        <Text style={styles.lessonContext}>Pick your character to start this lesson.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {characters.map((character) => {
          const isSelected = selected === character.id;

          return (
            <Pressable
              key={character.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              soundEffect="select"
              onPress={() => setSelected(character.id)}
              style={({ pressed }) => [
                styles.characterCard,
                isSelected && styles.selectedCard,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.emoji}>{character.emoji}</Text>
              <View style={styles.characterCopy}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{character.name}</Text>
                  <Text style={styles.meta}>{character.meta}</Text>
                </View>
                <Text style={styles.role}>{character.role}</Text>
                <Text style={styles.description}>{character.description}</Text>
                <View style={styles.traits}>
                  {character.traits.map((trait) => (
                    <Text style={styles.trait} key={trait}>
                      {trait}
                    </Text>
                  ))}
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !selected }}
          disabled={!selected}
          onPress={() => selected && onSelect(selected)}
          style={({ pressed }) => [
            styles.startButton,
            !selected && styles.disabledButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.startButtonText}>START LESSON</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FFFDF5" },
  titleWrap: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  title: { color: "#4A2F22", fontSize: 28, fontWeight: "900" },
  subtitle: { color: "#6E675D", fontSize: 15, marginTop: 5 },
  lessonContext: { color: "#759B57", fontSize: 14, fontWeight: "700", marginTop: 5 },
  list: { paddingHorizontal: 24, gap: 12, paddingBottom: 20 },
  characterCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#E8E0CF",
    backgroundColor: "#FFFFFF",
  },
  selectedCard: { borderColor: "#759B57", backgroundColor: "#F0F6EA" },
  emoji: { fontSize: 42, marginRight: 14 },
  characterCopy: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { color: "#4A2F22", fontSize: 18, fontWeight: "800" },
  meta: { color: "#6E675D", fontSize: 13 },
  role: { color: "#759B57", fontSize: 13, fontWeight: "700", marginTop: 3 },
  description: { color: "#4A2F22", fontSize: 14, lineHeight: 20, marginTop: 8 },
  traits: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  trait: {
    color: "#4A2F22",
    backgroundColor: "#E4F0DF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "700",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#E8E0CF",
    backgroundColor: "#FFFDF5",
  },
  startButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    borderRadius: 15,
    backgroundColor: "#759B57",
  },
  disabledButton: { backgroundColor: "#B9C3B0" },
  startButtonText: { color: "#FFFDF5", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
