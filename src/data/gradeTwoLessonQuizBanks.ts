import type { LessonDifficulty, QuizQuestion } from "./gradeTwoQuizBanks";
import type { GradeTwoMiniGameId } from "../components/GradeTwoMiniGames";

type RawQuestion = { id?: number; question: string; options: string[]; answer: number | string };
type Bank = Record<LessonDifficulty, QuizQuestion[]>;

const build = (questions: RawQuestion[]): QuizQuestion[] => questions.map(({ question, options, answer }) => {
  const answerText = typeof answer === "number" ? options[answer] : answer;
  if (!answerText || !options.includes(answerText)) {
    throw new Error(`Invalid answer for quiz question: ${question}`);
  }

  return {
    prompt: question,
    options,
    answer: answerText,
    hint: "Read the question and look for a clue in the choices.",
    explanation: `The correct answer is ${answerText}.`,
  };
});

const normalizeBank = (bank: Record<LessonDifficulty, RawQuestion[]>): Bank => ({
  easy: build(bank.easy),
  standard: build(bank.standard),
  challenge: build(bank.challenge),
});

export const clueDetectiveQuestions: Bank = normalizeBank({
  easy: [
    {
      id: 1,
      question: "In a sunny garden in Laguna, a tiny ant worked hard all day. Where does this story take place?",
      options: ["In a sunny garden in Laguna", "Inside a kitchen", "On a busy highway", "At a beach"],
      answer: 0
    },
    {
      id: 2,
      question: "Mang Juan carefully harvested sweet mangoes from his orchard. Who is the main character?",
      options: ["The sweet mangoes", "Mang Juan", "The orchard", "A basket"],
      answer: "Mang Juan"
    },
    {
      id: 3,
      question: "What story element answers the question 'WHERE and WHEN does the story happen?'",
      options: ["Plot", "Character", "Setting", "Moral"],
      answer: "Setting"
    },
    {
      id: 4,
      question: "At midnight, the quiet library came to life. When does this story happen?",
      options: ["At morning", "At noon", "At midnight", "In the afternoon"],
      answer: "At midnight"
    },
    {
      id: 5,
      question: "Kiko the monkey loved swinging from mahogany branches. Who is Kiko?",
      options: ["A bird", "A monkey", "A tree", "A boy"],
      answer: "A monkey"
    },
    {
      id: 6,
      question: "Under the deep blue ocean, a shiny blue fish lost its favorite pearl. What is the setting?",
      options: ["Deep blue ocean", "On a mountain", "In a fish tank", "At a riverbank"],
      answer: "Deep blue ocean"
    },
    {
      id: 7,
      question: "Which of the following is a CHARACTER?",
      options: ["A stormy night", "A brave young police officer", "A small nipa hut", "School playground"],
      answer: "A brave young police officer"
    },
    {
      id: 8,
      question: "During a rainy Monday morning, Class 2-A sat together to read. What is the time setting?",
      options: ["Rainy Monday morning", "Sunny Sunday afternoon", "Saturday night", "Summer holiday"],
      answer: "Rainy Monday morning"
    },
    {
      id: 9,
      question: "Little Maya found a lost puppy near the barangay hall. Who are the characters?",
      options: ["Maya and the barangay hall", "Maya and the lost puppy", "Only the puppy", "The barangay captain only"],
      answer: "Maya and the lost puppy"
    },
    {
      id: 10,
      question: "Which clue word tells you about a SETTING?",
      options: ["Wise", "Friendly", "In the forest", "Jumped"],
      answer: "In the forest"
    }
  ],
  standard: [
    {
      id: 11,
      question: "In a small barrio near Mayon Volcano, Arnel helped his father tend to their carabao every evening. Identify BOTH the character and setting.",
      options: ["Arnel; small barrio near Mayon Volcano in the evening", "Carabao; in the city at noon", "Father; inside a jeepney", "Arnel; in a school during morning"],
      answer: "Arnel; small barrio near Mayon Volcano in the evening"
    },
    {
      id: 12,
      question: "The old clock struck twelve in the dusty attic, and the wooden doll opened her eyes. What is the setting clue?",
      options: ["The wooden doll", "Opened her eyes", "Dusty attic at twelve o'clock", "Struck twelve"],
      answer: "Dusty attic at twelve o'clock"
    },
    {
      id: 13,
      question: "Teacher Liza picked up her chalk and smiled at her students in Classroom 2-B. What setting clue tells us what room they are in?",
      options: ["Teacher Liza", "Smiles at students", "Classroom 2-B", "Picked up chalk"],
      answer: "Classroom 2-B"
    },
    {
      id: 14,
      question: "On a cold December night in Baguio, Miguel wrapped a thick red scarf around his neck. What details show the setting?",
      options: ["Miguel and his scarf", "Cold December night in Baguio", "Wrapped a scarf", "Thick red scarf"],
      answer: "Cold December night in Baguio"
    },
    {
      id: 15,
      question: "A clever little mouse named Pip tricked the big sleeping farm cat. Who is the hero character?",
      options: ["The big sleeping farm cat", "Pip, the clever mouse", "The farm owner", "A barn"],
      answer: "Pip, the clever mouse"
    },
    {
      id: 16,
      question: "In the middle of the crowded Manila market, Ana held her mother's hand tightly. Where are they?",
      options: ["At a quiet beach", "In a crowded Manila market", "Inside a school bus", "On a farm"],
      answer: "In a crowded Manila market"
    },
    {
      id: 17,
      question: "Old Tito built wooden toys for the neighborhood children every weekend. What character trait describes Tito?",
      options: ["Greedy", "Kind and generous", "Lazy", "Angry"],
      answer: "Kind and generous"
    },
    {
      id: 18,
      question: "As lightning flashed across the night sky, Lando guided the lost stray dog into his porch. What is the time setting?",
      options: ["A bright sunny morning", "A stormy night", "At noon", "In the afternoon"],
      answer: "A stormy night"
    },
    {
      id: 19,
      question: "Sammy swept the yard without being asked by his grandmother. Sammy is...",
      options: ["Helpful", "Noisy", "Selfish", "Clumsy"],
      answer: "Helpful"
    },
    {
      id: 20,
      question: "At the edge of the quiet pine forest, a small brown owl watched the moon. Who is the setting and character?",
      options: ["Owl; pine forest at night", "Forest; a frog", "Moon; a bear", "Owl; in a cage"],
      answer: "Owl; pine forest at night"
    }
  ],
  challenge: [
    {
      id: 21,
      question: "The coconut trees swayed wildly under the dark, howling sky as sea waves crashed against the shore. What can you infer about the setting?",
      options: ["A quiet summer afternoon at the park", "A windy typhoon night at the beach", "A sunny day in the city center", "A cold morning on a mountain"],
      answer: "A windy typhoon night at the beach"
    },
    {
      id: 22,
      question: "Though small and slow, Turtle Tito insisted on racing Flash the Rabbit across the dusty field. How would you describe Turtle Tito?",
      options: ["Lazy and fearful", "Determined and brave", "Mean and selfish", "Forgetful"],
      answer: "Determined and brave"
    },
    {
      id: 23,
      question: "Inside the dim sari-sari store, Aling Nena counted coins by a kerosene lamp. Why is the lamp an important setting detail?",
      options: ["It shows it is daytime outside", "It shows the store is dark/without electricity", "It shows she is rich", "It shows she sells clothes"],
      answer: "It shows the store is dark/without electricity"
    },
    {
      id: 24,
      question: "Which detail from a story BEST helps us understand the hero's true character?",
      options: ["The color of their house", "How they treat someone in need", "The time of day the story starts", "The weather conditions"],
      answer: "How they treat someone in need"
    },
    {
      id: 25,
      question: "High up in the Sierra Madre mountains, an endangered Philippine Eagle guarded her single egg from strong winds. Who and where is she?",
      options: ["Philippine Eagle; Sierra Madre mountains", "A farmer; in a rice field", "A hunter; in a city zoo", "A parrot; at the pet shop"],
      answer: "Philippine Eagle; Sierra Madre mountains"
    },
    {
      id: 26,
      question: "Despite having only one small sandwich left, Marco cut it in half to give to his hungry friend. Marco shows he is...",
      options: ["Selfless and compassionate", "Greedy and proud", "Fearful", "Forgetful"],
      answer: "Selfless and compassionate"
    },
    {
      id: 27,
      question: "The ancient stone lighthouse stood tall on the cliff edge as dark storm clouds rolled in from the horizon. What feeling does this setting create?",
      options: ["Cozy and warm", "Mysterious and dramatic", "Funny and silly", "Boring"],
      answer: "Mysterious and dramatic"
    },
    {
      id: 28,
      question: "Lina practiced her violin for three hours every day after school until her fingers ached. What trait does Lina demonstrate?",
      options: ["Impatience", "Dedication and discipline", "Laziness", "Dishonesty"],
      answer: "Dedication and discipline"
    },
    {
      id: 29,
      question: "Deep inside the cool, glowing limestone cave of Palawan, bats hung silently from stalactites. What is the setting?",
      options: ["A sunny rice field", "Cool, glowing cave in Palawan", "A noisy highway", "A busy classroom"],
      answer: "Cool, glowing cave in Palawan"
    },
    {
      id: 30,
      question: "When the stray kitten fell into the shallow ditch, Bea carefully climbed down to rescue it despite ruining her new dress. Bea is...",
      options: ["Caring and courageous", "Foolish and mean", "Lazy", "Tired"],
      answer: "Caring and courageous"
    }
  ]
});
export const storySqueezeQuestions: Bank = {
  easy: build([
    {
      id: 1,
      question: "Maya put a seed in the dirt. Next, she watered it. Finally, a tiny green sprout appeared. What happened first?",
      options: ["A sprout appeared", "Maya watered it", "Maya planted the seed", "Maya picked a flower"],
      answer: 2
    },
    {
      id: 2,
      question: "Leo woke up, brushed his teeth, and then ate his breakfast. What did Leo do right before eating breakfast?",
      options: ["Ate lunch", "Brushed his teeth", "Went to sleep", "Played outside"],
      answer: 1
    },
    {
      id: 3,
      question: "First, Ben got paper. Second, he drew a dog. Third, he colored it yellow. What was the last thing Ben did?",
      options: ["Colored it yellow", "Got the paper", "Drew a cat", "Folded the paper"],
      answer: 0
    },
    {
      id: 4,
      question: "What word shows something happened at the beginning of a story?",
      options: ["Finally", "First", "Last", "End"],
      answer: 1
    },
    {
      id: 5,
      question: "Sarah put on her socks. Then, she tied her shoes. What did she do first?",
      options: ["Ran outside", "Tied her shoes", "Put on her socks", "Took off her shoes"],
      answer: 2
    },
    {
      id: 6,
      question: "The cat climbed a tree. It got stuck. A fireman rescued it. What is the middle event?",
      options: ["The cat got stuck", "The cat slept", "The fireman rescued it", "The cat jumped down"],
      answer: 0
    },
    {
      id: 7,
      question: "First, water the rice. Next, cook it in the pot. Last, serve it on a plate. What is step 2?",
      options: ["Serve on a plate", "Buy the rice", "Cook it in the pot", "Water the rice"],
      answer: 2
    },
    {
      id: 8,
      question: "Ana washed her hands, ate dinner, and wiped the table clean. What did Ana do after eating dinner?",
      options: ["Cooked food", "Washed her hands", "Wiped the table clean", "Slept"],
      answer: 2
    },
    {
      id: 9,
      question: "Which transition word tells us the story is coming to a close?",
      options: ["Next", "Suddenly", "Finally", "Then"],
      answer: 2
    },
    {
      id: 10,
      question: "The bird built a nest, laid eggs, and waited for them to hatch. What happened right after building the nest?",
      options: ["The eggs hatched", "Laid eggs", "Flew away", "Ate worms"],
      answer: 1
    }
  ]),
  standard: build([
    {
      id: 11,
      question: "Lito lost his slipper in the river. He searched everywhere along the bank. Finally, his big brother spotted it caught in some bamboo. Which event happens immediately after Lito loses his slipper?",
      options: ["His brother finds it", "He searches along the bank", "He buys new slippers", "He goes swimming"],
      answer: 1
    },
    {
      id: 12,
      question: "The rain poured heavily. The streets flooded within an hour. Soon, all the Jeepneys had to stop moving. What caused the Jeepneys to stop?",
      options: ["They ran out of gas", "The streets flooded from heavy rain", "The driver got tired", "The sun was too bright"],
      answer: 1
    },
    {
      id: 13,
      question: "Put these steps in order: (1) Bake the cake, (2) Mix the flour and eggs, (3) Put icing on top.",
      options: ["1, 2, 3", "2, 1, 3", "3, 2, 1", "2, 3, 1"],
      answer: 1
    },
    {
      id: 14,
      question: "Carla packed her bag, walked to school, and sat at her desk just as the bell rang. What happened right before Carla sat at her desk?",
      options: ["She packed her bag", "She walked to school", "The bell rang", "She ate lunch"],
      answer: 1
    },
    {
      id: 15,
      question: "The egg cracked open. A wet duckling poked its head out. After a few minutes, it shook its feathers dry. What is the final step described?",
      options: ["The egg cracked", "The duckling petted a dog", "It pokes its head out", "It shook its feathers dry"],
      answer: 3
    },
    {
      id: 16,
      question: "Grandma mixed cassava and coconut milk. She wrapped the mixture in banana leaves and steamed it for an hour. When it cooled, she sliced the delicious bibingka. What did she do right before slicing it?",
      options: ["Wrapping in banana leaves", "Mixing ingredients", "Steaming for an hour", "Letting it cool"],
      answer: 2
    },
    {
      id: 17,
      question: "The fishermen pulled their nets at dawn, found them empty, and shifted to deeper waters. By noon, their baskets overflowed. What was the turning point?",
      options: ["Pulling empty nets", "Moving to deeper waters", "Eating lunch", "Going home"],
      answer: 1
    },
    {
      id: 18,
      question: "Order these butterfly life cycle steps: (P) Caterpillar spins cocoon, (Q) Butterfly spreads wings, (R) Caterpillar hatches from egg.",
      options: ["R -> P -> Q", "P -> R -> Q", "Q -> P -> R", "R -> Q -> P"],
      answer: 0
    },
    {
      id: 19,
      question: "Jia preheated the oven, stirred the batter, poured it into the pan, and baked it for 30 minutes. If she frosts it immediately after stirring, what step did she skip?",
      options: ["Cooling the cake", "Baking and cooling", "Pouring into the pan", "Preheating"],
      answer: 1
    },
    {
      id: 20,
      question: "Before Pedro can play basketball, he must finish homework and clean his room. He cleans his room first, then completes his math. What can Pedro do now?",
      options: ["Clean again", "Go play basketball", "Do more homework", "Sleep"],
      answer: 1
    }
  ]),
  challenge: build([
    {
      id: 21,
      question: "Read: 'The coconut trees swayed wildly under the dark sky as sea waves crashed against the shore.' What can you infer about the setting?",
      options: ["A quiet summer afternoon at the park", "A windy typhoon night at the beach", "A sunny day in the city center", "A cold morning on a mountain"],
      answer: 1
    },
    {
      id: 22,
      question: "Though small and slow, Turtle Tito insisted on racing Flash the Rabbit across the dusty field. How would you describe Tito?",
      options: ["Lazy and fearful", "Determined and brave", "Mean and selfish", "Forgetful"],
      answer: 1
    },
    {
      id: 23,
      question: "Inside the dim sari-sari store, Aling Nena counted coins by a kerosene lamp. Why is the lamp an important detail?",
      options: ["It shows it is daytime outside", "It shows the store is dark/without electricity", "It shows she is rich", "It shows she sells clothes"],
      answer: 1
    },
    {
      id: 24,
      question: "Which story detail BEST helps us understand a hero's true character?",
      options: ["The color of their house", "How they treat someone in need", "The time of day", "The weather"],
      answer: 1
    },
    {
      id: 25,
      question: "High up in the Sierra Madre, an endangered Philippine Eagle guarded her single egg from strong winds. Where is she?",
      options: ["Sierra Madre mountains", "Rice field", "City zoo", "Pet shop"],
      answer: 0
    },
    {
      id: 26,
      question: "Santi saw his best friend playing with someone else and turned his back, frowning. What is Santi feeling?",
      options: ["Jealousy", "Relief", "Pure joy", "Fear"],
      answer: 0
    },
    {
      id: 27,
      question: "Despite tripping in front of the class, Maria stood right back up, smiled, and finished her report. What trait does she show?",
      options: ["Embarrassed and giving up", "Resilient and confident", "Angry", "Scared"],
      answer: 1
    },
    {
      id: 28,
      question: "Mang Tomas looked at the dry, cracked soil of his rice field and sighed heavily. What is he feeling?",
      options: ["Worried and hopeless", "Excited for rain", "Thrilled", "Amused"],
      answer: 0
    },
    {
      id: 29,
      question: "Nico held his breath as he placed the final wooden block on top of his 5-foot tower. Nico is feeling...",
      options: ["Focused and tense", "Bored", "Loud", "Angry"],
      answer: 0
    },
    {
      id: 30,
      question: "When her little brother took his first steps, Ate Bea clapped, grinned, and hugged him. Bea is feeling...",
      options: ["Overjoyed", "Confused", "Jealous", "Anxious"],
      answer: 0
    }
  ])
};

