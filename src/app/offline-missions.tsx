
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const missions = [
  {
    title: "Shape Recognition",
    description: "Identify circles, squares, and triangles using AI.",
    emoji: "🔺",
    color: "#E9DDFC",
    label: "AI MISSION",
    route: "/shape-recognition",
  },
  {
    title: "Counting Challenge",
    description: "Practice counting numbers and objects.",
    emoji: "🔢",
    color: "#FFF0CF",
    label: "MATH MISSION",
  },
  {
    title: "Alphabet Adventure",
    description: "Explore letters and practice the alphabet.",
    emoji: "🔤",
    color: "#DDF3E6",
    label: "READING MISSION",
  },
  {
    title: "Color Quest",
    description: "Learn colors and match colorful objects.",
    emoji: "🎨",
    color: "#FCE0E5",
    label: "COLOR MISSION",
  },
];

export default function OfflineMissionsScreen() {
  const router = useRouter();

  function openMission(mission: (typeof missions)[number]) {
    if (mission.route) {
      router.push(mission.route as "/shape-recognition");
    } else {
      Alert.alert(
        mission.title,
        "This mission is coming soon!"
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.heading}>OFFLINE MISSIONS</Text>
        <Text style={styles.subtitle}>
          Choose a mission and start learning!
        </Text>

        {missions.map((mission) => (
          <TouchableOpacity
            key={mission.title}
            style={[
              styles.card,
              { backgroundColor: mission.color },
            ]}
            onPress={() => openMission(mission)}
            activeOpacity={0.8}
          >
            <View style={styles.emojiBox}>
              <Text style={styles.emoji}>{mission.emoji}</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.label}>{mission.label}</Text>
              <Text style={styles.cardTitle}>
                {mission.title}
              </Text>
              <Text style={styles.description}>
                {mission.description}
              </Text>
              <Text style={styles.playText}>
                PLAY MISSION →
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F3FF",
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#65439A",
  },
  heading: {
    fontSize: 28,
    fontWeight: "900",
    color: "#54358A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#776A8C",
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    elevation: 2,
  },
  emojiBox: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 46,
  },
  cardContent: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: "#776A8C",
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#34244D",
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: "#5F536E",
    lineHeight: 19,
    marginBottom: 10,
  },
  playText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#65439A",
  },
});