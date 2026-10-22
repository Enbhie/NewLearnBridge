export type EnglishLessonCategory =
  | "grammar"
  | "fluency"
  | "vocabulary"
  | "writing";

export type EnglishProblem = {
  id: string;
  question: string;
  displayText: string;
  choices: string[];
  answer: string;
  explanation: string;
};

export type EnglishLesson = {
  id: string;
  category: EnglishLessonCategory;
  lessonNumber: number;
  title: string;
  description: string;
  emoji: string;
  storyTitle: string;
  storyLine: string;
  rememberTitle: string;
  rememberText: string;
  example: string;
  learn: string[];
  problems: EnglishProblem[];
};

export type EnglishQuizQuestion = {
  id: string;
  lessonId: string;
  character: string;
  prompt: string;
  displayText: string;
  options: string[];
  correctAnswer: string;
  hint: string;
};

export const englishCategoryMeta: Record<
  EnglishLessonCategory,
  { label: string; emoji: string; summary: string }
> = {
  grammar: {
    label: "Grammar",
    emoji: "📝",
    summary: "Learn nouns, pronouns, verbs, and correct sentences.",
  },
  fluency: {
    label: "Fluency",
    emoji: "📖",
    summary: "Practice reading clearly, smoothly, and expressively.",
  },
  vocabulary: {
    label: "Vocabulary Development",
    emoji: "🔤",
    summary: "Discover word meanings and build vocabulary.",
  },
  writing: {
    label: "Writing and Composition",
    emoji: "✍️",
    summary: "Write complete sentences, paragraphs, and stories.",
  },
};

