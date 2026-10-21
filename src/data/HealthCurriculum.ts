export type HealthQuestion = {
  q: string;
  options: string[];
  answer: string;
  explain: string;
};

export type HealthActivity = {
  title: string;
  instruction: string;
  questions: HealthQuestion[];
};

export type HealthLesson = {
  title: string;
  emoji: string;
  activities: HealthActivity[];
};

export const healthLessons: HealthLesson[] = [
  {
    title: "Healthy Habits",
    emoji: "🍎",
    activities: [
      {
        title: "Healthy or Unhealthy?",
        instruction: "Choose whether each habit is healthy or unhealthy.",
        questions: [
          {
            q: "🍎 Eating fruits and vegetables every day is...",
            options: ["Healthy", "Unhealthy"],
            answer: "Healthy",
            explain: "Fruits and vegetables provide vitamins and minerals.",
          },
          {
            q: "💧 Drinking water throughout the day is...",
            options: ["Unhealthy", "Healthy"],
            answer: "Healthy",
            explain: "Water helps your body work properly.",
          },
          {
            q: "🍬 Eating sweets all day instead of balanced meals is...",
            options: ["Healthy", "Unhealthy"],
            answer: "Unhealthy",
            explain: "Too many sweets cannot replace balanced meals.",
          },
          {
            q: "😴 Getting enough sleep each night is...",
            options: ["Healthy", "Unhealthy"],
            answer: "Healthy",
            explain: "Sleep helps children grow, learn, and feel rested.",
          },
          {
            q: "🪥 Brushing your teeth every day is...",
            options: ["Healthy", "Unhealthy"],
            answer: "Healthy",
            explain: "Brushing your teeth helps keep them clean.",
          },
        ],
      },
      {
        title: "Build My Healthy Day",
        instruction: "Choose the best answer about a healthy daily routine.",
        questions: [
          {
            q: "🌞 What is a good thing to do after waking up?",
            options: ["Brush your teeth", "Skip all hygiene", "Stay up all night"],
            answer: "Brush your teeth",
            explain: "Brushing your teeth is an important daily habit.",
          },
          {
            q: "🥣 What is a healthy breakfast choice?",
            options: [
              "A balanced breakfast",
              "Only candy",
              "No food every morning",
            ],
            answer: "A balanced breakfast",
            explain: "A balanced breakfast gives your body energy.",
          },
          {
            q: "🏃 What should you include in your day?",
            options: [
              "Safe physical activity",
              "No movement at all",
              "Playing without breaks forever",
            ],
            answer: "Safe physical activity",
            explain:
              "Physical activity helps keep your body strong and active.",
          },
          {
            q: "🌙 What helps your body rest at night?",
            options: ["Enough sleep", "Playing all night", "Skipping sleep"],
            answer: "Enough sleep",
            explain:
              "A regular bedtime and enough sleep support growth and learning.",
          },
        ],
      },
    ],
  },
  {
    title: "Exercise and Movement",
    emoji: "🏃",
    activities: [
      {
        title: "Move Like an Animal",
        instruction: "Choose the movement that matches each animal.",
        questions: [
          {
            q: "🐰 How can you move like a rabbit?",
            options: ["Hop safely", "Lie still", "Spin very fast"],
            answer: "Hop safely",
            explain:
              "Rabbit hops are a fun way to practice movement. Make sure you have space.",
          },
          {
            q: "🐈 How can you stretch like a cat?",
            options: [
              "Stretch your arms gently",
              "Hold your breath",
              "Jump off furniture",
            ],
            answer: "Stretch your arms gently",
            explain: "Gentle stretching helps your body move comfortably.",
          },
          {
            q: "🐧 How can you walk like a penguin?",
            options: [
              "Take small waddling steps",
              "Run into people",
              "Close your eyes and walk",
            ],
            answer: "Take small waddling steps",
            explain: "Small steps are a safe way to imitate a penguin.",
          },
          {
            q: "🐦 How can you imitate a bird?",
            options: [
              "Flap your arms gently",
              "Throw objects",
              "Climb a high wall",
            ],
            answer: "Flap your arms gently",
            explain: "Gentle arm movements are a fun activity.",
          },
        ],
      },
      {
        title: "Exercise Action Match",
        instruction: "Choose the benefit of each physical activity.",
        questions: [
          {
            q: "🏃 Running and jogging can help improve...",
            options: ["Stamina", "Hearing only", "Hair color"],
            answer: "Stamina",
            explain: "Running can help improve your stamina and fitness.",
          },
          {
            q: "🤸 Gentle stretching helps improve...",
            options: ["Flexibility", "Height instantly", "Memory instantly"],
            answer: "Flexibility",
            explain:
              "Stretching helps your body move through a comfortable range.",
          },
          {
            q: "💃 Dancing helps develop...",
            options: ["Coordination", "Tooth growth", "Eye color"],
            answer: "Coordination",
            explain: "Dancing helps you coordinate your movements.",
          },
          {
            q: "🚶 Walking is a way to...",
            options: [
              "Keep your body active",
              "Avoid all movement",
              "Replace sleep",
            ],
            answer: "Keep your body active",
            explain: "Walking is a simple way to be physically active.",
          },
        ],
      },
    ],
  },
  {
    title: "Safety and Wellness",
    emoji: "🛡️",
    activities: [
      {
        title: "What Should You Do?",
        instruction: "Choose the safest action for each situation.",
        questions: [
          {
            q: "💧 The floor is wet. What should you do?",
            options: [
              "Walk carefully and tell an adult",
              "Run across it",
              "Slide on the floor",
            ],
            answer: "Walk carefully and tell an adult",
            explain:
              "Wet floors can be slippery. Alerting an adult helps prevent accidents.",
          },
          {
            q: "🚦 You need to cross a road. What should you do?",
            options: [
              "Use a safe crossing and follow traffic signals",
              "Run between moving cars",
              "Cross without looking",
            ],
            answer: "Use a safe crossing and follow traffic signals",
            explain:
              "Use designated crossings and follow traffic rules with adult guidance when needed.",
          },
          {
            q: "🧑 You do not know someone who asks you to go with them. What should you do?",
            options: [
              "Go with them alone",
              "Stay in a safe place and tell a trusted adult",
              "Keep it a secret",
            ],
            answer: "Stay in a safe place and tell a trusted adult",
            explain:
              "You can always ask a trusted adult for help if you feel unsafe.",
          },
          {
            q: "🩹 A classmate gets hurt. What should you do?",
            options: [
              "Tell a teacher or trusted adult",
              "Ignore the injury",
              "Try a treatment you do not know",
            ],
            answer: "Tell a teacher or trusted adult",
            explain:
              "An adult can help the injured person get appropriate care.",
          },
        ],
      },
      {
        title: "Safety Detective",
        instruction: "Find the unsafe situation and choose the safest response.",
        questions: [
          {
            q: "🧸 Toys are scattered across the stairs. What should happen?",
            options: [
              "Tell an adult and clear the path safely",
              "Jump over the toys",
              "Leave more toys there",
            ],
            answer: "Tell an adult and clear the path safely",
            explain: "Objects on stairs can cause trips and falls.",
          },
          {
            q: "🔌 You see an exposed electrical wire. What should you do?",
            options: [
              "Touch it carefully",
              "Stay away and tell an adult",
              "Pour water on it",
            ],
            answer: "Stay away and tell an adult",
            explain: "Exposed wires can cause electric shock. Never touch them.",
          },
          {
            q: "🧴 You find an unknown cleaning liquid. What should you do?",
            options: [
              "Taste it",
              "Play with it",
              "Leave it alone and tell an adult",
            ],
            answer: "Leave it alone and tell an adult",
            explain:
              "Cleaning products can be dangerous if touched, swallowed, or inhaled.",
          },
          {
            q: "🌳 There is a broken branch hanging above the playground. What should you do?",
            options: [
              "Climb it",
              "Stay away and tell an adult",
              "Shake the tree",
            ],
            answer: "Stay away and tell an adult",
            explain: "Damaged branches can fall and cause injuries.",
          },
        ],
      },
    ],
  },
  {
    title: "Personal Hygiene",
    emoji: "🧼",
    activities: [
      {
        title: "Hygiene Routine",
        instruction: "Choose the correct hygiene practice.",
        questions: [
          {
            q: "🧼 What should you use when washing your hands?",
            options: ["Soap and clean running water", "Dirt", "Paint"],
            answer: "Soap and clean running water",
            explain: "Soap and running water help remove germs and dirt.",
          },
          {
            q: "🪥 How often should you brush your teeth?",
            options: ["Twice a day", "Once a month", "Only when they hurt"],
            answer: "Twice a day",
            explain:
              "Brushing twice daily with fluoride toothpaste helps protect your teeth.",
          },
          {
            q: "🛁 What should you do after getting sweaty and dirty?",
            options: [
              "Clean your body and change into clean clothes",
              "Stay dirty",
              "Wear the same wet clothes forever",
            ],
            answer: "Clean your body and change into clean clothes",
            explain:
              "Bathing and clean clothes help you stay comfortable and clean.",
          },
          {
            q: "🤧 What should you do when coughing or sneezing?",
            options: [
              "Cover with a tissue or your elbow",
              "Cough toward other people",
              "Wipe your nose on someone else's clothes",
            ],
            answer: "Cover with a tissue or your elbow",
            explain:
              "Covering coughs and sneezes helps reduce the spread of germs.",
          },
        ],
      },
      {
        title: "When Should I Wash My Hands?",
        instruction: "Choose the times when washing your hands is important.",
        questions: [
          {
            q: "🍽️ Before eating a meal, should you wash your hands?",
            options: ["Yes", "No"],
            answer: "Yes",
            explain:
              "Clean hands help prevent germs from getting onto your food.",
          },
          {
            q: "🚽 After using the toilet, should you wash your hands?",
            options: ["No", "Yes"],
            answer: "Yes",
            explain:
              "Always wash your hands with soap and water after using the toilet.",
          },
          {
            q: "⚽ After playing outside, should you wash your hands?",
            options: ["Yes", "No"],
            answer: "Yes",
            explain: "Your hands may collect dirt and germs while playing.",
          },
          {
            q: "🤧 After blowing your nose, should you wash your hands?",
            options: ["No", "Yes"],
            answer: "Yes",
            explain: "Handwashing after blowing your nose helps remove germs.",
          },
        ],
      },
    ],
  },
];
