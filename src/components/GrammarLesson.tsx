import { Text, View } from "react-native";
import { getEnglishLessons } from "../data/EnglishCurriculum";

export default function GrammarLesson() {
  const grammarLessons = getEnglishLessons("grammar");

  return (
    <View>
      {grammarLessons.map((lesson) => (
        <Text key={lesson.id}>
          {lesson.emoji} {lesson.title}
        </Text>
      ))}
    </View>
  );
}