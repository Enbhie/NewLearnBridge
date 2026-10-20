import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import AlphabetWordGame from "./AlphabetWordGame";
import FruitGroupingGame from "./FruitGroupingGame";
import PlantStoryGame from "./PlantStoryGame";
import type { CategoryId } from "../data/learningContent";

type Lesson = {
  title: string;
  description: string;
  activity: string;
};

type LessonGroup = {
  subject: string;
  icon: string;
  lessons: Lesson[];
};

function getCategoryForSubject(subject: string): CategoryId {
  if (subject === "Math") return "math";
  if (subject === "Reading Comprehension") return "reading";
  return "science";
}

const lessonGroups: LessonGroup[] = [
  {
    subject: "Science",
    icon: "\u{1F331}",
    lessons: [
      {
        title: "Common plants",
        description: "Notice the plants growing around you, such as trees, flowers, and vegetables.",
        activity: "Look outside or around your home and name three plants you recognize.",
      },
      {
        title: "Parts of a plant",
        description: "Plants have parts such as roots, stems, leaves, flowers, and fruits.",
        activity: "Point to the roots, stem, and leaves of a plant or picture.",
      },
      {
        title: "Classification of common plants",
        description: "Plants can be grouped by how they look, where they grow, or what they provide.",
        activity: "Sort plant pictures into groups such as trees, flowers, and vegetables.",
      },
      {
        title: "Uses of plants",
        description: "People use plants for food, shade, materials, and decoration.",
        activity: "Name a plant-based food and another useful thing that comes from a plant.",
      },
      {
        title: "Caring for plants",
        description: "Plants need care, including water, sunlight, and a safe place to grow.",
        activity: "Help water a plant and describe what it needs to stay healthy.",
      },
      {
        title: "Weather",
        description: "Weather can be sunny, cloudy, rainy, or windy and can change from day to day.",
        activity: "Look at the sky and choose clothes or an activity that suits today's weather.",
      },
      {
        title: "Properties of objects",
        description: "Objects can be described by properties such as color, shape, size, texture, and material.",
        activity: "Choose two safe objects and tell one way they are alike and one way they differ.",
      },
      {
        title: "Common animals",
        description: "Animals live in our homes, communities, farms, and natural surroundings.",
        activity: "Name three animals you have seen and describe where you saw them.",
      },
      {
        title: "Parts of an animal",
        description: "Animals have body parts that help them move, find food, and stay safe.",
        activity: "Look at an animal picture and point out its head, body, and limbs.",
      },
      {
        title: "Classification of common animals",
        description: "Animals can be grouped by features such as how they move or where they live.",
        activity: "Sort animal pictures into groups such as animals that fly, swim, or walk.",
      },
      {
        title: "Habitats",
        description: "A habitat is a place where an animal finds food, water, and shelter.",
        activity: "Match familiar animals to places where they live, such as a nest, pond, or farm.",
      },
      {
        title: "Animals and their young",
        description: "Many animals care for their young, and young animals grow into adults.",
        activity: "Match a familiar animal with its young, such as a hen and chick.",
      },
      {
        title: "How animals help us",
        description: "Animals can help people in different ways, including companionship, food, and work.",
        activity: "Name an animal and explain one kind way it helps people.",
      },
      {
        title: "Caring for animals",
        description: "Animals need kind treatment, appropriate food and water, and safe shelter.",
        activity: "Describe one safe and gentle way to care for a pet or animal.",
      },
    ],
  },
  {
    subject: "Reading Comprehension",
    icon: "\u{1F4D6}",
    lessons: [
      {
        title: "Alphabet: letter names, sounds, and blending",
        description: "Recognize letters, say their sounds, and blend familiar sounds to read simple words.",
        activity: "Drag letters into place to build cat, sun, and dog, then listen and say each word.",
      },
      {
        title: "Communication tools and technology",
        description: "People use different tools and technologies to share information and communicate.",
        activity: "Name a communication tool and explain how people use it safely to share a message.",
      },
      {
        title: "Personal experiences",
        description: "Stories about personal experiences tell what happened and how someone felt.",
        activity: "Tell a short story about something you did, including what happened first and next.",
      },
      {
        title: "Polite greetings and courteous expressions",
        description: "Friendly greetings and courteous words help us show respect to others.",
        activity: "Practice greeting someone and using a polite expression in a short conversation.",
      },
      {
        title: "Participating in conversations about familiar events",
        description: "Good conversations include listening, taking turns, and sharing ideas about familiar events.",
        activity: "Talk about a familiar event and ask or answer a question about it.",
      },
    ],
  },
  {
    subject: "Math",
    icon: "\u{1F522}",
    lessons: [
      {
        title: "Grouping and ungrouping sets",
        description: "Objects can be put together into groups and separated into smaller groups.",
        activity: "Play three fruit-sorting games. Compare fruit sizes and put them in order from smallest to largest.",
      },
      {
        title: "Telling time",
        description: "Daily routines happen at different times, and clocks help us talk about time.",
        activity: "Name something you do in the morning, afternoon, and evening.",
      },
      {
        title: "One-to-one correspondence",
        description: "Counting one object at a time helps us find how many objects are in a set.",
        activity: "Touch each object once as you count a small group of objects.",
      },
      {
        title: "Numbers: names, quantities, and symbols",
        description: "Number words and written numerals represent how many objects are in a group.",
        activity: "Count a small group of objects, say the number, and find its numeral.",
      },
      {
        title: "Putting together and taking away",
        description: "Putting groups together and taking some away can help us solve simple number stories.",
        activity: "Use objects to show a small group joined by more objects, then take some away and recount.",
      },
      {
        title: "Estimating more, less, and greater or less than",
        description: "We can compare groups and make a thoughtful guess about which has more or less.",
        activity: "Look at two small groups, guess which has more, then count to check.",
      },
      {
        title: "Matching numerals to concrete objects",
        description: "A numeral can be matched to a group containing the same number of objects.",
        activity: "Choose a numeral card and make a matching set using safe objects around you.",
      },
      {
        title: "Visual representations: pictographs, pictures, and illustrations",
        description: "Pictures and simple pictographs help us show and understand information.",
        activity: "Make a small picture chart of favorite fruits and count the pictures in each group.",
      },
    ],
  },
];

