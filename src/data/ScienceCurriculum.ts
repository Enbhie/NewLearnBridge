export type ScienceQuestion = {
  q: string;
  options: string[];
  answer: string;
  explain: string;
};

export type ScienceActivity = {
  title: string;
  instruction: string;
  questions: ScienceQuestion[];
};

export type ScienceLesson = {
  title: string;
  emoji: string;
  activities: ScienceActivity[];
};

export const scienceLessons: ScienceLesson[] = [
  {
    title: "Parts of Plants",
    emoji: "🌱",
    activities: [
      {
        title: "Build a Plant",
        instruction: "Choose the plant part that matches the picture.",
        questions: [
          {
            q: "🌿 Which part absorbs water from the soil?",
            options: ["Roots", "Flower", "Fruit"],
            answer: "Roots",
            explain: "Roots absorb water and minerals from the soil.",
          },
          {
            q: "🌳 Which part supports the plant?",
            options: ["Stem", "Fruit", "Flower"],
            answer: "Stem",
            explain: "The stem supports the plant and transports water.",
          },
          {
            q: "🍃 Which part helps the plant make food?",
            options: ["Roots", "Leaves", "Fruit"],
            answer: "Leaves",
            explain: "Leaves use sunlight to help make food.",
          },
          {
            q: "🌸 Which part helps a plant reproduce?",
            options: ["Flower", "Stem", "Roots"],
            answer: "Flower",
            explain: "Flowers help plants reproduce.",
          },
          {
            q: "🍎 Which part often protects the seeds?",
            options: ["Leaves", "Stem", "Fruit"],
            answer: "Fruit",
            explain: "Fruit often protects the seeds inside.",
          },
        ],
      },
      {
        title: "What Does It Do?",
        instruction:
          "Match each plant part to its job by choosing the correct answer.",
        questions: [
          {
            q: "What is the main job of roots?",
            options: ["Absorb water", "Make seeds", "Catch the wind"],
            answer: "Absorb water",
            explain: "Roots take in water and minerals.",
          },
          {
            q: "What does the stem do?",
            options: [
              "Supports the plant",
              "Makes the soil",
              "Absorbs sunlight for the plant",
            ],
            answer: "Supports the plant",
            explain: "The stem holds up the plant and transports water.",
          },
          {
            q: "What do leaves help the plant do?",
            options: ["Make food", "Walk", "Hear sounds"],
            answer: "Make food",
            explain: "Leaves use sunlight, water, and air to make food.",
          },
        ],
      },
    ],
  },
  {
    title: "Animals and Their Habitats",
    emoji: "🐘",
    activities: [
      {
        title: "Find the Animal's Home",
        instruction: "Choose the habitat where each animal usually lives.",
        questions: [
          {
            q: "🐟 Where does a fish live?",
            options: ["Ocean", "Desert", "Tree"],
            answer: "Ocean",
            explain: "Many fish live in oceans, rivers, or lakes.",
          },
          {
            q: "🐒 Where might a monkey live?",
            options: ["Forest", "Ocean", "Snowy mountain only"],
            answer: "Forest",
            explain: "Many monkeys live in forests.",
          },
          {
            q: "🐄 Where do people commonly keep cows?",
            options: ["Farm", "Ocean", "Arctic"],
            answer: "Farm",
            explain: "Cows are commonly raised on farms.",
          },
          {
            q: "🐻‍❄️ Which region is a polar bear adapted to?",
            options: ["Arctic", "Tropical rainforest", "Desert"],
            answer: "Arctic",
            explain: "Polar bears are adapted to the Arctic.",
          },
        ],
      },
      {
        title: "Who Lives Here?",
        instruction:
          "Read the habitat clue and select an animal that can live there.",
        questions: [
          {
            q: "🌊 This habitat has salt water. Which animal can live here?",
            options: ["Dolphin", "Camel", "Chicken"],
            answer: "Dolphin",
            explain: "Dolphins live in oceans.",
          },
          {
            q: "🏜️ Which animal is well adapted to a desert?",
            options: ["Camel", "Penguin", "Shark"],
            answer: "Camel",
            explain:
              "Camels have adaptations that help them survive in deserts.",
          },
          {
            q: "🌳 Which animal might live in a tree?",
            options: ["Squirrel", "Whale", "Octopus"],
            answer: "Squirrel",
            explain: "Squirrels often climb and live in trees.",
          },
        ],
      },
    ],
  },
  {
    title: "The Human Body",
    emoji: "🧍",
    activities: [
      {
        title: "Point to the Body Part",
        instruction: "Choose the body part that matches the emoji and clue.",
        questions: [
          {
            q: "👀 Which body part helps you see?",
            options: ["Eyes", "Ears", "Feet"],
            answer: "Eyes",
            explain: "Your eyes help you see.",
          },
          {
            q: "👂 Which body part helps you hear?",
            options: ["Nose", "Ears", "Hands"],
            answer: "Ears",
            explain: "Your ears help you hear sounds.",
          },
          {
            q: "👃 Which body part helps you smell?",
            options: ["Mouth", "Nose", "Eyes"],
            answer: "Nose",
            explain: "Your nose helps you smell.",
          },
          {
            q: "🦶 Which body part helps you stand and walk?",
            options: ["Feet", "Ears", "Teeth"],
            answer: "Feet",
            explain: "Your feet help support you when standing and walking.",
          },
        ],
      },
      {
        title: "Match the Function",
        instruction: "Choose the body part that performs each function.",
        questions: [
          {
            q: "Which body part helps you chew food and speak?",
            options: ["Mouth", "Knee", "Elbow"],
            answer: "Mouth",
            explain: "Your mouth helps you eat and speak.",
          },
          {
            q: "Which body parts help you hold a pencil?",
            options: ["Hands", "Feet", "Ears"],
            answer: "Hands",
            explain: "Your hands help you hold and handle objects.",
          },
          {
            q: "Which body part pumps blood around your body?",
            options: ["Heart", "Stomach", "Lungs"],
            answer: "Heart",
            explain: "Your heart pumps blood around your body.",
          },
        ],
      },
    ],
  },
  {
    title: "Weather",
    emoji: "☀️",
    activities: [
      {
        title: "Dress for the Weather",
        instruction: "Choose something useful for the weather shown.",
        questions: [
          {
            q: "☀️ It is sunny and bright. What could you wear?",
            options: ["Sunglasses", "Rain boots only", "Thick snow gloves"],
            answer: "Sunglasses",
            explain:
              "Sunglasses can help protect your eyes from bright sunlight.",
          },
          {
            q: "🌧️ It is raining. What should you take?",
            options: ["Umbrella", "Beach ball", "Sunglasses only"],
            answer: "Umbrella",
            explain: "An umbrella can help keep you dry in the rain.",
          },
          {
            q: "💨 The wind is strong. What should you do?",
            options: [
              "Stay away from loose branches",
              "Climb a tall tree",
              "Stand under a weak branch",
            ],
            answer: "Stay away from loose branches",
            explain:
              "Strong winds can cause branches or objects to fall.",
          },
        ],
      },
      {
        title: "Be a Weather Reporter",
        instruction: "Identify the weather shown in each picture.",
        questions: [
          {
            q: "☀️ What is the weather?",
            options: ["Sunny", "Rainy", "Cloudy"],
            answer: "Sunny",
            explain: "A bright sun represents sunny weather.",
          },
          {
            q: "🌧️ What is the weather?",
            options: ["Windy", "Rainy", "Sunny"],
            answer: "Rainy",
            explain: "Falling raindrops represent rainy weather.",
          },
          {
            q: "💨🍃 What is the weather?",
            options: ["Windy", "Snowy", "Sunny"],
            answer: "Windy",
            explain: "Moving leaves can be a sign of wind.",
          },
          {
            q: "☁️ What is the weather?",
            options: ["Cloudy", "Rainy", "Windy"],
            answer: "Cloudy",
            explain: "Clouds covering the sky represent cloudy weather.",
          },
        ],
      },
    ],
  },
  {
    title: "Matter",
    emoji: "🧊",
    activities: [
      {
        title: "Sort the Matter",
        instruction: "Choose whether each item is a solid, liquid, or gas.",
        questions: [
          {
            q: "🪨 A rock is a...",
            options: ["Solid", "Liquid", "Gas"],
            answer: "Solid",
            explain: "A rock keeps its own shape.",
          },
          {
            q: "🥛 Milk is a...",
            options: ["Gas", "Liquid", "Solid"],
            answer: "Liquid",
            explain: "Milk flows and takes the shape of its container.",
          },
          {
            q: "💨 Air is a...",
            options: ["Solid", "Liquid", "Gas"],
            answer: "Gas",
            explain: "Air is a mixture of gases.",
          },
          {
            q: "🧊 An ice cube is a...",
            options: ["Liquid", "Gas", "Solid"],
            answer: "Solid",
            explain: "An ice cube is solid water.",
          },
        ],
      },
      {
        title: "What State Is It?",
        instruction:
          "Look at the example and identify its state of matter.",
        questions: [
          {
            q: "💧 Water in a glass is a...",
            options: ["Liquid", "Solid", "Gas"],
            answer: "Liquid",
            explain: "Liquid water takes the shape of the glass.",
          },
          {
            q: "🎈 The air inside a balloon is a...",
            options: ["Gas", "Solid", "Liquid"],
            answer: "Gas",
            explain: "The air inside the balloon is a mixture of gases.",
          },
          {
            q: "🧱 A brick is a...",
            options: ["Liquid", "Gas", "Solid"],
            answer: "Solid",
            explain: "A brick keeps its shape.",
          },
        ],
      },
    ],
  },
];
