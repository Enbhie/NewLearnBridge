import { StyleSheet, Text, View } from "react-native";

const pictures: Array<[string[], string]> = [
  [["number", "count", "numeral"], "🔢"],
  [["math", "coin", "peso", "price", "money", "add", "addition", "subtract", "subtraction"], "🪙"],
  [["book", "read", "story", "author", "title", "cover", "page", "word", "letter", "english", "language"], "📚"],
  [["science", "plant", "seed", "garden", "flower", "living", "nature", "eco"], "🌱"],
  [["shape", "circle", "square", "triangle", "rectangle"], "🔷"],
  [["crossing", "road", "traffic", "safe"], "🚦"],
  [["house", "home", "builder", "family"], "🏠"],
  [["polite", "please", "thank", "greeting", "talk"], "🗣️"],
  [["helper", "help", "community"], "🦸"],
  [["alphabet", "letter sound", "blend"], "🔤"],
  [["adventure", "adventure", "quest", "mission"], "🗺️"],
  [["exercise", "routine", "body", "move", "sport"], "🏃"],
  [["animal", "dog", "puppy", "cat", "kitten", "pet"], "🐶"],
  [["fish"], "🐟"],
  [["bee"], "🐝"],
  [["bird"], "🐦"],
  [["rabbit"], "🐰"],
  [["mouse"], "🐭"],
  [["snake"], "🐍"],
  [["measuring cup"], "🥤"],
  [["food", "snack", "fruit", "banana", "mango", "apple", "juice", "milk", "rice", "bread"], "🍎"],
  [["school", "classroom", "teacher", "student", "learn", "lesson"], "🏫"],
  [["hospital", "doctor", "nurse", "health", "healthy", "help"], "🩺"],
  [["market", "shop", "store", "buy", "seller"], "🛒"],
  [["beach"], "🏖️"],
  [["ocean", "sea", "water"], "🌊"],
  [["park", "tree", "forest", "outside"], "🌳"],
  [["weather", "rain", "cloud", "storm"], "🌦️"],
  [["sun", "day"], "☀️"],
  [["moon", "night", "sky", "star"], "🌙"],
  [["ruler", "measure", "length", "meter"], "📏"],
  [["clock", "time", "calendar"], "🕒"],
  [["cup", "liquid", "juice"], "🥤"],
  [["solid", "ice", "cold", "freeze"], "🧊"],
  [["gas", "air", "balloon"], "🎈"],
  [["character", "person", "girl", "woman", "mother", "lola", "friend"], "👧"],
  [["boy", "man", "father", "ben", "leo"], "👦"],
  [["kind", "comfort", "care", "feel", "emotion", "happy", "sad"], "💛"],
  [["setting", "place", "where", "home", "house"], "🏠"],
  [["color", "red"], "🔴"],
  [["blue"], "🔵"],
  [["green"], "🟢"],
  [["rocket", "space", "hundred", "tens", "ones"], "🚀"],
  [["music", "sound", "listen", "safari"], "🎵"],
  [["art", "draw", "paint", "picture"], "🎨"],
  [["recycle", "plastic", "trash", "environment"], "♻️"],
];

function pictureFor(label: string, emoji?: string) {
  if (emoji) return emoji;
  const normalized = label.toLowerCase();
  return pictures.find(([words]) =>
    words.some((word) => new RegExp(`\\b${word}\\b`).test(normalized))
  )?.[1] ?? "✨";
}

export default function StorybookPicture({
  label,
  emoji,
  size = 58,
}: {
  label: string;
  emoji?: string;
  size?: number;
}) {
  return (
    <View
      accessibilityLabel={`${label} picture`}
      accessibilityRole="image"
      style={[
        styles.frame,
        { width: size, height: size, borderRadius: size * 0.28 },
      ]}
    >
      <View style={[styles.page, { borderRadius: size * 0.23 }]}>
        <Text style={{ fontSize: size * 0.56, lineHeight: size * 0.72 }}>
          {pictureFor(label, emoji)}
        </Text>
        <View style={[styles.sparkle, { width: size * 0.12, height: size * 0.12 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E9B56E",
    padding: 4,
  },
  page: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#FFF4D6",
    borderWidth: 2,
    borderColor: "#FFE3A6",
  },
  sparkle: {
    position: "absolute",
    right: "15%",
    top: "16%",
    borderRadius: 99,
    backgroundColor: "#FFFFFF",
    opacity: 0.85,
  },
});