type Props = {
  onBack: () => void;
  onMusicCategoryChange: (category: CategoryId | null) => void;
  screenTimeLimitMinutes: number;
  completedLessonIds: string[];
  lessonProgressReady: boolean;
  onCompleteLesson: (lessonId: string) => void;
};

export const kindergartenLessonCount = lessonGroups.reduce(
  (count, group) => count + group.lessons.length,
  0
);

function getLessonProgressId(subject: string, title: string): string {
  return `kindergarten:${subject}:${title}`;
}

export default function KindergartenLessonsScreen({
  onBack,
  onMusicCategoryChange,
  screenTimeLimitMinutes,
  completedLessonIds,
  lessonProgressReady,
  onCompleteLesson,
}: Props) {
  const [selectedGroup, setSelectedGroup] = useState<LessonGroup | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [fruitGameStarted, setFruitGameStarted] = useState(false);
  const [plantStoryStarted, setPlantStoryStarted] = useState(false);
  const activeGroup = lessonGroups.find(
    (group) => group.subject === selectedGroup?.subject
  );
  const selectedLessonIndex = activeGroup?.lessons.findIndex(
    (lesson) => lesson.title === selectedLesson?.title
  ) ?? -1;
  const selectedLessonId = selectedLesson && activeGroup
    ? getLessonProgressId(activeGroup.subject, selectedLesson.title)
    : null;
  const selectedLessonLocked =
    !lessonProgressReady ||
    (selectedLessonIndex > 0 &&
      Boolean(activeGroup?.lessons
        .slice(0, selectedLessonIndex)
        .find((lesson) => !completedLessonIds.includes(
          getLessonProgressId(activeGroup.subject, lesson.title)
        ))));
  const previousIncompleteLesson = selectedLessonLocked && activeGroup
    ? activeGroup.lessons
      .slice(0, selectedLessonIndex)
      .find((lesson) => !completedLessonIds.includes(
        getLessonProgressId(activeGroup.subject, lesson.title)
      ))
    : undefined;
  const isSelectedLessonComplete = Boolean(
    selectedLessonId && completedLessonIds.includes(selectedLessonId)
  );

  const handleBack = () => {
    if (fruitGameStarted) {
      setFruitGameStarted(false);
    } else if (plantStoryStarted) {
      setPlantStoryStarted(false);
    } else if (selectedLesson) {
      setSelectedLesson(null);
    } else if (selectedGroup) {
      setSelectedGroup(null);
      onMusicCategoryChange(null);
    } else {
      onMusicCategoryChange(null);
      onBack();
    }
  };

  if (
    selectedLesson?.title.startsWith("Alphabet:") &&
    selectedLessonIndex >= 0 &&
    !selectedLessonLocked
  ) {
    return (
      <AlphabetWordGame
        onBack={() => setSelectedLesson(null)}
        onFinish={() => {
          if (selectedLessonId) onCompleteLesson(selectedLessonId);
          setSelectedLesson(null);
        }}
      />
    );
  }

  if (fruitGameStarted) {
    return (
      <FruitGroupingGame
        onBack={() => setFruitGameStarted(false)}
        onFinish={() => {
          if (selectedLessonId) onCompleteLesson(selectedLessonId);
          setFruitGameStarted(false);
        }}
      />
    );
  }

  if (plantStoryStarted) {
    return (
      <PlantStoryGame
        onBack={() => setPlantStoryStarted(false)}
        onFinish={() => {
          if (selectedLessonId) onCompleteLesson(selectedLessonId);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.headerIcon}>
            {selectedLesson
              ? getLessonIcon(selectedLesson.title)
              : activeGroup?.icon ?? "\u{1F308}"}
          </Text>
          <Text style={styles.title}>
            {selectedLesson
              ? selectedLesson.title
              : activeGroup?.subject ?? "Choose an adventure"}
          </Text>
          <Text style={styles.subtitle}>
            {selectedLesson
              ? "Learn together, then try the activity."
              : activeGroup
                ? "Pick any step on your learning trail!"
                : "Pick any category to start learning!"}
          </Text>
        </View>

        {selectedLesson ? (
          <View style={styles.detailCard}>
            <Text style={styles.lessonIllustration}>
              {getLessonIcon(selectedLesson.title)}
            </Text>
            <Text style={styles.sectionTitle}>Let&apos;s learn</Text>
            <Text style={styles.description}>{selectedLesson.description}</Text>
            <Text style={styles.sectionTitle}>Try it together</Text>
            <Text style={styles.description}>{selectedLesson.activity}</Text>
            {selectedLessonLocked ? (
              <View style={styles.lockedNotice}>
                <Text style={styles.lockedNoticeTitle}>🔒 Lesson locked</Text>
                <Text style={styles.lockedNoticeText}>
                  {!lessonProgressReady
                    ? "Checking saved lesson progress. You can still read this preview."
                    : `Finish "${previousIncompleteLesson?.title}" first to unlock this activity. You can still read this preview.`}
                </Text>
              </View>
            ) : null}
            {!selectedLessonLocked && selectedLesson.title === "Grouping and ungrouping sets" ? (
              screenTimeLimitMinutes > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setFruitGameStarted(true)}
                  style={({ pressed }) => [styles.startGameButton, pressed && styles.pressed]}
                >
                  <Text style={styles.startGameButtonText}>PLAY FRUIT SORTING GAME</Text>
                </Pressable>
              ) : (
                <Text style={styles.screenTimeNotice}>
                  Ask a parent to set a daily screen-time limit in Account Settings to unlock this game.
                </Text>
              )
            ) : null}
            {!selectedLessonLocked && selectedLesson.title === "Common plants" ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setPlantStoryStarted(true)}
                style={({ pressed }) => [styles.startGameButton, pressed && styles.pressed]}
              >
                <Text style={styles.startGameButtonText}>PLAY STORY PICK-A-PLANT</Text>
              </Pressable>
            ) : null}
            {!selectedLessonLocked &&
            !selectedLesson.title.startsWith("Alphabet:") &&
            selectedLesson.title !== "Grouping and ungrouping sets" &&
            selectedLesson.title !== "Common plants" ? (
              <Pressable
                accessibilityRole="button"
                disabled={isSelectedLessonComplete}
                onPress={() => {
                  if (selectedLessonId) onCompleteLesson(selectedLessonId);
                }}
                style={({ pressed }) => [
                  styles.startGameButton,
                  isSelectedLessonComplete && styles.completeButton,
                  pressed && !isSelectedLessonComplete && styles.pressed,
                ]}
              >
                <Text style={styles.startGameButtonText}>
                  {isSelectedLessonComplete ? "LESSON COMPLETED ✓" : "I FINISHED THIS LESSON"}
                </Text>
              </Pressable>
            ) : null}
            {isSelectedLessonComplete ? (
              <Text style={styles.completedNotice}>This lesson is complete. You can revisit it anytime.</Text>
            ) : null}
            <Text style={styles.note}>
              An adult can help with reading and make sure any activity is safe.
            </Text>
          </View>
        ) : activeGroup ? (
          <View style={styles.roadmap}>
            <View style={styles.roadmapStart}>
              <Text style={styles.roadmapStartIcon}>{"\u{1F6A9}"}</Text>
              <Text style={styles.roadmapStartText}>Your learning trail</Text>
            </View>
            {activeGroup.lessons.map((lesson, index) => {
              const lessonId = getLessonProgressId(activeGroup.subject, lesson.title);
              const isComplete = completedLessonIds.includes(lessonId);
              const isLocked =
                !lessonProgressReady ||
                activeGroup.lessons
                  .slice(0, index)
                  .some((previousLesson) =>
                    !completedLessonIds.includes(
                      getLessonProgressId(activeGroup.subject, previousLesson.title)
                    )
                  );
              return (
              <View style={styles.roadmapStep} key={lesson.title}>
                <View style={styles.roadmapRail}>
                  <View style={[
                    styles.stepNumber,
                    index === 0 && styles.firstStepNumber,
                    isComplete && styles.completeStepNumber,
                    isLocked && styles.lockedStepNumber,
                  ]}>
                    <Text style={styles.stepNumberText}>{isComplete ? "✓" : index + 1}</Text>
                  </View>
                  {index < activeGroup.lessons.length - 1 && (
                    <View style={styles.roadmapConnector} />
                  )}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${isLocked ? "Preview locked" : isComplete ? "Review completed" : "Open"} lesson ${index + 1}: ${lesson.title}`}
                  onPress={() => {
                    setSelectedLesson(lesson);
                    onMusicCategoryChange(getCategoryForSubject(activeGroup.subject));
                  }}
                  style={({ pressed }) => [
                    styles.roadmapCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.roadmapIcon}>
                    {getLessonIcon(lesson.title)}
                  </Text>
                  <View style={styles.roadmapCopy}>
                    <Text style={styles.stepLabel}>
                      {isComplete ? "COMPLETED" : !lessonProgressReady ? "LOADING" : isLocked ? "LOCKED · PREVIEW" : "READY"}
                    </Text>
                    <Text style={styles.roadmapTitle}>{lesson.title}</Text>
                  </View>
                  <Text style={styles.roadmapArrow}>{isLocked ? "🔒" : "›"}</Text>
                </Pressable>
              </View>
              );
            })}
            <View style={styles.roadmapFinish}>
              <Text style={styles.roadmapStartIcon}>{"\u{1F3C6}"}</Text>
              <Text style={styles.roadmapStartText}>You did it!</Text>
            </View>
          </View>
        ) : (
          <View style={styles.categoryGrid}>
            {lessonGroups.map((group) => (
              <Pressable
                key={group.subject}
                accessibilityRole="button"
                accessibilityLabel={`Open ${group.subject}, ${group.lessons.length} lessons`}
                onPress={() => {
                  setSelectedGroup(group);
                  onMusicCategoryChange(getCategoryForSubject(group.subject));
                }}
                style={({ pressed }) => [
                  styles.categoryCard,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.categoryIcon}>{group.icon}</Text>
                <Text style={styles.categoryTitle}>{group.subject}</Text>
                <View style={styles.categoryFooter}>
                  <Text style={styles.lessonCount}>
                    {group.lessons.length} {group.lessons.length === 1 ? "lesson" : "lessons"}
                  </Text>
                  <Text style={styles.categoryArrow}>{"\u{2192}"}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getLessonIcon(title: string): string {
  const normalized = title.toLowerCase();
  if (normalized.includes("plant")) return "\u{1F331}";
  if (normalized.includes("weather")) return "\u{1F326}\u{FE0F}";
  if (normalized.includes("object")) return "\u{1F9F8}";
  if (normalized.includes("animal")) return "\u{1F43E}";
  if (normalized.includes("habitat")) return "\u{1F3E1}";
  if (normalized.includes("alphabet") || normalized.includes("letter")) return "\u{1F524}";
  if (normalized.includes("communication")) return "\u{1F4F1}";
  if (normalized.includes("personal experience")) return "\u{1F4F8}";
  if (normalized.includes("greeting") || normalized.includes("conversation")) return "\u{1F4AC}";
  if (normalized.includes("group")) return "\u{1F9FA}";
  if (normalized.includes("time")) return "\u{23F0}";
  if (normalized.includes("correspondence")) return "\u{1F449}";
  if (normalized.includes("number") || normalized.includes("numeral")) return "\u{1F522}";
  if (normalized.includes("putting together") || normalized.includes("taking away")) return "\u{2795}";
  if (normalized.includes("estimating")) return "\u{2696}\u{FE0F}";
  if (normalized.includes("visual representation")) return "\u{1F5BC}\u{FE0F}";
  return "\u{2728}";
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F3FBFC" },
  content: { padding: 20, paddingBottom: 36 },
  backButton: { alignSelf: "flex-start", minHeight: 42, minWidth: 64, borderRadius: 8, backgroundColor: "#C62828", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  backButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  header: {
    alignItems: "center",
    backgroundColor: "#DDF5F2",
    borderRadius: 20,
    marginBottom: 20,
    padding: 22,
  },
  headerIcon: { fontSize: 42 },
  title: { color: "#173B53", fontSize: 26, fontWeight: "900", marginTop: 8, textAlign: "center" },
  subtitle: { color: "#36566A", fontSize: 15, marginTop: 6, textAlign: "center" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoryCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#CDEEF1",
    borderRadius: 20,
    borderWidth: 1.5,
    flexBasis: "100%",
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 168,
    padding: 16,
  },
  categoryIcon: { fontSize: 54 },
  categoryTitle: { color: "#173B53", fontSize: 15, fontWeight: "900", marginTop: 9, textAlign: "center" },
  categoryFooter: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 8 },
  lessonCount: { color: "#6E8190", fontSize: 12, fontWeight: "700" },
  categoryArrow: { color: "#258EA3", fontSize: 17, fontWeight: "900" },
  roadmap: { paddingHorizontal: 2 },
  roadmapStart: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 12, paddingLeft: 9 },
  roadmapFinish: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 10, paddingLeft: 9 },
  roadmapStartIcon: { fontSize: 27 },
  roadmapStartText: { color: "#315C4A", fontSize: 16, fontWeight: "900" },
  roadmapStep: { flexDirection: "row", minHeight: 82 },
  roadmapRail: { alignItems: "center", marginRight: 10, width: 38 },
  stepNumber: {
    alignItems: "center",
    backgroundColor: "#FFEAA4",
    borderColor: "#F4C451",
    borderRadius: 17,
    borderWidth: 2,
    height: 34,
    justifyContent: "center",
    width: 34,
    zIndex: 1,
  },
  firstStepNumber: { backgroundColor: "#B8EDF3", borderColor: "#78C7D2" },
  stepNumberText: { color: "#173B53", fontSize: 14, fontWeight: "900" },
  completeStepNumber: { backgroundColor: "#BDE7C2", borderColor: "#72B77D" },
  lockedStepNumber: { backgroundColor: "#E2E8E7", borderColor: "#B9C6C4" },
  roadmapConnector: { backgroundColor: "#A8DCE1", flex: 1, minHeight: 38, width: 4 },
  roadmapCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#CDEEF1",
    borderRadius: 17,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    minHeight: 70,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  roadmapIcon: { fontSize: 34 },
  roadmapCopy: { flex: 1 },
  stepLabel: { color: "#258EA3", fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  roadmapTitle: { color: "#173B53", fontSize: 14, fontWeight: "800", lineHeight: 19, marginTop: 3 },
  roadmapArrow: { color: "#258EA3", fontSize: 28, fontWeight: "700" },
  lockedNotice: { backgroundColor: "#E7EFEE", borderRadius: 12, padding: 14, marginTop: 8 },
  lockedNoticeTitle: { color: "#36566A", fontSize: 15, fontWeight: "900", marginBottom: 5 },
  lockedNoticeText: { color: "#36566A", fontSize: 14, lineHeight: 21 },
  completedNotice: { color: "#397147", fontSize: 13, lineHeight: 19, fontWeight: "700", marginTop: 8 },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CDEEF1",
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 10,
    padding: 20,
  },
  lessonIllustration: { alignSelf: "center", fontSize: 76, marginBottom: 4 },
  sectionTitle: { color: "#173B53", fontSize: 18, fontWeight: "900", marginTop: 4 },
  description: { color: "#36566A", fontSize: 16, lineHeight: 24 },
  startGameButton: { minHeight: 48, alignItems: "center", justifyContent: "center", backgroundColor: "#6B9E43", borderRadius: 12, paddingHorizontal: 16, marginTop: 8 },
  completeButton: { backgroundColor: "#4E8B5C" },
  startGameButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", textAlign: "center" },
  screenTimeNotice: { color: "#8A4F20", fontSize: 14, lineHeight: 21, fontWeight: "800", marginTop: 8 },
  note: { color: "#6E675D", fontSize: 13, lineHeight: 19, marginTop: 10 },
  pressed: { opacity: 0.72 },
});
