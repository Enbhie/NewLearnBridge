import type { Grade } from "./offlineMissions";

export type CategoryId = "math" | "reading" | "science";
export type LearningItem = {
  id: string;
  emoji: string;
  name: string;
  price?: number;
};

export type LessonContent = {
  grade: Grade;
  title: string;
  theme: string;
  storyTitle: string;
  storyLine: string;
  rememberTitle: string;
  rememberText: string;
  equation: string;
  items: LearningItem[];
};

export type CurriculumQuestion = {
  id: string;
  character: string;
  prompt: string;
  displayText: string;
  options: string[];
  correctAnswer: string;
  hint: string;
};

export type QuizDifficulty = "easy" | "standard" | "challenge";

export const categoryMeta: Record<
  CategoryId,
  { label: string; emoji: string; summary: string; lessonTitle: string }
> = {
  math: {
    label: "Math",
    emoji: "🔢",
    summary: "Numbers, money, and everyday problem solving.",
    lessonTitle: "Counting Change",
  },
  reading: {
    label: "Reading Comprehension",
    emoji: "📖",
    summary: "Stories, details, and finding the main idea.",
    lessonTitle: "Story Clues",
  },
  science: {
    label: "Science",
    emoji: "🔬",
    summary: "Plants, weather, and exploring the natural world.",
    lessonTitle: "Plant Needs",
  },
};

export const lessonContent: Record<CategoryId, LessonContent> = {
  math: {
    grade: "1",
    title: "Counting Change",
    theme: "SARI-SARI STORE",
    storyTitle: "SARI-SARI STORE",
    storyLine: "I have ₱10!",
    rememberTitle: "Remember This",
    rememberText: "If you buy something for ₱7 and pay with ₱10, your change is:",
    equation: "₱10 − ₱7 = ₱3",
    items: [
      { id: "royal", emoji: "🥤", name: "Royal", price: 7 },
      { id: "candy", emoji: "🍭", name: "Candy", price: 3 },
      { id: "cookies", emoji: "🍪", name: "Cookies", price: 5 },
    ],
  },
  reading: {
    grade: "1",
    title: "Story Clues",
    theme: "READING CORNER",
    storyTitle: "READING CORNER",
    storyLine: "The shy puppy hid behind the chair and peeked at the new toy.",
    rememberTitle: "Remember This",
    rememberText:
      "Look for the main idea and details that support it. Clues in the story can tell you how a character feels.",
    equation: "Main idea: The puppy is curious and excited about the new toy.",
    items: [
      { id: "title", emoji: "📚", name: "Title" },
      { id: "detail", emoji: "🔍", name: "Detail" },
      { id: "idea", emoji: "🧠", name: "Main Idea" },
    ],
  },
  science: {
    grade: "1",
    title: "Plant Needs",
    theme: "BOTANY LAB",
    storyTitle: "BOTANY LAB",
    storyLine: "Plants need sunlight, water, and soil to grow strong.",
    rememberTitle: "Remember This",
    rememberText: "Plants need sunlight, water, air, and soil to survive and grow healthy.",
    equation: "Sunlight + water + soil = healthy plant",
    items: [
      { id: "sun", emoji: "☀️", name: "Sunlight" },
      { id: "water", emoji: "💧", name: "Water" },
      { id: "soil", emoji: "🌱", name: "Soil" },
    ],
  },
};

export const quizQuestions: Record<CategoryId, CurriculumQuestion[]> = {
  math: [
    {
      id: "q1",
      character: "Bea",
      prompt: "bought a candy for ₱7 and paid with a ₱10 bill. How much change will she get?",
      displayText: "₱10 − ₱7 = ?",
      options: ["2", "3", "4", "5"],
      correctAnswer: "3",
      hint: "Subtract the price from your payment!",
    },
  ],
  reading: [
    {
      id: "r1",
      character: "Lola",
      prompt: "read a story about a shy puppy hiding under a chair. What is the best main idea?",
      displayText: "Main idea: The puppy is curious, shy, and excited to explore the new toy.",
      options: [
        "The puppy loves to nap.",
        "The puppy is curious about the new toy.",
        "The chair is broken.",
        "The toy is under the table.",
      ],
      correctAnswer: "The puppy is curious about the new toy.",
      hint: "Pick the sentence that tells what the story is mostly about.",
    },
  ],
  science: [
    {
      id: "s1",
      character: "Kuya Leo",
      prompt: "watched a plant in the classroom. Which thing helps the plant make energy and grow?",
      displayText: "Plant growth clue: sunlight helps plants make food.",
      options: ["Sunlight", "Plastic", "Shadow", "Noise"],
      correctAnswer: "Sunlight",
      hint: "Plants need sunlight to make food and grow stronger.",
    },
  ],
};

export const mathQuizQuestionsByDifficulty: Record<QuizDifficulty, CurriculumQuestion[]> = {
  easy: [
    {
      id: "q1-easy",
      character: "Bea",
      prompt: "bought a candy for ₱2 and paid with a ₱5 bill. How much change will she get?",
      displayText: "₱5 − ₱2 = ?",
      options: ["2", "3", "4", "5"],
      correctAnswer: "3",
      hint: "Subtract the price from your payment!",
    },
  ],
  standard: quizQuestions.math,
  challenge: [
    {
      id: "q1-challenge",
      character: "Bea",
      prompt: "bought a book for ₱13 and paid with a ₱20 bill. How much change will she get?",
      displayText: "₱20 − ₱13 = ?",
      options: ["5", "6", "7", "8"],
      correctAnswer: "7",
      hint: "Subtract the price from your payment!",
    },
  ],
};