export const emotionEchoQuestions: Bank = {
  easy: build([
    {
      id: 1,
      question: "Mark received a shiny new bicycle for his birthday! How does Mark feel?",
      options: ["Angry", "Happy", "Sad", "Scared"],
      answer: 1
    },
    {
      id: 2,
      question: "Lina's ice cream scoop fell onto the dirty sidewalk. How does Lina feel?",
      options: ["Excited", "Sad", "Proud", "Sleepy"],
      answer: 1
    },
    {
      id: 3,
      question: "A loud burst of thunder shook the dark bedroom window. How does little Timmy feel?",
      options: ["Scared", "Happy", "Hungry", "Silly"],
      answer: 0
    },
    {
      id: 4,
      question: "Carlo worked hard and scored 100 on his spelling test. How does Carlo feel?",
      options: ["Embarrassed", "Proud", "Jealous", "Bored"],
      answer: 1
    },
    {
      id: 5,
      question: "Ben's little sister broke his favorite toy race car on purpose. How does Ben feel?",
      options: ["Mad / Angry", "Calm", "Happy", "Surprised"],
      answer: 0
    },
    {
      id: 6,
      question: "Tina yawned and rubbed her eyes while looking at her bed. How does Tina feel?",
      options: ["Energetic", "Tired / Sleepy", "Scared", "Surprised"],
      answer: 1
    },
    {
      id: 7,
      question: "Rex hid behind his mother when the big dog barked loudly. Rex feels...",
      options: ["Brave", "Afraid", "Excited", "Joyful"],
      answer: 1
    },
    {
      id: 8,
      question: "Ella opened a mystery gift box and saw a cute puppy inside! Ella feels...",
      options: ["Surprised and happy", "Angry and sad", "Bored", "Tired"],
      answer: 0
    },
    {
      id: 9,
      question: "Joy smiles broadly and dances around the living room. Joy feels...",
      options: ["Sad", "Excited", "Sick", "Upset"],
      answer: 1
    },
    {
      id: 10,
      question: "Paolo stomped his feet and crossed his arms tightly. Paolo feels...",
      options: ["Upset / Frustrated", "Peaceful", "Sleepy", "Generous"],
      answer: 0
    }
  ]),
  standard: build([
    {
      id: 11,
      question: "Gino took a deep breath, stepped onto the stage, and saw hundreds of eyes staring at him. His hands started to shake. Gino feels...",
      options: ["Nervous", "Proud", "Angry", "Bored"],
      answer: 0
    },
    {
      id: 12,
      question: "Rita shared half of her warm bibingka with a classmate who had no lunch. Rita is being...",
      options: ["Greedy", "Kind and caring", "Jealous", "Fearful"],
      answer: 1
    },
    {
      id: 13,
      question: "Donnie looked at his broken artwork, lowered his head, and wiped a tear from his cheek. How does Donnie feel?",
      options: ["Heartbroken / Sad", "Excited", "Nervous", "Amused"],
      answer: 0
    },
    {
      id: 14,
      question: "When the teacher praised Lea's reading out loud, Lea blushed and covered her smiling face. Lea feels...",
      options: ["Terrified", "Shy but happy", "Angry", "Sleepy"],
      answer: 1
    },
    {
      id: 15,
      question: "Marco kept looking at the clock every two seconds while waiting for the school bus to arrive for the field trip. Marco feels...",
      options: ["Impatient and eager", "Calm and relaxed", "Sad", "Disappointed"],
      answer: 0
    },
    {
      id: 16,
      question: "Ate Jenny spent all evening building a cardboard castle, but her baby brother knocked it over. Jenny feels...",
      options: ["Frustrated and upset", "Joyful", "Sleepy", "Carefree"],
      answer: 0
    },
    {
      id: 17,
      question: "During the thunderstorm, the lights went out suddenly. Little Pepe clutched his teddy bear tightly. Pepe feels...",
      options: ["Anxious and frightened", "Angry", "Playful", "Proud"],
      answer: 0
    },
    {
      id: 18,
      question: "Kiko won first place in the school art contest. He held his trophy high with a huge grin. Kiko feels...",
      options: ["Extremely proud", "Embarrassed", "Disappointed", "Lonely"],
      answer: 0
    },
    {
      id: 19,
      question: "Maya sat alone on the bench during recess, watching her friends play tag without calling her. Maya feels...",
      options: ["Left out and lonely", "Excited", "Angry", "Brave"],
      answer: 0
    },
    {
      id: 20,
      question: "When Mang Cardo saw his lost dog walking back through the gate after three days, tears of joy filled his eyes. He felt...",
      options: ["Relieved and happy", "Angry", "Scared", "Bored"],
      answer: 0
    }
  ]),
  challenge: build([
    {
      id: 21,
      question: "Santi saw his best friend playing with someone else and turned his back, frowning while holding his ball tightly. What emotion is Santi experiencing?",
      options: ["Jealousy", "Great relief", "Pure joy", "Fear"],
      answer: 0
    },
    {
      id: 22,
      question: "Despite tripping in front of the class, Maria stood right back up, dusted off her knees, smiled, and finished her report. What trait does Maria show?",
      options: ["Embarrassed and giving up", "Resilient and confident", "Angry at her teacher", "Scared of her friends"],
      answer: 1
    },
    {
      id: 23,
      question: "Mang Tomas looked at the dry, cracked soil of his rice field and sighed heavily while looking up at the cloudless sky. What is Mang Tomas feeling?",
      options: ["Worried and hopeless", "Excited for rain", "Thrilled and satisfied", "Amused"],
      answer: 0
    },
    {
      id: 24,
      question: "Nico held his breath as he placed the final wooden block on top of his 5-foot tower. Nico is feeling...",
      options: ["Focused and tense", "Bored and sleepy", "Loud and rowdy", "Angry"],
      answer: 0
    },
    {
      id: 25,
      question: "When her little brother took his first steps, Ate Bea clapped her hands, grinned from ear to ear, and hugged him. What emotion best describes Bea?",
      options: ["Overjoyed", "Confused", "Jealous", "Anxious"],
      answer: 0
    },
    {
      id: 26,
      question: "Leo practiced his speech all week. When his name was called, his heart pounded, but he stood tall and spoke clearly. Leo felt...",
      options: ["Determined despite being nervous", "Too lazy to speak", "Angry at his class", "Careless"],
      answer: 0
    },
    {
      id: 27,
      question: "After working together for hours, Class 2-B finished their giant mural. They all stood back and clapped. The students felt...",
      options: ["Satisfied and accomplished", "Bored and sleepy", "Angry", "Scared"],
      answer: 0
    },
    {
      id: 28,
      question: "Carla accidentally spilled juice on her teacher's desk. She bowed her head, whispered an apology, and offered to clean it up. Carla felt...",
      options: ["Remorseful and responsible", "Proud and boastful", "Happy and amused", "Bored"],
      answer: 0
    },
    {
      id: 29,
      question: "The little bird stood at the edge of the nest, flapped its wings hesitantly, then took its very first leap into the air. The bird was...",
      options: ["Hesitant yet brave", "Lazy and indifferent", "Angry at the sky", "Sleepy"],
      answer: 0
    },
    {
      id: 30,
      question: "When the power returned after two days of blackouts during the typhoon, the whole family cheered and laughed together. They felt...",
      options: ["Relieved and joyful", "Disappointed", "Scared", "Annoyed"],
      answer: 0
    }
  ])
};
export const bookExplorerQuestions: Bank = {
  easy: build([
    {
      id: 1,
      question: "Which part of the book protects the pages inside and shows the title and author?",
      options: ["Cover", "Index", "Page Number", "Glossary"],
      answer: 0
    },
    {
      id: 2,
      question: "Where do you look at the very beginning of a book to see a list of chapter names and page numbers?",
      options: ["Table of Contents", "Glossary", "Back Cover", "Title Page"],
      answer: 0
    },
    {
      id: 3,
      question: "Who is the person that writes the words in a storybook?",
      options: ["Author", "Illustrator", "Publisher", "Reader"],
      answer: 0
    },
    {
      id: 4,
      question: "Who is the person that draws or paints the pictures in a book?",
      options: ["Illustrator", "Author", "Editor", "Printer"],
      answer: 0
    },
    {
      id: 5,
      question: "What do we call the name of a story or book?",
      options: ["Title", "Heading", "Caption", "Label"],
      answer: 0
    },
    {
      id: 6,
      question: "What is the outside edge or edge binding that holds all the book pages together?",
      options: ["Spine", "Corner", "Cover", "Index"],
      answer: 0
    },
    {
      id: 7,
      question: "What short text written under a picture explains what is happening in that picture?",
      options: ["Caption", "Title", "Heading", "Glossary"],
      answer: 0
    },
    {
      id: 8,
      question: "Where can you find the meaning of difficult words at the back of a textbook?",
      options: ["Glossary", "Table of Contents", "Front Cover", "Title Page"],
      answer: 0
    },
    {
      id: 9,
      question: "Which feature tells you exactly what page you are currently reading?",
      options: ["Page Number", "Title", "Caption", "Author"],
      answer: 0
    },
    {
      id: 10,
      question: "If you want to know what a specific section of a chapter is about, what short title above the paragraph should you read?",
      options: ["Heading / Subheading", "Index", "Glossary", "Spine"],
      answer: 0
    }
  ]),
  standard: build([
    {
      id: 11,
      question: "You want to quickly check if a book about animals mentions 'Carabao'. Which section at the very back of the book lists topics alphabetically with page numbers?",
      options: ["Index", "Table of Contents", "Glossary", "Title Page"],
      answer: 0
    },
    {
      id: 12,
      question: "Why do non-fiction authors use bold text or italic text for certain words?",
      options: ["To show that the word is important or new", "To make the book longer", "Because they ran out of normal ink", "To make it harder to read"],
      answer: 0
    },
    {
      id: 13,
      question: "Look at the Table of Contents: Chapter 1: Plants (pg. 4), Chapter 2: Animals (pg. 12), Chapter 3: Weather (pg. 20). On what page does the section about Weather start?",
      options: ["Page 20", "Page 12", "Page 4", "Page 1"],
      answer: 0
    },
    {
      id: 14,
      question: "What text feature is a drawing or diagram that has lines pointing to parts with names (e.g., parts of a flower)?",
      options: ["Labeled Diagram", "Glossary", "Table of Contents", "Title Page"],
      answer: 0
    },
    {
      id: 15,
      question: "What information is usually printed on the Title Page inside the book?",
      options: ["Book title, author, illustrator, and publisher", "The whole story plot summary", "Alphabetical index of words", "List of all readers"],
      answer: 0
    },
    {
      id: 16,
      question: "How does a Glossary differ from a regular dictionary?",
      options: ["It only defines specific words used inside that specific book", "It defines every word in the English language", "It only has pictures without definitions", "It gives chapter page numbers only"],
      answer: 0
    },
    {
      id: 17,
      question: "If you are standing in a library looking at books on a shelf, which part of the book is visible and shows the title?",
      options: ["Spine", "Back cover", "Glossary", "Title Page"],
      answer: 0
    },
    {
      id: 18,
      question: "What type of chart or table organizes facts into rows and columns for quick reading?",
      options: ["Data Table / Chart", "Illustration", "Glossary", "Table of Contents"],
      answer: 0
    },
    {
      id: 19,
      question: "What text feature helps you locate real places mentioned in a history or science book?",
      options: ["Map", "Glossary", "Spine", "Index"],
      answer: 0
    },
    {
      id: 20,
      question: "Where on a book would you typically read a short summary or review to decide if you want to read it?",
      options: ["Back Cover", "Title Page", "Glossary", "Index"],
      answer: 0
    }
  ]),
  challenge: build([
    {
      id: 21,
      question: "How does the Table of Contents help a reader read more efficiently?",
      options: ["It lets the reader jump directly to a specific chapter without flipping through every page", "It explains the definition of hard words", "It shows all the pictures in the book", "It tells you who bought the book"],
      answer: 0
    },
    {
      id: 22,
      question: "A science page shows a photo of Mayon Volcano and a small box next to it showing a zoomed-in view of the volcano's crater. What is this zoomed-in box called?",
      options: ["Inset Photograph / Magnified View", "Glossary", "Table of Contents", "Spine"],
      answer: 0
    },
    {
      id: 23,
      question: "If you want to know what a word in bold means while reading a science lesson, what is the best order of steps?",
      options: ["Check the Glossary at the back, or read surrounding context clues", "Close the book immediately", "Skip the word completely", "Go to the Table of Contents"],
      answer: 0
    },
    {
      id: 24,
      question: "What is the primary difference between a Table of Contents and an Index?",
      options: ["Contents is at the front in chapter order; Index is at the back in alphabetical order", "Contents is alphabetical; Index is by chapter", "Contents lists hard words; Index gives book price", "They are identical"],
      answer: 0
    },
    {
      id: 25,
      question: "In a book about space, why would an author include a timeline at the bottom of a page?",
      options: ["To show events in the order they happened over time", "To define key vocabulary words", "To list the names of all planets alphabetically", "To tell a funny story"],
      answer: 0
    },
    {
      id: 26,
      question: "Which text feature helps compare numbers or amounts visually using bars or lines?",
      options: ["Graph / Chart", "Glossary", "Subheading", "Caption"],
      answer: 0
    },
    {
      id: 27,
      question: "When scanning a chapter to quickly find information on 'Philippine Eagles', what should you look for first on the pages?",
      options: ["Subheadings and bolded keywords related to eagles", "Every single page number", "The cover of the book", "The book spine"],
      answer: 0
    },
    {
      id: 28,
      question: "Why do non-fiction books use bullet points in lists?",
      options: ["To break information into short, clear, and readable items", "To write full story dialogues", "To make pages look like poetry", "To hide important details"],
      answer: 0
    },
    {
      id: 29,
      question: "What is a sidebox or 'sidebar' on a textbook page?",
      options: ["A separate box containing extra interesting facts related to the main text", "The binding edge of the page", "The page numbers at the bottom", "The author's biography"],
      answer: 0
    },
    {
      id: 30,
      question: "Which combination of text features would best help you locate the definition and location of the 'Sierra Madre' mountain range in a textbook?",
      options: ["Glossary (for definition) and Map/Index (for location)", "Table of Contents and Title Page", "Front cover and back cover", "Page numbers and illustration captions"],
      answer: 0
    }
  ])
};
export const placeValueRocketQuestions: Bank = {
  easy: build([
    {
      id: 1,
      question: "In the number 45, what is the place value of the digit 4?",
      options: ["Ones", "Tens", "Hundreds", "Thousands"],
      answer: 1
    },
    {
      id: 2,
      question: "What is the value of 8 in the number 82?",
      options: ["8", "80", "800", "2"],
      answer: 1
    },
    {
      id: 3,
      question: "How many tens are in the number 60?",
      options: ["0", "6", "60", "600"],
      answer: 1
    },
    {
      id: 4,
      question: "What number is made of 3 tens and 7 ones?",
      options: ["37", "73", "307", "370"],
      answer: 0
    },
    {
      id: 5,
      question: "In the number 129, which digit is in the hundreds place?",
      options: ["9", "2", "1", "0"],
      answer: 2
    },
    {
      id: 6,
      question: "What is the place value of 5 in 351?",
      options: ["Ones", "Tens", "Hundreds", "Thousands"],
      answer: 1
    },
    {
      id: 7,
      question: "What is the value of the digit 7 in 743?",
      options: ["7", "70", "700", "74"],
      answer: 2
    },
    {
      id: 8,
      question: "Which number has 9 in the ones place?",
      options: ["92", "29", "90", "900"],
      answer: 1
    },
    {
      id: 9,
      question: "What number is equal to 500 + 40 + 2?",
      options: ["542", "524", "452", "245"],
      answer: 0
    },
    {
      id: 10,
      question: "In the number 608, what digit is in the tens place?",
      options: ["6", "8", "0", "60"],
      answer: 2
    }
  ]),
  standard: build([
    {
      id: 11,
      question: "Which of the following shows 485 written in expanded form?",
      options: ["400 + 80 + 5", "40 + 80 + 5", "400 + 8 + 5", "4 + 8 + 5"],
      answer: 0
    },
    {
      id: 12,
      question: "Teacher Ana has 6 bundles of 10 sticks and 4 single sticks. How many sticks does she have in total?",
      options: ["46", "64", "604", "640"],
      answer: 1
    },
    {
      id: 13,
      question: "What is the difference between the value of 5 in 520 and the value of 5 in 250?",
      options: ["450", "500", "50", "400"],
      answer: 0
    },
    {
      id: 14,
      question: "A rocket tank needs 700 + 30 + 9 liters of fuel. What number is this?",
      options: ["739", "793", "379", "937"],
      answer: 0
    },
    {
      id: 15,
      question: "If you swap the hundreds and ones digits in the number 814, what new number do you get?",
      options: ["418", "841", "184", "481"],
      answer: 0
    },
    {
      id: 16,
      question: "Which number is greater: 5 tens + 3 ones OR 3 tens + 9 ones?",
      options: ["5 tens + 3 ones", "3 tens + 9 ones", "They are equal", "Cannot be determined"],
      answer: 0
    },
    {
      id: 17,
      question: "What is the number 'nine hundred six' written in digits?",
      options: ["960", "906", "96", "9006"],
      answer: 1
    },
    {
      id: 18,
      question: "How many total tens are in 200?",
      options: ["20", "2", "200", "0"],
      answer: 0
    },
    {
      id: 19,
      question: "What is 100 more than 489?",
      options: ["589", "499", "389", "480"],
      answer: 0
    },
    {
      id: 20,
      question: "In a 3-digit number, the hundreds digit is 3, the tens digit is double the hundreds digit, and the ones digit is 1. What is the number?",
      options: ["361", "331", "316", "631"],
      answer: 0
    }
  ]),
  challenge: build([
    {
      id: 21,
      question: "I am a 3-digit number. My hundreds digit is the largest single digit (9). My tens digit is 5 less than 9, and my ones digit is 0. What number am I?",
      options: ["940", "950", "990", "490"],
      answer: 0
    },
    {
      id: 22,
      question: "Ben has 3 flat blocks (100 each), 14 rod blocks (10 each), and 5 unit cubes (1 each). What total number do his blocks represent?",
      options: ["445", "345", "3145", "450"],
      answer: 0
    },
    {
      id: 23,
      question: "Which statement is TRUE about the number 777?",
      options: [
        "The digit 7 has the exact same value in all three places",
        "The leftmost 7 is worth 700, the middle 7 is worth 70, and the rightmost 7 is worth 7",
        "The rightmost 7 is worth 700",
        "The tens digit is worth 700"
      ],
      answer: 1
    },
    {
      id: 24,
      question: "What total number is formed by 8 hundreds, 0 tens, and 17 ones?",
      options: ["817", "8017", "871", "870"],
      answer: 0
    },
    {
      id: 25,
      question: "Rocket Alpha traveled 652 kilometers. Rocket Beta traveled 625 kilometers. Which rocket traveled further and by how many kilometers?",
      options: ["Rocket Alpha, by 27 km", "Rocket Beta, by 27 km", "Rocket Alpha, by 10 km", "They traveled the same distance"],
      answer: 0
    },
    {
      id: 26,
      question: "If you add 1 ten and subtract 2 ones from 345, what is your new number?",
      options: ["353", "355", "335", "343"],
      answer: 0
    },
    {
      id: 27,
      question: "What is the sum of the digits in the number 892?",
      options: ["19", "89", "18", "20"],
      answer: 0
    },
    {
      id: 28,
      question: "A mystery code has 4 hundreds, twice as many tens as hundreds, and 3 fewer ones than tens. What is the code?",
      options: ["485", "441", "845", "483"],
      answer: 0
    },
    {
      id: 29,
      question: "How many groups of 100 can you make from 1,000?",
      options: ["10", "100", "1", "1000"],
      answer: 0
    },
    {
      id: 30,
      question: "If 100 + [?] + 4 = 194, what value belongs in the missing box?",
      options: ["90", "9", "900", "80"],
      answer: 0
    }
  ])
};
export const pesoPinchPiggyQuestions: Bank = {
  easy: build([
    {
      id: 1,
      question: "What is the symbol used for the Philippine Peso?",
      options: ["$", "₱", "¥", "€"],
      answer: 1
    },
    {
      id: 2,
      question: "Piggy wants to buy a candy for ₱5. He has a ₱10 coin. Does he have enough money?",
      options: ["Yes", "No", "Needs ₱5 more", "Needs ₱10 more"],
      answer: 0
    },
    {
      id: 3,
      question: "How many ₱1 coins make ₱5?",
      options: ["2", "5", "10", "20"],
      answer: 1
    },
    {
      id: 4,
      question: "What is the total value of two ₱10 coins?",
      options: ["₱12", "₱15", "₱20", "₱100"],
      answer: 2
    },
    {
      id: 5,
      question: "Which bill has a smaller value?",
      options: ["₱20 bill", "₱50 bill", "₱100 bill", "₱500 bill"],
      answer: 0
    },
    {
      id: 6,
      question: "Piggy buys a banana for ₱8 and pays with a ₱10 coin. How much change should he get?",
      options: ["₱1", "₱2", "₱3", "₱5"],
      answer: 1
    },
    {
      id: 7,
      question: "How many ₱5 coins do you need to make ₱20?",
      options: ["2", "3", "4", "5"],
      answer: 2
    },
    {
      id: 8,
      question: "If Piggy has one ₱50 bill and one ₱20 bill, how much money does he have in total?",
      options: ["₱60", "₱70", "₱80", "₱100"],
      answer: 1
    },
    {
      id: 9,
      question: "A juice box costs ₱15. Which set of coins equals exactly ₱15?",
      options: ["One ₱10 coin and one ₱5 coin", "Three ₱10 coins", "Two ₱5 coins", "Five ₱1 coins"],
      answer: 0
    },
    {
      id: 10,
      question: "Which of the following is equal to ₱100?",
      options: ["Two ₱50 bills", "Five ₱10 coins", "Ten ₱5 coins", "One ₱20 bill"],
      answer: 0
    }
  ]),
  standard: build([
    {
      id: 11,
      question: "Piggy buys a biscuit for ₱12 and a pouch of milk for ₱18. How much is his total bill?",
      options: ["₱25", "₱30", "₱32", "₱35"],
      answer: 1
    },
    {
      id: 12,
      question: "Piggy has ₱50. He spends ₱35 on a ham sandwich. How much money does he have left?",
      options: ["₱15", "₱20", "₱25", "₱10"],
      answer: 0
    },
    {
      id: 13,
      question: "A pack of nuts costs ₱24. Piggy pays with a ₱50 bill. What is his correct change?",
      options: ["₱16", "₱26", "₱36", "₱24"],
      answer: 1
    },
    {
      id: 14,
      question: "Which group of money has the HIGHEST total value?",
      options: ["Three ₱20 bills", "One ₱50 bill and two ₱10 coins", "One ₱100 bill", "Four ₱20 bills"],
      answer: 2
    },
    {
      id: 15,
      question: "Piggy wants to buy an apple for ₱15 and an orange for ₱20. He only has a ₱20 bill. How much more money does he need?",
      options: ["₱5", "₱10", "₱15", "₱35"],
      answer: 2
    },
    {
      id: 16,
      question: "How many ₱20 bills make ₱100?",
      options: ["3", "4", "5", "6"],
      answer: 2
    },
    {
      id: 17,
      question: "Piggy found 50 centavos (50¢) and another 50 centavos (50¢) in his piggy bank. How much is that in Pesos?",
      options: ["₱1", "₱2", "₱5", "₱10"],
      answer: 0
    },
    {
      id: 18,
      question: "Piggy buys a turon for ₱15 and pays with a ₱50 bill. The cashier gives him two ₱10 coins and one ₱5 coin as change. Is the change correct?",
      options: ["Yes, ₱25 is the correct change", "No, he should get ₱35", "No, he should get ₱20", "No, he should get ₱30"],
      answer: 1
    },
    {
      id: 19,
      question: "If a slice of cake costs ₱45, which combination of money pays for it EXACTLY?",
      options: ["Two ₱20 bills and one ₱5 coin", "Four ₱10 coins", "One ₱50 bill", "Three ₱10 coins and two ₱5 coins"],
      answer: 0
    },
    {
      id: 20,
      question: "Piggy saved three ₱10 coins, two ₱5 coins, and five ₱1 coins. How much did Piggy save in total?",
      options: ["₱40", "₱45", "₱50", "₱35"],
      answer: 1
    }
  ]),
  challenge: build([
    {
      id: 21,
      question: "Piggy has ₱100. He buys a burger for ₱42 and a juice bottle for ₱28. How much money does Piggy have remaining?",
      options: ["₱30", "₱38", "₱70", "₱20"],
      answer: 0
    },
    {
      id: 22,
      question: "At the snack shop, 1 puto costs ₱6. How much do 6 puto cost in total?",
      options: ["₱30", "₱36", "₱42", "₱24"],
      answer: 1
    },
    {
      id: 23,
      question: "Piggy buys a waffle for ₱35. He gives the cashier a ₱100 bill. The cashier gives him back one ₱50 bill and one ₱10 coin. Is the change correct?",
      options: [
        "Yes, ₱60 is correct",
        "No, the change should be ₱65 (he is missing ₱5)",
        "No, the change should be ₱55",
        "No, the change should be ₱70"
      ],
      answer: 1
    },
    {
      id: 24,
      question: "Piggy has two ₱50 bills. He buys 3 ice cream cones that cost ₱25 each. How much change does he receive?",
      options: ["₱25", "₱50", "₱75", "₱15"],
      answer: 0
    },
    {
      id: 25,
      question: "A box of ensaymada costs ₱88. Piggy pays with a ₱100 bill. Which coins and bills make up his EXACT change?",
      options: ["One ₱10 coin and two ₱1 coins", "One ₱10 coin and one ₱5 coin", "One ₱20 bill", "Two ₱5 coins"],
      answer: 0
    },
    {
      id: 26,
      question: "Piggy wants to share ₱60 equally among himself and 2 piggy friends (3 piggies total). How much money will each piggy get?",
      options: ["₱15", "₱20", "₱30", "₱10"],
      answer: 1
    },
    {
      id: 27,
      question: "If Piggy saves ₱15 every day for 4 days, how much money will he have saved in total?",
      options: ["₱45", "₱50", "₱60", "₱75"],
      answer: 2
    },
    {
      id: 28,
      question: "Piggy has a ₱50 bill. He wants to buy 4 gulaman drinks that cost ₱14 each. Does he have enough money?",
      options: ["Yes, he has exactly enough", "Yes, and he gets ₱6 change", "No, he needs ₱6 more", "No, he needs ₱10 more"],
      answer: 2
    },
    {
      id: 29,
      question: "Snack Combo A costs ₱65 (includes sandwich & drink). Buying them separately costs ₱45 for the sandwich and ₱30 for the drink. How much money does Piggy save by buying Combo A?",
      options: ["₱10", "₱15", "₱20", "₱5"],
      answer: 0
    },
    {
      id: 30,
      question: "Piggy buys a combo meal for ₱135. He gives one ₱100 bill and one ₱50 bill. How much change should he receive?",
      options: ["₱15", "₱25", "₱35", "₱5"],
      answer: 0
    }
  ])
};
export const arrayGardenQuestions: Bank = {
  easy: build([
    {
      id: 1,
      question: "In a garden, there are 3 rows of flowers with 2 flowers in each row. How many flowers are there in total?",
      options: ["5", "6", "8", "9"],
      answer: 1
    },
    {
      id: 2,
      question: "Which repeated addition sentence matches 4 rows of 3 trees?",
      options: ["3 + 3 + 3 + 3", "4 + 4 + 4 + 4", "3 + 4", "4 + 3"],
      answer: 0
    },
    {
      id: 3,
      question: "What is 2 + 2 + 2 + 2 written as a multiplication sentence?",
      options: ["4 × 2", "2 + 4", "4 + 2", "2 × 2"],
      answer: 0
    },
    {
      id: 4,
      question: "A garden patch has 2 rows of 5 carrots. How many carrots are there in all?",
      options: ["7", "10", "12", "15"],
      answer: 1
    },
    {
      id: 5,
      question: "What multiplication sentence represents 5 + 5 + 5?",
      options: ["3 × 5", "5 × 5", "3 + 5", "5 × 1"],
      answer: 0
    },
    {
      id: 6,
      question: "If an array has 3 rows and 4 columns of sunflowers, how many sunflowers are planted?",
      options: ["7", "10", "12", "14"],
      answer: 2
    },
    {
      id: 7,
      question: "Which addition sentence is the same as 2 × 6?",
      options: ["6 + 6", "2 + 6", "2 + 2", "6 + 6 + 6"],
      answer: 0
    },
    {
      id: 8,
      question: "A plant nursery has 4 pots with 4 sprouts each. How many sprouts are there total?",
      options: ["8", "12", "16", "20"],
      answer: 2
    },
    {
      id: 9,
      question: "In an array, horizontal lines of objects going across are called...",
      options: ["Columns", "Rows", "Diagonals", "Groups"],
      answer: 1
    },
    {
      id: 10,
      question: "In an array, vertical lines of objects going up and down are called...",
      options: ["Rows", "Columns", "Lines", "Sides"],
      answer: 1
    }
  ]),
  standard: build([
    {
      id: 11,
      question: "Farmer Ben planted 5 rows of tomato plants with 4 plants in each row. How many tomato plants did he plant?",
      options: ["18", "20", "22", "25"],
      answer: 1
    },
    {
      id: 12,
      question: "Which array representation shows 18 flowers in total?",
      options: ["3 rows of 6 flowers", "2 rows of 8 flowers", "4 rows of 5 flowers", "3 rows of 5 flowers"],
      answer: 0
    },
    {
      id: 13,
      question: "Mang Jose harvested 3 groups of 10 watermelons. How many watermelons did he harvest?",
      options: ["13", "20", "30", "33"],
      answer: 2
    },
    {
      id: 14,
      question: "What is 10 + 10 + 10 + 10 + 10 written as multiplication?",
      options: ["5 × 10", "10 × 10", "5 + 10", "10 × 2"],
      answer: 0
    },
    {
      id: 15,
      question: "A garden grid has 4 rows and 6 columns of red roses. What is the total number of roses?",
      options: ["20", "22", "24", "26"],
      answer: 2
    },
    {
      id: 16,
      question: "If 4 × 5 = 20, what is 5 × 4?",
      options: ["15", "20", "25", "30"],
      answer: 1
    },
    {
      id: 17,
      question: "Lina planted 2 rows of corn with 9 stalks in each row. How many corn stalks are growing?",
      options: ["11", "16", "18", "20"],
      answer: 2
    },
    {
      id: 18,
      question: "Which repeated addition sentence matches the multiplication 3 × 7?",
      options: ["7 + 7 + 7", "3 + 7", "3 + 3 + 3", "7 + 3 + 7"],
      answer: 0
    },
    {
      id: 19,
      question: "A seedling tray has 5 rows and 5 columns. How many total seedlings fit in the tray?",
      options: ["20", "25", "30", "35"],
      answer: 1
    },
    {
      id: 20,
      question: "An array of eggplant bushes has a total of 15 plants arranged in 3 equal rows. How many bushes are in each row?",
      options: ["3", "4", "5", "6"],
      answer: 2
    }
  ]),
  challenge: build([
    {
      id: 21,
      question: "Ana has an array of 6 rows with 4 cabbages in each row. Pedro has 3 rows with 8 cabbages in each row. Who has more cabbages?",
      options: ["Ana has more", "Pedro has more", "They have the exact same amount (24)", "Neither"],
      answer: 2
    },
    {
      id: 22,
      question: "A flower bed has 4 rows of 8 tulips. If 5 tulips are picked, how many tulips remain in the garden?",
      options: ["27", "32", "37", "22"],
      answer: 0
    },
    {
      id: 23,
      question: "Farmer Juan has 30 strawberry plants. Which array layout can he use to plant all of them without leftovers?",
      options: ["5 rows of 6 plants", "4 rows of 7 plants", "3 rows of 9 plants", "6 rows of 4 plants"],
      answer: 0
    },
    {
      id: 24,
      question: "If 1 row of pots contains 7 orchids, how many orchids are in 4 rows?",
      options: ["21", "24", "28", "32"],
      answer: 2
    },
    {
      id: 25,
      question: "A garden plot has 3 rows of 10 garlic bulbs and another separate patch with 2 rows of 5 garlic bulbs. What is the total number of garlic bulbs?",
      options: ["35", "40", "45", "50"],
      answer: 1
    },
    {
      id: 26,
      question: "In a botanical garden, 5 × 6 trees are papaya trees and 4 × 5 trees are mango trees. How many trees are there in total?",
      options: ["40", "50", "60", "70"],
      answer: 1
    },
    {
      id: 27,
      question: "A greenhouse manager arranged 36 potted plants in 4 equal rows. How many pots are in each row?",
      options: ["7", "8", "9", "10"],
      answer: 2
    },
    {
      id: 28,
      question: "If you add 1 more row of 5 flowers to an existing 3 × 5 array of flowers, what is the new total?",
      options: ["15", "20", "25", "30"],
      answer: 1
    },
    {
      id: 29,
      question: "Which multiplication sentence represents 0 plants in each of 6 garden pots?",
      options: ["6 × 0 = 0", "6 × 1 = 6", "6 + 0 = 6", "6 - 0 = 6"],
      answer: 0
    },
    {
      id: 30,
      question: "A butterfly visits a garden with 8 rows of 3 blossoms. How many blossoms does the butterfly have available to visit?",
      options: ["21", "24", "27", "30"],
      answer: 1
    }
  ])
};
export const measureAndShapeStudioQuestions: Bank = {
  easy: build([
    {
      id: 1,
      question: "Which 2D shape has 3 sides and 3 corners?",
      options: ["Square", "Triangle", "Circle", "Rectangle"],
      answer: 1
    },
    {
      id: 2,
      question: "Which shape has no straight sides and no corners?",
      options: ["Circle", "Triangle", "Square", "Rectangle"],
      answer: 0
    },
    {
      id: 3,
      question: "A square has how many equal sides?",
      options: ["2", "3", "4", "5"],
      answer: 2
    },
    {
      id: 4,
      question: "Which 3D shape looks like a party hat or an ice cream cone?",
      options: ["Cube", "Sphere", "Cone", "Cylinder"],
      answer: 2
    },
    {
      id: 5,
      question: "Which 3D shape looks like a round basketball?",
      options: ["Sphere", "Cube", "Cylinder", "Cone"],
      answer: 0
    },
    {
      id: 6,
      question: "What standard tool do we use to measure the length of a pencil in centimeters?",
      options: ["Thermometer", "Ruler", "Clock", "Scale"],
      answer: 1
    },
    {
      id: 7,
      question: "What unit of length is shortened to 'cm'?",
      options: ["Centimeter", "Meter", "Kilogram", "Liter"],
      answer: 0
    },
    {
      id: 8,
      question: "Which object is usually about 1 meter long?",
      options: ["An eraser", "A classroom doorway width", "A paperclip", "An ant"],
      answer: 1
    },
    {
      id: 9,
      question: "How many sides does a rectangle have?",
      options: ["3", "4", "5", "6"],
      answer: 1
    },
    {
      id: 10,
      question: "Which 3D solid has 6 flat square faces, like a playing die?",
      options: ["Sphere", "Cone", "Cube", "Cylinder"],
      answer: 2
    }
  ]),
  standard: build([
    {
      id: 11,
      question: "What is the perimeter of a triangle with sides measuring 3 cm, 4 cm, and 5 cm?",
      options: ["7 cm", "10 cm", "12 cm", "15 cm"],
      answer: 2
    },
    {
      id: 12,
      question: "A square photo frame has a side length of 5 cm. What is its perimeter?",
      options: ["10 cm", "15 cm", "20 cm", "25 cm"],
      answer: 2
    },
    {
      id: 13,
      question: "A rectangle has a length of 6 cm and a width of 4 cm. What is its perimeter?",
      options: ["10 cm", "20 cm", "24 cm", "16 cm"],
      answer: 1
    },
    {
      id: 14,
      question: "Which 3D shape has 2 flat circular bases and a curved surface, like a soup can?",
      options: ["Cylinder", "Cone", "Cube", "Sphere"],
      answer: 0
    },
    {
      id: 15,
      question: "Pencil A is 12 cm long. Pencil B is 8 cm long. How much longer is Pencil A than Pencil B?",
      options: ["4 cm", "6 cm", "20 cm", "2 cm"],
      answer: 0
    },
    {
      id: 16,
      question: "What word means 'the total distance all the way around the outside of a shape'?",
      options: ["Area", "Perimeter", "Volume", "Weight"],
      answer: 1
    },
    {
      id: 17,
      question: "Which unit should you use to measure the length of a school hallway?",
      options: ["Centimeters (cm)", "Meters (m)", "Inches", "Grams"],
      answer: 1
    },
    {
      id: 18,
      question: "How many corners (vertices) does a rectangle have?",
      options: ["2", "3", "4", "6"],
      answer: 2
    },
    {
      id: 19,
      question: "A ribbon is 45 cm long. Maya cuts off 15 cm. How long is the remaining ribbon?",
      options: ["30 cm", "35 cm", "60 cm", "25 cm"],
      answer: 0
    },
    {
      id: 20,
      question: "Which 2D shape has 6 sides and 6 corners?",
      options: ["Pentagon", "Hexagon", "Octagon", "Triangle"],
      answer: 1
    }
  ]),
  challenge: build([
    {
      id: 21,
      question: "A garden plot in the studio is shaped like a square with a perimeter of 36 meters. How long is each side?",
      options: ["6 meters", "8 meters", "9 meters", "12 meters"],
      answer: 2
    },
    {
      id: 22,
      question: "A rectangular table has a total perimeter of 30 cm. If the length is 10 cm, what is the width?",
      options: ["5 cm", "10 cm", "15 cm", "20 cm"],
      answer: 0
    },
    {
      id: 23,
      question: "How many total faces does a rectangular prism (like a cereal box) have?",
      options: ["4", "6", "8", "12"],
      answer: 1
    },
    {
      id: 24,
      question: "Leo lines up 4 paperclips end-to-end. Each paperclip is 3 cm long. What is the total length of the line?",
      options: ["7 cm", "10 cm", "12 cm", "15 cm"],
      answer: 2
    },
    {
      id: 25,
      question: "Shape X has 5 sides and 5 corners. What is the name of Shape X?",
      options: ["Pentagon", "Hexagon", "Square", "Triangle"],
      answer: 0
    },
    {
      id: 26,
      question: "A wooden board is 1 meter long. How many centimeters is that equal to?",
      options: ["10 cm", "50 cm", "100 cm", "1000 cm"],
      answer: 2
    },
    {
      id: 27,
      question: "An equilateral triangle has a perimeter of 21 cm. What is the length of one side?",
      options: ["5 cm", "6 cm", "7 cm", "8 cm"],
      answer: 2
    },
    {
      id: 28,
      question: "Which statement about a cube is TRUE?",
      options: [
        "It has 6 square faces of equal size",
        "It has 3 round sides",
        "It has no corners or edges",
        "It looks like a ball"
      ],
      answer: 0
    },
    {
      id: 29,
      question: "A rope measures 2 meters and 40 centimeters. How many total centimeters long is the rope?",
      options: ["204 cm", "240 cm", "2400 cm", "420 cm"],
      answer: 1
    },
    {
      id: 30,
      question: "If you combine two identical squares side by side, what new 2D shape do you form?",
      options: ["Triangle", "Rectangle", "Circle", "Pentagon"],
      answer: 1
    }
  ])
};
export const ecoSorterQuestions: Bank = {
  easy: build([
    {
      id: 1,
      question: "Which of the following is a LIVING thing?",
      options: ["Plastic bottle", "Growing puppy", "Wooden chair", "Glass marble"],
      answer: 1
    },
    {
      id: 2,
      question: "Which item should be put into the RECYCLABLE bin?",
      options: ["Empty plastic water bottle", "Leftover fish bones", "Used tissue paper", "Apple core"],
      answer: 0
    },
    {
      id: 3,
      question: "What basic need do plants require to make their own food?",
      options: ["Milk", "Sunlight", "Juice", "Soda"],
      answer: 1
    },
    {
      id: 4,
      question: "Which waste item is BIODEGRADABLE (can decay naturally)?",
      options: ["Banana peel", "Plastic bag", "Aluminum soda can", "Glass jar"],
      answer: 0
    },
    {
      id: 5,
      question: "Which of these is a NON-LIVING thing?",
      options: ["Mango tree", "Carabao", "Rock", "Grasshopper"],
      answer: 2
    },
    {
      id: 6,
      question: "Where should leftover food scraps and vegetable peelings be thrown?",
      options: ["Compost / Biodegradable bin", "Plastic recycling bin", "Hazardous waste bin", "Electronic trash"],
      answer: 0
    },
    {
      id: 7,
      question: "Which living thing can move from place to place on its own legs?",
      options: ["Rose bush", "Dog", "Potted fern", "Coconut tree"],
      answer: 1
    },
    {
      id: 8,
      question: "What material is a metal spoon made of?",
      options: ["Paper", "Metal", "Plastic", "Fabric"],
      answer: 1
    },
    {
      id: 9,
      question: "Which of the following describes all LIVING things?",
      options: ["They grow and need food/water", "They stay the same size forever", "They never breathe", "They are made of plastic"],
      answer: 0
    },
    {
      id: 10,
      question: "Which item is NON-BIODEGRADABLE (takes hundreds of years to break down)?",
      options: ["Dried leaf", "Plastic wrapper", "Fruit skin", "Paper napkin"],
      answer: 1
    }
  ]),
  standard: build([
    {
      id: 11,
      question: "Why is a toy robot NOT considered a living thing, even if it can move and make sounds?",
      options: [
        "It cannot grow or breathe on its own",
        "It is too colorful",
        "It moves too fast",
        "It lives in a toy box"
      ],
      answer: 0
    },
    {
      id: 12,
      question: "Which material comes directly from a plant resource?",
      options: ["Cotton cloth", "Plastic wrapper", "Glass bottle", "Steel nail"],
      answer: 0
    },
    {
      id: 13,
      question: "What does the 'Reduce' rule in the 3Rs (Reduce, Reuse, Recycle) mean?",
      options: ["Using less waste in the first place", "Throwing everything in the river", "Burning all trash", "Buying more plastic bags"],
      answer: 0
    },
    {
      id: 14,
      question: "An old glass jar is washed and used to store sugar in the kitchen. Which 'R' is this demonstrating?",
      options: ["Reduce", "Reuse", "Recycle", "Refuse"],
      answer: 1
    },
    {
      id: 15,
      question: "Which habitat do fish and seaweed belong to?",
      options: ["Aquatic / Water habitat", "Terrestrial / Land habitat", "Desert habitat", "Aerial / Air habitat"],
      answer: 0
    },
    {
      id: 16,
      question: "Why should broken glass and light bulbs be separated carefully from ordinary trash?",
      options: [
        "They are hazardous and can cause harm or injury",
        "They turn into soil quickly",
        "They are food for animals",
        "They melt in the sun"
      ],
      answer: 0
    },
    {
      id: 17,
      question: "Which group contains ONLY natural materials?",
      options: ["Wood, wool, and clay", "Plastic, glass, and nylon", "Rubber soles, plastic bags, and steel", "Polyester, glass, and plastic"],
      answer: 0
    },
    {
      id: 18,
      question: "What happens to biodegradable waste when it is buried in soil over time?",
      options: ["It decomposes and enriches the soil", "It turns into plastic", "It stays fresh forever", "It explodes"],
      answer: 0
    },
    {
      id: 19,
      question: "Which of the following is an example of RECYCLING?",
      options: [
        "Melting old plastic bottles to manufacture new plastic chairs",
        "Using a cloth bag for grocery shopping",
        "Turning off the tap while brushing teeth",
        "Throwing paper on the ground"
      ],
      answer: 0
    },
    {
      id: 20,
      question: "Plants take in carbon dioxide and give off which gas that animals and humans need to breathe?",
      options: ["Oxygen", "Smoke", "Water vapor", "Nitrogen"],
      answer: 0
    }
  ]),
  challenge: build([
    {
      id: 21,
      question: "A student found a seed. Is the seed living or non-living, and why?",
      options: [
        "Living, because it is dormant and will grow when given water, soil, and sunlight",
        "Non-living, because it can never grow",
        "Non-living, because it is made of plastic",
        "Living, because it can walk around"
      ],
      answer: 0
    },
    {
      id: 22,
      question: "Why is throwing plastic waste into rivers and oceans harmful to marine life?",
      options: [
        "Animals can mistake plastic for food or get trapped in it",
        "Plastic makes sea water too cold",
        "Fish use plastic to build houses",
        "It makes plants grow too fast"
      ],
      answer: 0
    },
    {
      id: 23,
      question: "Which of the following shows proper environmental stewardship at school?",
      options: [
        "Sorting trash into correct color-coded bins after snack time",
        "Leaving plastic wrappers on the playground bench",
        "Picking flowers from the school garden bed",
        "Leaving water faucets running in the restroom"
      ],
      answer: 0
    },
    {
      id: 24,
      question: "How does composting plant waste help the environment?",
      options: [
        "It reduces trash in landfills and creates natural fertilizer for plants",
        "It creates more plastic waste",
        "It pollutes the clean air",
        "It uses up too much electricity"
      ],
      answer: 0
    },
    {
      id: 25,
      question: "Which material property makes rubber ideal for making rainboots?",
      options: ["It is waterproof and flexible", "It absorbs water easily", "It tears quickly", "It is see-through like glass"],
      answer: 0
    },
    {
      id: 26,
      question: "Earthworms live in moist soil and break down dead leaves. What role do they play in an ecosystem?",
      options: ["Decomposers that enrich the soil", "Predators that eat fish", "Plants that absorb light", "Non-living objects"],
      answer: 0
    },
    {
      id: 27,
      question: "If a town recycles paper products regularly, how does this directly help forests?",
      options: [
        "Fewer trees need to be cut down to manufacture new paper",
        "It makes trees grow faster",
        "It turns paper back into living wood",
        "It stops rain from falling"
      ],
      answer: 0
    },
    {
      id: 28,
      question: "Which waste item requires special handling because it contains dangerous chemicals?",
      options: ["Used batteries", "Banana peels", "Cardboard boxes", "Dry leaves"],
      answer: 0
    },
    {
      id: 29,
      question: "Which statement correctly compares a rock and a mushroom?",
      options: [
        "A mushroom is a living fungus that grows; a rock is a non-living mineral",
        "Both are living organisms",
        "Both are non-living minerals",
        "A rock is living; a mushroom is non-living"
      ],
      answer: 0
    },
    {
      id: 30,
      question: "What is the best way to reduce the use of single-use plastic water bottles?",
      options: [
        "Carry a reusable stainless steel water flask every day",
        "Buy five small plastic bottles daily",
        "Throw plastic bottles into the river",
        "Burn plastic bottles at home"
      ],
      answer: 0
    }
  ])
};
export const stateChangerQuestions: Bank = {
  easy: build([
    {
      id: 1,
      question: "Which state of matter has a fixed shape and size, like an ice cube or a wooden block?",
      options: ["Solid", "Liquid", "Gas", "Plasma"],
      answer: 0
    },
    {
      id: 2,
      question: "Water poured into a glass takes the shape of the glass. What state of matter is water?",
      options: ["Solid", "Liquid", "Gas", "Ice"],
      answer: 1
    },
    {
      id: 3,
      question: "What state of matter is the air inside a party balloon?",
      options: ["Gas", "Liquid", "Solid", "Ice"],
      answer: 0
    },
    {
      id: 4,
      question: "When you heat an ice cube in the sun, it turns into liquid water. What is this change called?",
      options: ["Melting", "Freezing", "Evaporation", "Condensation"],
      answer: 0
    },
    {
      id: 5,
      question: "What happens when you put liquid water inside a freezer?",
      options: ["It freezes into solid ice", "It boils into steam", "It turns into air", "It disappears"],
      answer: 0
    },
    {
      id: 6,
      question: "Which of the following is an example of a GAS?",
      options: ["Water vapor", "Orange juice", "Rock", "Pencil"],
      answer: 0
    },
    {
      id: 7,
      question: "Which of the following is an example of a LIQUID?",
      options: ["Milk", "Book", "Coin", "Steam"],
      answer: 0
    },
    {
      id: 8,
      question: "Which of the following is an example of a SOLID?",
      options: ["Toy car", "Soy sauce", "Air", "Cooking oil"],
      answer: 0
    },
    {
      id: 9,
      question: "When hot water boils in a kettle, steam rises into the air. Steam is a...",
      options: ["Gas", "Solid", "Liquid", "Frozen block"],
      answer: 0
    },
    {
      id: 10,
      question: "What causes an ice cream cone to melt while playing outside?",
      options: ["Heat from the sun", "Cold wind", "Freezer air", "Shade"],
      answer: 0
    }
  ]),
  standard: build([
    {
      id: 11,
      question: "When liquid water is heated and turns into water vapor gas, what process takes place?",
      options: ["Evaporation", "Freezing", "Condensation", "Melting"],
      answer: 0
    },
    {
      id: 12,
      question: "Tiny water droplets form on the outside of a cold glass of iced tea. What is this process called?",
      options: ["Condensation", "Evaporation", "Melting", "Boiling"],
      answer: 0
    },
    {
      id: 13,
      question: "Which state of matter spreads out to fill any container or space completely?",
      options: ["Gas", "Solid", "Liquid", "Ice"],
      answer: 0
    },
    {
      id: 14,
      question: "When butter is placed in a hot pan, what state change happens?",
      options: ["Solid to liquid", "Liquid to solid", "Liquid to gas", "Gas to solid"],
      answer: 0
    },
    {
      id: 15,
      question: "When hot candle wax cools down after the candle is blown out, what state change occurs?",
      options: ["Liquid to solid", "Solid to liquid", "Solid to gas", "Liquid to gas"],
      answer: 0
    },
    {
      id: 16,
      question: "How are liquids and gases SIMILAR?",
      options: [
        "They both take the shape of their container",
        "They both have a fixed shape",
        "They are both hard to touch",
        "They both melt when cooled"
      ],
      answer: 0
    },
    {
      id: 17,
      question: "What happens to wet clothes hanging outside under the hot sun?",
      options: [
        "The water inside evaporates into the air, making them dry",
        "The water freezes into ice",
        "The clothes turn into gas",
        "The water turns into liquid milk"
      ],
      answer: 0
    },
    {
      id: 18,
      question: "Which of these changes in matter is REVERSIBLE (can be changed back to its original state)?",
      options: [
        "Melting chocolate and letting it cool",
        "Baking a cake from batter",
        "Burning a piece of paper",
        "Cooking an egg"
      ],
      answer: 0
    },
    {
      id: 19,
      question: "What state of matter stays in the same shape no matter what container you place it in?",
      options: ["Solid", "Liquid", "Gas", "Vapor"],
      answer: 0
    },
    {
      id: 20,
      question: "When rain falls from clouds in the sky, water vapor has cooled and changed into liquid drops. What is this part of the water cycle?",
      options: ["Condensation and precipitation", "Evaporation", "Melting", "Freezing"],
      answer: 0
    }
  ]),
  challenge: build([
    {
      id: 21,
      question: "Why does water expand and turn solid when placed in a freezer below 0°C?",
      options: [
        "Loss of heat energy slows down particles until they lock into a solid structure",
        "Adding heat energy pushes particles apart",
        "Air is pumped into the water",
        "The container shrinks around it"
      ],
      answer: 0
    },
    {
      id: 22,
      question: "Which of the following describes an IRREVERSIBLE chemical change caused by heat?",
      options: ["Frying a fresh egg", "Melting an ice cube", "Freezing juice into a popsicle", "Melting candle wax"],
      answer: 0
    },
    {
      id: 23,
      question: "You notice water droplets on the mirror after taking a hot bath. What path did the water take?",
      options: [
        "Liquid water evaporated into hot steam, then condensed on the cool glass surface",
        "Solid ice melted into water",
        "The mirror leaked water",
        "Gas froze directly into ice"
      ],
      answer: 0
    },
    {
      id: 24,
      question: "If you heat sugar in a pan for a long time until it turns black and smoky, can you get the white sugar back by cooling it?",
      options: [
        "No, because burning sugar is a permanent change",
        "Yes, by putting it in the freezer",
        "Yes, by adding water",
        "Yes, by stirring it fast"
      ],
      answer: 0
    },
    {
      id: 25,
      question: "How does temperature affect the rate at which an ice cube melts?",
      options: [
        "Higher temperatures provide more heat energy, making it melt faster",
        "Lower temperatures make it melt faster",
        "Temperature has no effect on melting speed",
        "Ice melts fastest in a freezer"
      ],
      answer: 0
    },
    {
      id: 26,
      question: "Which combination correctly matches the item to its state of matter?",
      options: [
        "Cooking oil = Liquid, Oxygen = Gas, Eraser = Solid",
        "Cooking oil = Solid, Oxygen = Liquid, Eraser = Gas",
        "Cooking oil = Gas, Oxygen = Solid, Eraser = Liquid",
        "Cooking oil = Liquid, Oxygen = Solid, Eraser = Gas"
      ],
      answer: 0
    },
    {
      id: 27,
      question: "Why can you pour a liquid easily, but you cannot pour a solid block of wood?",
      options: [
        "Liquid particles can flow and slide past each other, while solid particles are tightly held together",
        "Solid particles move too fast",
        "Liquids have no weight",
        "Solids are made of air"
      ],
      answer: 0
    },
    {
      id: 28,
      question: "What state change occurs when morning dew disappears from grass leaves as the morning sun warms the land?",
      options: ["Liquid to gas (Evaporation)", "Gas to liquid (Condensation)", "Solid to liquid (Melting)", "Liquid to solid (Freezing)"],
      answer: 0
    },
    {
      id: 29,
      question: "If you trap air inside an empty plastic bottle with a cap and squeeze it, the bottle changes shape slightly. What does this demonstrate about gas?",
      options: [
        "Gases can be compressed because their particles have space between them",
        "Gases are solid objects",
        "Gases have fixed shapes like rocks",
        "Gases cannot fit in bottles"
      ],
      answer: 0
    },
    {
      id: 30,
      question: "A student leaves a chocolate bar inside a hot bag. Later, they put it in the refrigerator. What two changes of state happened in order?",
      options: [
        "Melting (solid to liquid), then Freezing/Solidification (liquid to solid)",
        "Freezing, then melting",
        "Evaporation, then condensation",
        "Condensation, then melting"
      ],
      answer: 0
    }
  ])
};
export const skySplitterQuestions: Bank = {
  easy: build([
    {
      id: 1,
      question: "Which bright object lights up the sky during the daytime?",
      options: ["The Sun", "The Moon", "Stars", "Clouds"],
      answer: 0
    },
    {
      id: 2,
      question: "Which objects can you usually see glowing in the sky at night?",
      options: ["Moon and stars", "Sun and rainbows", "Bright sunlight", "Blue sky"],
      answer: 0
    },
    {
      id: 3,
      question: "What weather symbol or tool would you need on a rainy day?",
      options: ["Umbrella", "Sunglasses", "Electric fan", "Sunblock"],
      answer: 0
    },
    {
      id: 4,
      question: "When fluffy white clouds cover the sky and block the sun, the weather is...",
      options: ["Cloudy", "Sunny", "Stormy", "Windy"],
      answer: 0
    },
    {
      id: 5,
      question: "What colorful arch appears in the sky after a rain shower when the sun shines?",
      options: ["Rainbow", "Comet", "Moon", "Lightning bolt"],
      answer: 0
    },
    {
      id: 6,
      question: "Why should you NEVER look directly at the bright Sun with your bare eyes?",
      options: [
        "It can damage your eyes and eyesight",
        "It makes you sleepy",
        "It turns the sky red",
        "It makes your hair fall"
      ],
      answer: 0
    },
    {
      id: 7,
      question: "When kites fly high in the air and tree leaves blow around, the weather is...",
      options: ["Windy", "Sunny", "Rainy", "Foggy"],
      answer: 0
    },
    {
      id: 8,
      question: "What gives us both heat and light on Earth?",
      options: ["The Sun", "The Moon", "Ocean water", "Mountains"],
      answer: 0
    },
    {
      id: 9,
      question: "Does the Moon produce its own light, or does it reflect light from the Sun?",
      options: [
        "It reflects light from the Sun",
        "It produces its own light like a lamp",
        "It uses electricity",
        "It burns like wood"
      ],
      answer: 0
    },
    {
      id: 10,
      question: "What kind of clothing should you wear on a hot, sunny day?",
      options: ["Light cotton clothes", "Heavy wool sweater", "Raincoat and boots", "Thick jacket"],
      answer: 0
    }
  ]),
  standard: build([
    {
      id: 11,
      question: "What causes day and night on Earth?",
      options: [
        "Earth rotating (spinning) on its axis",
        "The Sun turning off at night",
        "Clouds covering the Sun",
        "The Moon blocking the Sun every day"
      ],
      answer: 0
    },
    {
      id: 12,
      question: "How long does it take for Earth to complete ONE full rotation on its axis?",
      options: ["24 hours (1 day)", "7 days", "30 days", "365 days"],
      answer: 0
    },
    {
      id: 13,
      question: "Why does the Moon seem to change shape (phases) throughout the month?",
      options: [
        "We see different parts of the Moon illuminated by the Sun as it orbits Earth",
        "The Moon actually shrinks and grows in size",
        "Monsters take bites out of the Moon",
        "Clouds cover parts of the Moon permanently"
      ],
      answer: 0
    },
    {
      id: 14,
      question: "Which weather instrument is used to measure air temperature?",
      options: ["Thermometer", "Wind vane", "Rain gauge", "Anemometer"],
      answer: 0
    },
    {
      id: 15,
      question: "A wind vane points to the direction the wind is blowing. If it points North, where is the wind coming from?",
      options: ["North", "South", "East", "West"],
      answer: 0
    },
    {
      id: 16,
      question: "Dark, thick grey clouds cover the sky and thunder rumbles in the distance. What weather should you prepare for?",
      options: ["A thunderstorm or heavy rain", "A hot sunny afternoon", "A clear blue night", "Dry windy dust"],
      answer: 0
    },
    {
      id: 17,
      question: "Which shadow safety tip protects your skin when playing outside during peak daytime hours (10 AM to 3 PM)?",
      options: [
        "Wear sunscreen, a wide-brimmed hat, and seek shade",
        "Stare at the Sun to check its position",
        "Wear thick black leather jackets",
        "Drink no water all day"
      ],
      answer: 0
    },
    {
      id: 18,
      question: "When is your shadow on the ground the SHORTEST?",
      options: ["At noon (12:00 PM) when the Sun is directly overhead", "Early in the morning", "Late in the afternoon", "At midnight"],
      answer: 0
    },
    {
      id: 19,
      question: "Why can't we see stars during the daytime?",
      options: [
        "The Sun's bright light overpowers the dim light of distant stars",
        "The stars disappear from space during the day",
        "The stars turn off their lights",
        "Clouds block all stars every morning"
      ],
      answer: 0
    },
    {
      id: 20,
      question: "What is water that falls from clouds in the form of liquid droplets called?",
      options: ["Precipitation / Rain", "Evaporation", "Wind", "Sunrise"],
      answer: 0
    }
  ]),
  challenge: build([
    {
      id: 21,
      question: "If it is daytime in the Philippines, what is happening on the opposite side of the Earth (e.g., in South America)?",
      options: [
        "It is nighttime because that side is facing away from the Sun",
        "It is also daytime",
        "It is noon at the exact same time",
        "The Sun is shining on both sides equally"
      ],
      answer: 0
    },
    {
      id: 22,
      question: "How does a rain gauge help meteorologists measure weather?",
      options: [
        "It collects and measures the amount of rainfall over a set period of time",
        "It measures how fast the wind blows",
        "It measures how hot the air is",
        "It tracks the movement of clouds"
      ],
      answer: 0
    },
    {
      id: 23,
      question: "Early in the morning, your shadow points toward the WEST. Where is the Sun positioned in the sky?",
      options: ["In the East", "In the West", "Directly overhead", "In the South"],
      answer: 0
    },
    {
      id: 24,
      question: "During a typhoon signal alert, what safety action should your family take?",
      options: [
        "Stay indoors, listen to weather updates on the radio/news, and prepare an emergency kit",
        "Go swimming in the river",
        "Fly kites in open fields",
        "Play near tall trees outdoors"
      ],
      answer: 0
    },
    {
      id: 25,
      question: "Why does the Sun appear much larger and brighter than other stars in the universe?",
      options: [
        "It is the closest star to planet Earth",
        "It is the only star in space",
        "It is millions of times bigger than all other stars",
        "It is made of gold"
      ],
      answer: 0
    },
    {
      id: 26,
      question: "What happens to living plants if they are kept in a pitch-black room without any sunlight for weeks?",
      options: [
        "Their leaves turn yellow/pale and they weaken because they cannot perform photosynthesis",
        "They grow faster and healthier",
        "They turn into trees instantly",
        "Nothing happens at all"
      ],
      answer: 0
    },
    {
      id: 27,
      question: "Which type of cloud appears high in the sky, thin and wispy like feathers on a clear day?",
      options: ["Cirrus clouds", "Cumulonimbus storm clouds", "Fog", "Thick grey stratus clouds"],
      answer: 0
    },
    {
      id: 28,
      question: "How does the Sun play a key role in driving the Earth's weather system?",
      options: [
        "Its heat warms Earth's surface, causing air movement (wind) and water evaporation",
        "It creates soil on Earth",
        "It makes the ocean water freeze",
        "It pushes the Moon away"
      ],
      answer: 0
    },
    {
      id: 29,
      question: "What moon phase occurs when the Moon is positioned between the Earth and Sun, making it appear invisible in the night sky?",
      options: ["New Moon", "Full Moon", "Crescent Moon", "Half Moon"],
      answer: 0
    },
    {
      id: 30,
      question: "Why is it unsafe to seek shelter under a tall solitary tree during a severe thunderstorm with lightning?",
      options: [
        "Lightning tends to strike the tallest objects in an area",
        "Trees drop fruit during storms",
        "Rain falls harder under trees",
        "The tree will absorb all the air"
      ],
      answer: 0
    }
  ])
};

export const gradeTwoLessonQuizBanks: Record<GradeTwoMiniGameId, Bank> = {
  "clue-detective": clueDetectiveQuestions,
  "story-squeeze": storySqueezeQuestions,
  "emotion-echo": emotionEchoQuestions,
  "book-explorer": bookExplorerQuestions,
  "place-value-rocket": placeValueRocketQuestions,
  "snack-shop": pesoPinchPiggyQuestions,
  "array-garden": arrayGardenQuestions,
  "measurement-studio": measureAndShapeStudioQuestions,
  "eco-sorter": ecoSorterQuestions,
  "state-changer": stateChangerQuestions,
  "sky-splitter": skySplitterQuestions,
};