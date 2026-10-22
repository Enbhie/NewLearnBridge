import LessonTrailScreen, { rep, type GradeScreenProps, type Subject } from "./LessonTrailScreen";

// ---------- Curriculum data ----------
// Kindergarten: three subjects, five lessons each, one minigame per lesson.
// Built from the K units: Letters and Sounds, Numbers and Shapes,
// Me / Family / Community, and Healthy Habits and Safety.

export const kinderSubjects: Subject[] = [
  {
    id: "reading",
    title: "Reading Comprehension",
    emoji: "📖",
    music: "reading",
    lessons: [
      {
        id: "letter-names",
        title: "Letter Names",
        emoji: "🔠",
        gameName: "Letter Hunt",
        blurb: "Find the letter that matches.",
        learn:
          "There are 26 letters from A to Z. Each letter has its own name and shape. Look closely to tell the letters apart.",
        game: {
          type: "choice",
          rounds: [
            { art: "🔠", q: "Which one is the letter B?", correct: "B", wrong: ["D", "P"] },
            { art: "🔠", q: "Which one is the letter M?", correct: "M", wrong: ["W", "N"] },
            { art: "🔠", q: "Which one is the letter S?", correct: "S", wrong: ["Z", "C"] },
            { art: "🔠", q: "Which one is the letter A?", correct: "A", wrong: ["V", "H"] },
            { art: "🔠", q: "Which one is the letter T?", correct: "T", wrong: ["L", "F"] },
          ],
        },
      },
      {
        id: "sound-safari",
        title: "Sound Safari",
        emoji: "🚌",
        gameName: "Sound Safari",
        blurb: "Ride the bus and find what starts with the sound.",
        learn:
          "Every word starts with a sound. Say the word slowly and listen: ball starts with the sound b, and sun starts with the sound s.",
        game: {
          type: "choice",
          rounds: [
            { art: "🚌", q: "Which one starts with the sound b?", correct: "🐻 bear", wrong: ["🐱 cat", "🐟 fish"] },
            { art: "🚌", q: "Which one starts with the sound s?", correct: "☀️ sun", wrong: ["🌙 moon", "🐶 dog"] },
            { art: "🚌", q: "Which one starts with the sound m?", correct: "🌙 moon", wrong: ["☀️ sun", "🐸 frog"] },
            { art: "🚌", q: "Which one starts with the sound d?", correct: "🐶 dog", wrong: ["🐱 cat", "🐷 pig"] },
            { art: "🚌", q: "Which one starts with the sound f?", correct: "🐟 fish", wrong: ["🐻 bear", "🌙 moon"] },
          ],
        },
      },
      {
        id: "alphabet-order",
        title: "ABC Order",
        emoji: "🔡",
        gameName: "Alphabet Train",
        blurb: "Tap the letters in ABC order.",
        learn:
          "The letters always go in the same order: A, B, C, D, and so on. Singing the ABC song helps us remember.",
        game: {
          type: "order",
          rounds: [
            { art: "🚂", prompt: "Tap the letters in ABC order.", items: ["A", "B", "C"] },
            { art: "🚂", prompt: "Tap the letters in ABC order.", items: ["D", "E", "F"] },
            { art: "🚂", prompt: "Tap the letters in ABC order.", items: ["G", "H", "I", "J"] },
            { art: "🚂", prompt: "Tap the letters in ABC order.", items: ["M", "N", "O", "P"] },
            { art: "🚂", prompt: "Tap the letters in ABC order.", items: ["T", "U", "V", "W"] },
          ],
        },
      },
      {
        id: "big-small-letters",
        title: "Big and Small Letters",
        emoji: "🔤",
        gameName: "Letter Pairs",
        blurb: "Match each big letter to its small letter.",
        learn:
          "Every letter has a big form and a small form. Big A and small a are partners!",
        game: {
          type: "choice",
          rounds: [
            { art: "🔤", q: "Which small letter matches A?", correct: "a", wrong: ["e", "o"] },
            { art: "🔤", q: "Which small letter matches B?", correct: "b", wrong: ["d", "p"] },
            { art: "🔤", q: "Which small letter matches D?", correct: "d", wrong: ["b", "q"] },
            { art: "🔤", q: "Which small letter matches M?", correct: "m", wrong: ["n", "w"] },
            { art: "🔤", q: "Which small letter matches G?", correct: "g", wrong: ["q", "p"] },
          ],
        },
      },
      {
        id: "story-time",
        title: "Listen and Read",
        emoji: "📚",
        gameName: "Story Time",
        blurb: "Read a tiny story, then answer questions about it.",
        learn:
          "Stories have characters and things that happen. Listen to the story first, then answer the questions about it.",
        game: {
          type: "choice",
          passage: "Pip is a small cat. Pip likes milk. Pip naps in the sun.",
          rounds: [
            { art: "🐱", q: "Who is this story about?", correct: "Pip", wrong: ["Mom", "A dog"] },
            { art: "🥛", q: "What does Pip like?", correct: "Milk", wrong: ["Rice", "Bread"] },
            { art: "☀️", q: "Where does Pip nap?", correct: "In the sun", wrong: ["In the rain", "In a car"] },
            { art: "🐱", q: "Is Pip big or small?", correct: "Small", wrong: ["Big", "Tall"] },
          ],
        },
      },
    ],
  },
  {
    id: "math",
    title: "Math",
    emoji: "🔢",
    music: "math",
    lessons: [
      {
        id: "counting",
        title: "Count 1 to 10",
        emoji: "🧺",
        gameName: "Market Count",
        blurb: "Count the items for the vendor's basket.",
        learn:
          "Touch each thing once as you count, and say the next number each time. The last number you say tells how many there are.",
        game: {
          type: "choice",
          rounds: [
            { art: rep("🥭", 3), q: "How many mangoes are there?", correct: "3", wrong: ["2", "4"] },
            { art: rep("🐟", 5), q: "How many fish are there?", correct: "5", wrong: ["4", "6"] },
            { art: rep("🥚", 2), q: "How many eggs are there?", correct: "2", wrong: ["1", "3"] },
            { art: rep("🥭", 7), q: "How many mangoes are there?", correct: "7", wrong: ["6", "8"] },
            { art: rep("🐟", 10), q: "How many fish are there?", correct: "10", wrong: ["9", "8"] },
          ],
        },
      },
      {
        id: "number-order",
        title: "Number Order",
        emoji: "🔟",
        gameName: "Number Hop",
        blurb: "Help the frog hop along the numbers in order.",
        learn:
          "Numbers go in order: 1, 2, 3, 4, 5, and on up to 10. Each number is one more than the one before it.",
        game: {
          type: "order",
          rounds: [
            { art: "🐸", prompt: "Tap the numbers in order.", items: ["1", "2", "3"] },
            { art: "🐸", prompt: "Tap the numbers in order.", items: ["4", "5", "6"] },
            { art: "🐸", prompt: "Tap the numbers in order.", items: ["2", "3", "4", "5"] },
            { art: "🐸", prompt: "Tap the numbers in order.", items: ["6", "7", "8", "9"] },
            { art: "🐸", prompt: "Tap the numbers in order.", items: ["7", "8", "9", "10"] },
          ],
        },
      },
      {
        id: "more-or-less",
        title: "More or Less",
        emoji: "⚖️",
        gameName: "Which Has More?",
        blurb: "Compare two groups and pick the right one.",
        learn:
          "The group with more things has the bigger number. The group with fewer things has the smaller number.",
        game: {
          type: "choice",
          rounds: [
            { art: `${rep("🍎", 3)}  vs  ${rep("🍎", 5)}`, q: "Which group has MORE?", correct: "Right group", wrong: ["Left group", "They are the same"] },
            { art: `${rep("🍌", 4)}  vs  ${rep("🍌", 2)}`, q: "Which group has MORE?", correct: "Left group", wrong: ["Right group", "They are the same"] },
            { art: `${rep("🐟", 6)}  vs  ${rep("🐟", 2)}`, q: "Which group has FEWER?", correct: "Right group", wrong: ["Left group", "They are the same"] },
            { art: `${rep("🥚", 1)}  vs  ${rep("🥚", 4)}`, q: "Which group has FEWER?", correct: "Left group", wrong: ["Right group", "They are the same"] },
            { art: `${rep("🥭", 5)}  vs  ${rep("🥭", 7)}`, q: "Which group has MORE?", correct: "Right group", wrong: ["Left group", "They are the same"] },
          ],
        },
      },
      {
        id: "shapes",
        title: "Shapes",
        emoji: "🔷",
        gameName: "House Builder",
        blurb: "Pick the right shape to build the house.",
        learn:
          "A circle is round. A square has 4 equal sides. A triangle has 3 sides. A rectangle has 4 sides, two long and two short.",
        game: {
          type: "choice",
          rounds: [
            { art: "🏠", q: "Which shape makes the roof?", correct: "Triangle", wrong: ["Circle", "Square"] },
            { art: "🚪", q: "Which shape makes the door?", correct: "Rectangle", wrong: ["Circle", "Triangle"] },
            { art: "☀️", q: "Which shape is the sun?", correct: "Circle", wrong: ["Square", "Rectangle"] },
            { art: "🪟", q: "Which shape is a window with 4 equal sides?", correct: "Square", wrong: ["Triangle", "Circle"] },
            { art: "🧱", q: "Which shape is a long brick?", correct: "Rectangle", wrong: ["Triangle", "Circle"] },
          ],
        },
      },
      {
        id: "put-together",
        title: "Put Them Together",
        emoji: "➕",
        gameName: "Basket Fill",
        blurb: "Count how many in all when two groups join.",
        learn:
          "When two groups join together, count them all to see how many in all. 2 and 1 more makes 3.",
        game: {
          type: "choice",
          rounds: [
            { art: `${rep("🥭", 2)}  ➕  ${rep("🥭", 1)}`, q: "2 mangoes and 1 more. How many in all?", correct: "3", wrong: ["2", "4"] },
            { art: `${rep("🥭", 3)}  ➕  ${rep("🥭", 1)}`, q: "3 mangoes and 1 more. How many in all?", correct: "4", wrong: ["3", "5"] },
            { art: `${rep("🐟", 2)}  ➕  ${rep("🐟", 3)}`, q: "2 fish and 3 more. How many in all?", correct: "5", wrong: ["4", "6"] },
            { art: `${rep("🥚", 3)}  ➕  ${rep("🥚", 3)}`, q: "3 eggs and 3 more. How many in all?", correct: "6", wrong: ["5", "7"] },
            { art: `${rep("🥭", 5)}  ➕  ${rep("🥭", 3)}`, q: "5 mangoes and 3 more. How many in all?", correct: "8", wrong: ["7", "9"] },
          ],
        },
      },
    ],
  },
  {
    id: "science",
    title: "Science",
    emoji: "🌱",
    music: "science",
    lessons: [
      {
        id: "my-family",
        title: "My Family",
        emoji: "👨‍👩‍👧",
        gameName: "Family Match",
        blurb: "Match each picture to the family member.",
        learn:
          "A family is the people who love and take care of you, like mother, father, grandmother, and grandfather. Your name and your age tell who you are.",
        game: {
          type: "choice",
          rounds: [
            { art: "👵", q: "Who is this?", correct: "Grandmother", wrong: ["Sister", "Teacher"] },
            { art: "👴", q: "Who is this?", correct: "Grandfather", wrong: ["Brother", "Doctor"] },
            { art: "👩", q: "Who is this?", correct: "Mother", wrong: ["Father", "Baby"] },
            { art: "👨", q: "Who is this?", correct: "Father", wrong: ["Mother", "Baby"] },
            { art: "👶", q: "Who is this?", correct: "Baby", wrong: ["Father", "Grandfather"] },
          ],
        },
      },
      {
        id: "community-helpers",
        title: "Community Helpers",
        emoji: "🧑‍🚒",
        gameName: "Who Can Help?",
        blurb: "Match the problem to the right helper.",
        learn:
          "Community helpers keep us safe and healthy. Firefighters, doctors, teachers, and mechanics each help in their own way.",
        game: {
          type: "choice",
          rounds: [
            { art: "🔥", q: "There is a fire! Who can help?", correct: "Firefighter", wrong: ["Teacher", "Farmer"] },
            { art: "🚗", q: "The car has a flat tire. Who can help?", correct: "Mechanic", wrong: ["Doctor", "Cook"] },
            { art: "🤒", q: "A child is sick. Who can help?", correct: "Doctor", wrong: ["Firefighter", "Mechanic"] },
            { art: "📚", q: "Who teaches you at school?", correct: "Teacher", wrong: ["Farmer", "Driver"] },
            { art: "💌", q: "Who brings letters to your house?", correct: "Mail carrier", wrong: ["Doctor", "Cook"] },
          ],
        },
      },
      {
        id: "polite-kids",
        title: "Polite Kids",
        emoji: "🙏",
        gameName: "Polite Kids",
        blurb: "Pick the polite thing to say.",
        learn:
          "Polite words make people feel happy: please, thank you, excuse me, and good morning. We say them to show respect.",
        game: {
          type: "choice",
          rounds: [
            { art: "🎁", q: "A friend gives you a gift. What do you say?", correct: "Thank you!", wrong: ["Give me more!", "Nothing"] },
            { art: "🌅", q: "You see your teacher in the morning. What do you say?", correct: "Good morning, Teacher!", wrong: ["Go away!", "Hurry up!"] },
            { art: "🧸", q: "You want to play with a toy. What do you say?", correct: "May I please play?", wrong: ["Give it to me!", "That is mine!"] },
            { art: "🚶", q: "You bump into a friend by accident. What do you say?", correct: "Sorry! Are you okay?", wrong: ["It is your fault!", "Move over!"] },
            { art: "👵", q: "You see your grandmother. What do you say?", correct: "Hello, Grandma!", wrong: ["Go away!", "Who are you?"] },
          ],
        },
      },
      {
        id: "healthy-routine",
        title: "Healthy Routine",
        emoji: "🧼",
        gameName: "Healthy Routine",
        blurb: "Put each healthy routine in the right order.",
        learn:
          "Washing your hands and brushing your teeth keep your body healthy. The steps work best in the right order.",
        game: {
          type: "order",
          rounds: [
            {
              art: "🧼",
              prompt: "Tap the steps to wash your hands in order.",
              items: ["Wet your hands", "Add soap", "Scrub", "Rinse and dry"],
            },
            {
              art: "🪥",
              prompt: "Tap the steps to brush your teeth in order.",
              items: ["Put on toothpaste", "Brush your teeth", "Spit it out", "Rinse your mouth"],
            },
            {
              art: "🍽️",
              prompt: "Tap the steps of dinner time in order.",
              items: ["Wash your hands", "Sit at the table", "Eat your food", "Brush your teeth"],
            },
          ],
        },
      },
      {
        id: "safe-crossing",
        title: "Safe Crossing",
        emoji: "🚦",
        gameName: "Safe Crossing",
        blurb: "Choose the safe way to cross the road.",
        learn:
          "Before you cross, stop at the curb. Wait for the green light, look left and right, and hold a grown-up's hand.",
        game: {
          type: "choice",
          rounds: [
            { art: "🔴", q: "The light is red. What do you do?", correct: "Stop and wait", wrong: ["Run across", "Close your eyes"] },
            { art: "🟢", q: "The light is green. What do you do first?", correct: "Look both ways", wrong: ["Run fast", "Close your eyes"] },
            { art: "🚸", q: "Where should you cross the road?", correct: "At the crosswalk", wrong: ["Between parked cars", "Anywhere"] },
            { art: "🧒", q: "Who should you cross the road with?", correct: "A grown-up", wrong: ["Nobody", "A stranger"] },
            { art: "👀", q: "Which way do you look before crossing?", correct: "Left and right", wrong: ["Up at the sky", "Down at your shoes"] },
          ],
        },
      },
    ],
  },
];

// Total lessons across all subjects. index.tsx can use this for the progress bar.
export const kindergartenLessonCount = kinderSubjects.reduce(
  (sum, subject) => sum + subject.lessons.length,
  0
);
export const kinderLessonCount = kindergartenLessonCount;

// Progress keys look like grade:k:online:<subject>:<lesson>.
export default function KinderLessonsScreen(props: GradeScreenProps) {
  return (
    <LessonTrailScreen
      {...props}
      gradeLabel="Kindergarten"
      subjects={kinderSubjects}
      progressPrefix="grade:k:online"
    />
  );
}
