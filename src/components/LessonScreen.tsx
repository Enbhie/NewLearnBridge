import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";

type Item = {
  id: string;
  emoji: string;
  name: string;
  price: number;
};

const items: Item[] = [
  { id: "royal", emoji: "🥤", name: "Royal", price: 7 },
  { id: "candy", emoji: "🍭", name: "Candy", price: 3 },
  { id: "cookies", emoji: "🍪", name: "Cookies", price: 5 },
];

type Props = {
  onBack: () => void;
  onContinue: () => void;
};

export default function LessonScreen({ onBack, onContinue }: Props) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={styles.progressValue} />
        </View>
        <Text style={styles.hearts}>❤️❤️❤️</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Grade 1, Lesson 1</Text>
          </View>
          <Text style={styles.bannerTitle}>Counting Change</Text>
        </View>

        <View style={styles.storeStrip}>
          <View style={styles.storeTag}>
            <Text style={styles.storeTagText}>SARI-SARI STORE</Text>
          </View>
          <View style={styles.storeRow}>
            <View style={styles.storeStall}>
              <Text style={styles.storeEmoji}>🏪</Text>
            </View>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>Let's count ₱10!</Text>
            </View>
            <View style={styles.storeFriends}>
              <Text style={styles.owlFriend}>🦉</Text>
              <Text style={styles.personEmoji}>🧒</Text>
            </View>
          </View>
        </View>

        <View style={styles.rememberCard}>
          <View style={styles.rememberHeader}>
            <Text style={styles.lightbulb}>💡</Text>
            <Text style={styles.sectionTitle}>Remember This</Text>
          </View>
          <Text style={styles.mutedText}>
            If you buy something for ₱7 and pay with ₱10, your change is:
          </Text>
          <View style={styles.equationBox}>
            <Text style={styles.equation}>₱10 − ₱7 = ₱3</Text>
          </View>
        </View>

        <Text style={styles.itemsTitle}>Items in the Store:</Text>
        <View style={styles.itemsRow}>
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.priceTag,
                index === 0 ? styles.priceTagBlue : index === 1 ? styles.priceTagCoral : styles.priceTagYellow,
              ]}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₱{item.price}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={onContinue}
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
        >
          <Text style={styles.continueText}>CONTINUE</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3FBFC" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#9DD8E1",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 18, color: "#4A2F22" },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#CDEEF1",
    overflow: "hidden",
  },
  progressValue: { width: "25%", height: "100%", backgroundColor: "#F17D65" },
  hearts: { fontSize: 14 },
  body: { padding: 20, paddingBottom: 24 },
  banner: { backgroundColor: "#258EA3", borderRadius: 22, padding: 20, borderBottomWidth: 7, borderBottomColor: "#F4C451" },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: "#FFE181",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  pillText: { color: "#173B53", fontSize: 13, fontWeight: "800" },
  bannerTitle: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", marginTop: 8 },
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
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  speechText: { color: "#173B53", fontSize: 14, fontWeight: "900", textAlign: "center" },
  storeFriends: { alignItems: "center" },
  owlFriend: { fontSize: 36 },
  personEmoji: { fontSize: 34, marginTop: -8 },
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
});