export const englishLessons: EnglishLesson[] = [
  {
    id: "grammar-1",
    category: "grammar",
    lessonNumber: 1,
    title: "Nouns and Pronouns",
    description: "Identify naming words and use pronouns to replace nouns.",
    emoji: "👧",
    storyTitle: "MEET ANA AND HER DOG",
    storyLine: "Ana has a dog. She loves it very much.",
    rememberTitle: "Remember This",
    rememberText:
      "Nouns name people, places, animals, and things. Pronouns replace nouns.",
    example: "Ana is happy. She is smiling.",
    learn: [
      "Nouns name people, places, animals, and things.",
      "Pronouns replace nouns. Examples include he, she, it, they, and we.",
      "Use a pronoun to avoid repeating a person's or animal's name.",
    ],
    problems: [
      {
        id: "g1-p1",
        question: "Which word is a noun?",
        displayText: "The cat is sleeping.",
        choices: ["sleeping", "cat", "the", "is"],
        answer: "cat",
        explanation: "Cat is a noun because it names an animal.",
      },
      {
        id: "g1-p2",
        question: "Which pronoun replaces Maria?",
        displayText: "Maria is reading a book.",
        choices: ["They", "It", "She", "We"],
        answer: "She",
        explanation: "She is a pronoun that can replace Maria.",
      },
      {
        id: "g1-p3",
        question: "Which word names a person?",
        displayText: "The boy kicks the ball.",
        choices: ["kicks", "the", "boy", "quickly"],
        answer: "boy",
        explanation: "Boy is a noun because it names a person.",
      },
    ],
  },
  {
    id: "grammar-2",
    category: "grammar",
    lessonNumber: 1,
    title: "Verbs and Adjectives",
    description:
      "Recognize action words and words that describe people, places, and things.",
    emoji: "🏃",
    storyTitle: "A FUN DAY",
    storyLine: "The happy boy runs in the green park.",
    rememberTitle: "Remember This",
    rememberText: "Verbs show actions. Adjectives describe nouns.",
    example: "The small cat jumps.",
    learn: [
      "Verbs tell what someone or something does.",
      "Adjectives describe nouns, such as color, size, or appearance.",
      "In 'The small cat jumps,' small is an adjective and jumps is a verb.",
    ],
    problems: [
      {
        id: "g2-p1",
        question: "Which word is a verb?",
        displayText: "The bird flies in the sky.",
        choices: ["bird", "sky", "flies", "blue"],
        answer: "flies",
        explanation: "Flies is a verb because it describes an action.",
      },
      {
        id: "g2-p2",
        question: "Which word describes the flower?",
        displayText: "The beautiful flower smells sweet.",
        choices: ["flower", "beautiful", "smells", "the"],
        answer: "beautiful",
        explanation: "Beautiful is an adjective because it describes the flower.",
      },
      {
        id: "g2-p3",
        question: "Find the action word.",
        displayText: "The children dance happily.",
        choices: ["children", "happily", "dance", "the"],
        answer: "dance",
        explanation: "Dance tells us what the children do.",
      },
    ],
  },
  {
    id: "grammar-3",
    category: "grammar",
    lessonNumber: 1,
    title: "Sentence Construction",
    description:
      "Arrange words to form complete and grammatically correct sentences.",
    emoji: "🧩",
    storyTitle: "BUILD A SENTENCE",
    storyLine: "Put the words in the correct order to make a sentence.",
    rememberTitle: "Remember This",
    rememberText:
      "A complete sentence expresses a complete thought and begins with a capital letter.",
    example: "The girl reads a book.",
    learn: [
      "A sentence expresses a complete thought.",
      "Begin a sentence with a capital letter.",
      "Put words in an order that makes the meaning clear.",
    ],
    problems: [
      {
        id: "g3-p1",
        question: "Which sentence is correct?",
        displayText: "Choose the sentence that makes sense.",
        choices: [
          "Dog the runs fast.",
          "The dog runs fast.",
          "Runs fast dog the.",
          "Fast the runs dog.",
        ],
        answer: "The dog runs fast.",
        explanation: "The words are arranged in the correct order.",
      },
      {
        id: "g3-p2",
        question: "Which sentence starts correctly?",
        displayText: "Choose the correctly written sentence.",
        choices: [
          "my name is Ben.",
          "My name is Ben.",
          "my Name is Ben.",
          "My Name Is ben.",
        ],
        answer: "My name is Ben.",
        explanation: "A sentence begins with a capital letter.",
      },
      {
        id: "g3-p3",
        question: "Choose the correct punctuation mark.",
        displayText: "What is your name___",
        choices: [".", ",", "?", "!"],
        answer: "?",
        explanation: "A question usually ends with a question mark.",
      },
    ],
  },
  {
    id: "fluency-1",
    category: "fluency",
    lessonNumber: 2,
    title: "Reading Short Sentences",
    description: "Read simple sentences clearly and correctly.",
    emoji: "📚",
    storyTitle: "READ WITH ME",
    storyLine: "The sun is bright. The birds can sing.",
    rememberTitle: "Remember This",
    rememberText: "Read each word carefully and pronounce it correctly.",
    example: "I like to play outside.",
    learn: [
      "Look carefully at every word.",
      "Say words clearly and correctly.",
      "Read a sentence from beginning to end without skipping words.",
    ],
    problems: [
      {
        id: "f1-p1",
        question: "Which is the best way to read a sentence?",
        displayText: "The bird is in the tree.",
        choices: [
          "Skip some words.",
          "Read as fast as possible.",
          "Read each word clearly.",
          "Guess every word.",
        ],
        answer: "Read each word clearly.",
        explanation:
          "Good reading means saying the words clearly and correctly.",
      },
    ],
  },
  {
    id: "fluency-2",
    category: "fluency",
    lessonNumber: 2,
    title: "Reading with Expression",
    description:
      "Practice reading sentences with proper pauses, intonation, and expression.",
    emoji: "🎭",
    storyTitle: "SAY IT WITH FEELING",
    storyLine: "Wow! That is a beautiful rainbow!",
    rememberTitle: "Remember This",
    rememberText:
      "Use your voice to show feelings. Pause at commas and stop at periods.",
    example: "Hooray! We won the game!",
    learn: [
      "Let your voice match the feeling in the sentence.",
      "Pause briefly at commas.",
      "Use punctuation to guide your expression.",
    ],
    problems: [
      {
        id: "f2-p1",
        question: "How should you read a sentence that shows excitement?",
        displayText: "Hooray! I won the game!",
        choices: [
          "With excitement",
          "In a whisper every time",
          "Without expression",
          "By skipping words",
        ],
        answer: "With excitement",
        explanation: "Let your voice match the feeling of the sentence.",
      },
    ],
  },
  {
    id: "fluency-3",
    category: "fluency",
    lessonNumber: 2,
    title: "Reading Short Stories Aloud",
    description:
      "Read short stories smoothly with appropriate speed and pronunciation.",
    emoji: "🦊",
    storyTitle: "THE LITTLE FOX",
    storyLine: "A little fox walks through the forest and finds a butterfly.",
    rememberTitle: "Remember This",
    rememberText:
      "Read smoothly, pronounce words correctly, and maintain a comfortable pace.",
    example: "The fox runs to its home.",
    learn: [
      "Read at a comfortable, steady speed.",
      "Pronounce words clearly.",
      "Pay attention to punctuation as you read aloud.",
    ],
    problems: [
      {
        id: "f3-p1",
        question: "What helps you read a story aloud well?",
        displayText: "Read the story smoothly.",
        choices: [
          "Rush through every word.",
          "Skip difficult words.",
          "Read clearly at a comfortable speed.",
          "Ignore punctuation.",
        ],
        answer: "Read clearly at a comfortable speed.",
        explanation: "Clear pronunciation and a steady pace help readers.",
      },
    ],
  },
  {
    id: "vocabulary-1",
    category: "vocabulary",
    lessonNumber: 3,
    title: "Synonyms and Antonyms",
    description: "Identify words with similar and opposite meanings.",
    emoji: "🔄",
    storyTitle: "WORD TWINS",
    storyLine: "Find words that mean the same or the opposite.",
    rememberTitle: "Remember This",
    rememberText:
      "Synonyms have similar meanings. Antonyms have opposite meanings.",
    example: "Happy = glad. Hot ≠ cold.",
    learn: [
      "Synonyms have similar meanings.",
      "Antonyms have opposite meanings.",
      "Use the surrounding sentence to check a word's meaning.",
    ],
    problems: [
      {
        id: "v1-p1",
        question: "What is a synonym for happy?",
        displayText: "The girl is happy.",
        choices: ["Sad", "Angry", "Joyful", "Tired"],
        answer: "Joyful",
        explanation: "Happy and joyful have similar meanings.",
      },
      {
        id: "v1-p2",
        question: "What is the opposite of hot?",
        displayText: "The soup is hot.",
        choices: ["Warm", "Cold", "Spicy", "Boiling"],
        answer: "Cold",
        explanation: "Cold is the opposite of hot.",
      },
      {
        id: "v1-p3",
        question: "Which word means the same as big?",
        displayText: "The elephant is big.",
        choices: ["Tiny", "Small", "Huge", "Short"],
        answer: "Huge",
        explanation: "Huge and big have similar meanings.",
      },
    ],
  },
  {
    id: "vocabulary-2",
    category: "vocabulary",
    lessonNumber: 3,
    title: "Context Clues",
    description:
      "Use surrounding words and sentences to understand unfamiliar words.",
    emoji: "🔎",
    storyTitle: "WORD DETECTIVES",
    storyLine: "Mia was exhausted after running. She felt very tired.",
    rememberTitle: "Remember This",
    rememberText:
      "Context clues help you understand unfamiliar words by looking at the words around them.",
    example: "Exhausted means very tired.",
    learn: [
      "Look at nearby words for clues to an unfamiliar word.",
      "Notice examples or explanations in the sentence.",
      "Replace the unfamiliar word with a possible meaning to check it.",
    ],
    problems: [
      {
        id: "v2-p1",
        question: "What does exhausted mean?",
        displayText: "Ben ran for an hour. He was exhausted and needed rest.",
        choices: ["Hungry", "Very tired", "Very happy", "Thirsty"],
        answer: "Very tired",
        explanation:
          "The sentence says Ben needed rest after running, so exhausted means very tired.",
      },
    ],
  },
  {
    id: "vocabulary-3",
    category: "vocabulary",
    lessonNumber: 3,
    title: "Word Categories",
    description: "Group words according to animals, food, objects, and places.",
    emoji: "🗂️",
    storyTitle: "SORT THE WORDS",
    storyLine: "Put each word into its correct group.",
    rememberTitle: "Remember This",
    rememberText: "Words can be grouped according to what they represent.",
    example: "Apple, mango, and banana are fruits.",
    learn: [
      "A category is a group of things that share a feature.",
      "Look for what each word represents.",
      "Sort words by their shared meaning.",
    ],
    problems: [
      {
        id: "v3-p1",
        question: "Which group contains only animals?",
        displayText: "Choose the correct word category.",
        choices: [
          "Cat, dog, bird",
          "Rice, bread, milk",
          "Chair, table, desk",
          "School, park, store",
        ],
        answer: "Cat, dog, bird",
        explanation: "Cat, dog, and bird all name animals.",
      },
    ],
  },
  {
    id: "writing-1",
    category: "writing",
    lessonNumber: 5,
    title: "Writing Complete Sentences",
    description:
      "Write sentences using correct capitalization and punctuation.",
    emoji: "✏️",
    storyTitle: "FIX THE SENTENCE",
    storyLine: "my dog likes to play",
    rememberTitle: "Remember This",
    rememberText:
      "Begin sentences with capital letters and use the correct ending punctuation.",
    example: "My dog likes to play.",
    learn: [
      "Begin each sentence with a capital letter.",
      "End a statement with the correct punctuation.",
      "Read your sentence again to make sure it expresses a complete thought.",
    ],
    problems: [
      {
        id: "w1-p1",
        question: "Which sentence uses correct capitalization and punctuation?",
        displayText: "Choose the correctly written sentence.",
        choices: [
          "my cat is cute",
          "My cat is cute.",
          "my Cat is cute.",
          "My cat is cute",
        ],
        answer: "My cat is cute.",
        explanation: "A sentence begins with a capital and ends with a period.",
      },
      {
        id: "w1-p2",
        question: "Which punctuation mark ends a question?",
        displayText: "Choose the correct ending mark.",
        choices: [".", ",", "?", "!"],
        answer: "?",
        explanation: "A question ends with a question mark.",
      },
      {
        id: "w1-p3",
        question: "Choose the correctly written sentence.",
        displayText: "Check the capital letter and ending punctuation.",
        choices: [
          "we play outside.",
          "We play outside.",
          "We play outside",
          "we Play outside.",
        ],
        answer: "We play outside.",
        explanation: "The sentence starts with a capital and ends with a period.",
      },
    ],
  },
  {
    id: "writing-2",
    category: "writing",
    lessonNumber: 5,
    title: "Writing a Descriptive Paragraph",
    description:
      "Describe a person, place, animal, or object using descriptive words.",
    emoji: "🌳",
    storyTitle: "DESCRIBE WHAT YOU SEE",
    storyLine: "The garden is colorful, peaceful, and beautiful.",
    rememberTitle: "Remember This",
    rememberText:
      "A descriptive paragraph uses details and adjectives to help readers imagine something.",
    example: "My garden is small. It has colorful flowers and green plants.",
    learn: [
      "Use adjectives to describe people, places, animals, and objects.",
      "Include details about color, size, shape, and appearance.",
      "Connect related sentences to describe one main topic.",
    ],
    problems: [
      {
        id: "w2-p1",
        question: "Which sentence uses descriptive words?",
        displayText: "Describe a beautiful garden.",
        choices: [
          "The garden is there.",
          "The garden has colorful flowers.",
          "I see it.",
          "Go to the garden.",
        ],
        answer: "The garden has colorful flowers.",
        explanation: "Colorful helps the reader imagine the garden.",
      },
      {
        id: "w2-p2",
        question: "Which word best describes a soft pillow?",
        displayText: "Choose a describing word.",
        choices: ["Soft", "Run", "Jump", "Quickly"],
        answer: "Soft",
        explanation: "Soft describes what the pillow feels like.",
      },
      {
        id: "w2-p3",
        question: "What should a descriptive paragraph help readers do?",
        displayText: "Think about why writers include details.",
        choices: [
          "Imagine what is being described",
          "Forget the topic",
          "Count random numbers",
          "Avoid details",
        ],
        answer: "Imagine what is being described",
        explanation: "Details help readers picture the subject.",
      },
    ],
  },
  {
    id: "writing-3",
    category: "writing",
    lessonNumber: 5,
    title: "Writing a Short Story",
    description:
      "Create a short story with a beginning, middle, and ending.",
    emoji: "📕",
    storyTitle: "CREATE YOUR OWN STORY",
    storyLine: "A girl finds a lost puppy and helps it return home.",
    rememberTitle: "Remember This",
    rememberText:
      "A story has a beginning that introduces events, a middle that develops them, and an ending that concludes them.",
    example:
      "First, Ana finds a puppy. Then, she looks for its owner. Finally, the puppy returns home.",
    learn: [
      "The beginning introduces the characters and setting.",
      "The middle describes the main events or problem.",
      "The ending explains how the story concludes.",
    ],
    problems: [
      {
        id: "w3-p1",
        question: "What usually comes at the beginning of a story?",
        displayText: "Beginning → Middle → Ending",
        choices: [
          "The final result",
          "The introduction of characters or events",
          "The last sentence only",
          "A random ending",
        ],
        answer: "The introduction of characters or events",
        explanation: "The beginning introduces the story and its events.",
      },
      {
        id: "w3-p2",
        question: "What does the middle of a story usually describe?",
        displayText: "Think about what happens after the beginning.",
        choices: [
          "The main events or problem",
          "Only the title",
          "The final result only",
          "Nothing important",
        ],
        answer: "The main events or problem",
        explanation: "The middle develops the events or problem.",
      },
      {
        id: "w3-p3",
        question: "What does the ending of a story do?",
        displayText: "Think about the final part of a story.",
        choices: [
          "Introduces every character",
          "Starts a new unrelated story",
          "Concludes the events",
          "Removes the middle",
        ],
        answer: "Concludes the events",
        explanation: "The ending brings the story's events to a close.",
      },
    ],
  },
];

export const englishQuizQuestions: EnglishQuizQuestion[] =
  englishLessons.flatMap((lesson) =>
    lesson.problems.map((problem, index) => ({
      id: problem.id,
      lessonId: lesson.id,
      character: "Mia",
      prompt: problem.question,
      displayText: problem.displayText,
      options: problem.choices,
      correctAnswer: problem.answer,
      hint: problem.explanation || lesson.rememberText,
    })),
  );

export const getEnglishLessons = (
  category: EnglishLessonCategory,
): EnglishLesson[] =>
  englishLessons.filter((lesson) => lesson.category === category);

export const getEnglishQuiz = (
  lessonId: string,
): EnglishQuizQuestion[] =>
  englishQuizQuestions.filter(
    (question) => question.lessonId === lessonId,
  );
