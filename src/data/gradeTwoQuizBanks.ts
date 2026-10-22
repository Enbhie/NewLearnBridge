import type { CategoryId } from "./learningContent";

export type LessonDifficulty = "easy" | "standard" | "challenge";

export type QuizQuestion = {
  prompt: string;
  options: string[];
  answer: string;
  hint: string;
  explanation: string;
};

type DifficultyBank = Record<LessonDifficulty, QuizQuestion[]>;

const question = (
  prompt: string,
  answer: string,
  wrongOne: string,
  wrongTwo: string,
  hint: string,
  explanation: string
): QuizQuestion => ({
  prompt,
  options: [answer, wrongOne, wrongTwo],
  answer,
  hint,
  explanation,
});

export const gradeTwoQuizBanks: Record<CategoryId, DifficultyBank> = {
  reading: {
    easy: [
      question("Which sound begins the word fish?", "/f/", "/sh/", "/m/", "Listen to the very first sound.", "Fish begins with the /f/ sound."),
      question("Which word rhymes with cake?", "lake", "cat", "cup", "A rhyming word has the same ending sound.", "Cake and lake both end with the /ake/ sound."),
      question("In “Nena fed the duck,” what did Nena feed?", "The duck", "A goat", "A kitten", "Find the animal named in the sentence.", "The sentence says Nena fed the duck."),
      question("Which word names a person?", "Farmer", "Quickly", "Green", "A person noun names someone.", "Farmer names a person."),
      question("Which word means the same as tiny?", "Small", "Loud", "Late", "Choose a word with a similar meaning.", "Tiny and small have similar meanings."),
      question("What is the first sound in the Filipino word bata?", "/b/", "/t/", "/a/", "Say bata and listen to its beginning.", "Bata begins with the /b/ sound."),
      question("In “A shell lay beside the pail,” what lay beside the pail?", "A shell", "A shoe", "A leaf", "Look for the thing described in the sentence.", "The sentence says a shell lay beside the pail."),
      question("Which word tells an action?", "Whispers", "Purple", "Window", "An action word tells what someone does.", "Whispers tells an action."),
      question("Which word is the opposite of wet?", "Dry", "Deep", "Soft", "An opposite word has a different meaning.", "Dry is the opposite of wet."),
      question("Which sound ends the word map?", "/p/", "/m/", "/a/", "Say map slowly and listen to its last sound.", "Map ends with the /p/ sound."),
    ],
    standard: [
      question("After her paper boat sank, Lani looked down and sighed. How does she probably feel?", "Disappointed", "Proud", "Sleepy", "Use her sigh and the boat sinking as clues.", "The failed boat and sigh suggest disappointment."),
      question("Tomas grinned when his cousin arrived with a board game. How does Tomas likely feel?", "Excited", "Angry", "Lonely", "Think about how a person might feel when a cousin brings a game.", "His grin suggests he is excited."),
      question("Mara heard a puppy whimpering alone in the rain and hurried to find an adult. What does this suggest about Mara?", "She is concerned for the puppy.", "She wants to play in the rain.", "She is looking for a book.", "Use Mara's response to the puppy as a clue.", "She hurries to get help because she cares about the puppy."),
      question("“The class reused jars as pencil holders, planted herbs, and watered them every day.” What is the main idea?", "The class cared for plants and reused materials.", "The class went swimming.", "The jars were full of pencils only.", "Ask what all the actions have in common.", "The examples show the class caring for a garden while reusing jars."),
      question("“A carabao helps loosen the soil. Farmers then plant rice and care for the field.” What is the main idea?", "A carabao can help farmers prepare a field.", "Rice grows inside a carabao.", "Farmers only care for animals.", "Look for the idea that connects the sentences.", "The details explain how a carabao helps with farm work."),
      question("“Mangroves grow near the shore. Their roots provide shelter for small sea animals.” What is the main idea?", "Mangroves can provide a home for sea animals.", "All sea animals live in trees.", "The shore is always dry.", "Notice what the roots do in the passage.", "The details explain how mangrove roots shelter animals."),
      question("Put the events in order: Joana packs a lunch, walks to the park, eats under a tree, then returns home. What happens second?", "She walks to the park.", "She packs a lunch.", "She returns home.", "Find the event after packing but before eating.", "Walking to the park is the second event."),
      question("Rafi opens a book, reads a recipe, mixes the batter, and bakes a cake. What happens third?", "He mixes the batter.", "He opens a book.", "He bakes a cake.", "Follow the steps in the order given.", "Mixing the batter comes third."),
      question("A seed is placed in soil, watered, begins to sprout, and grows leaves. What happens just before it grows leaves?", "It begins to sprout.", "It is placed in soil.", "It is watered again after flowering.", "Look for the event immediately before growing leaves.", "The seed sprouts before it grows leaves."),
      question("Pia gathers fallen leaves, puts them in a bin, carries the bin outside, and adds the leaves to compost. What is the last event?", "She adds the leaves to compost.", "She gathers fallen leaves.", "She puts them in a bin.", "Find what Pia does at the end.", "Adding the leaves to compost is the final event."),
    ],
    challenge: [
      question("A page explains how bees carry pollen between flowers and help plants make seeds. What is the author's purpose?", "To explain how bees help plants.", "To tell a funny story about a bee.", "To convince readers to buy honey.", "Ask what the page is mainly trying to do.", "The information explains a process in nature."),
      question("A poster says, “Bring a reusable bottle to school each day!” What is the author's purpose?", "To encourage readers to use reusable bottles.", "To describe how rain forms.", "To tell how a bottle is made.", "Look for the action the poster wants readers to take.", "The poster is persuading readers to bring a reusable bottle."),
      question("A short article lists the parts of a butterfly and describes how it changes as it grows. What is the author's purpose?", "To give information about butterflies.", "To make readers laugh at a butterfly.", "To ask readers to catch butterflies.", "Think about why an article gives facts and descriptions.", "The article informs readers about a butterfly's life."),
      question("A storybook describes a shy turtle who joins a dance and makes new friends. What is the author's purpose?", "To entertain with a story.", "To give directions for building a pond.", "To report today's weather.", "Notice whether the text tells a story or gives facts.", "The characters and events are meant to entertain."),
      question("The school garden's soil dried out during a week without rain. What caused the soil to dry?", "There was no rain for a week.", "The garden had many flowers.", "The class painted a sign.", "Find the event that led to the dry soil.", "The lack of rain caused the soil to dry."),
      question("A gust blew a kite into a tree, so the children asked a grown-up for help. Why did they ask for help?", "The kite was stuck in the tree.", "The kite had landed in their hands.", "They wanted to fly indoors.", "Connect the problem to the children's action.", "They needed help because the kite was caught in a tree."),
      question("A classroom plant leaned toward the sunny window. What most likely caused it to lean that way?", "It was growing toward the light.", "It was trying to reach a book.", "The window pulled it with a string.", "Think about what plants do when seeking light.", "The plant likely leaned toward the sunlight."),
      question("A cloud darkens, cool drops begin to fall, and a family has left its washing outside. What will probably happen next?", "The washing may get wet.", "The washing will turn into stones.", "The Sun will move into the house.", "Use the falling drops to predict what happens to the clothes.", "Rain will likely make the washing wet."),
      question("A child places an ice pop in a warm lunch bag. What will probably happen if it stays there?", "It will soften and melt.", "It will grow larger and freeze.", "It will become a paper toy.", "Use what warmth does to frozen treats.", "The warm bag will make the ice pop melt."),
      question("A path is covered with fallen branches after strong wind. What is a sensible prediction for someone walking there?", "They may need to go around the branches.", "The branches will become a bridge by themselves.", "The path will disappear underground.", "Think about how the branches affect the path.", "The walker will probably avoid the blocked part."),
    ],
  },
  math: {
    easy: [
      question("In 472, how many hundreds are there?", "4", "7", "2", "Look at the digit in the hundreds place.", "The 4 is in the hundreds place."),
      question("What is the value of 9 in 905?", "900", "90", "9", "The 9 is in the hundreds place.", "Nine hundreds have a value of 900."),
      question("Which number has 6 tens, 3 ones, and 1 hundred?", "163", "136", "613", "Write the hundreds, then tens, then ones.", "One hundred, six tens, and three ones make 163."),
      question("Which expanded form matches 280?", "200 + 80", "20 + 8", "800 + 20", "Break the number into hundreds and tens.", "280 has 2 hundreds and 8 tens."),
      question("What is 8 + 7?", "15", "14", "16", "Count on 7 from 8.", "8 + 7 = 15."),
      question("What is 9 - 4?", "5", "6", "4", "Take 4 away from 9.", "9 - 4 = 5."),
      question("What is 6 + 3?", "9", "8", "10", "Count 3 more after 6.", "6 + 3 = 9."),
      question("A Philippine ₱1 coin is shown. What value is written on the coin?", "₱1", "₱5", "₱10", "Read the denomination on the coin.", "The coin is worth one peso."),
      question("Which coin is worth five Philippine pesos?", "₱5 coin", "₱1 coin", "₱10 coin", "Choose the coin with the five-peso denomination.", "A ₱5 coin is worth five pesos."),
      question("Which coin has a value of ten Philippine pesos?", "₱10 coin", "₱1 coin", "₱5 coin", "Look for the ten-peso denomination.", "A ₱10 coin is worth ten pesos."),
    ],
    standard: [
      question("What is 47 + 186?", "233", "223", "243", "Add the ones and regroup before adding the tens and hundreds.", "47 + 186 = 233."),
      question("Find 68 + 257.", "325", "315", "335", "Regroup the ones and tens as you add.", "68 + 257 = 325."),
      question("What is 92 + 438?", "530", "520", "540", "Add each place value and regroup when needed.", "92 + 438 = 530."),
      question("Solve 724 - 386.", "338", "348", "328", "Regroup across the tens place before subtracting.", "724 - 386 = 338."),
      question("The short hand is almost at three and the long hand points to ten. Which time is on the clock?", "2:50", "3:50", "2:10", "The long hand counts the minutes; each mark is worth five minutes.", "The long hand at ten means 50 minutes, and the short hand is still in the two o'clock hour."),
      question("The short hand is just past five and the long hand points to five. What time is shown?", "5:25", "5:05", "1:25", "Count the minute marks by fives from the top of the clock.", "The long hand at five means 25 minutes past five."),
      question("The short hand is just past ten and the long hand points to two. What time is it?", "10:10", "10:20", "11:10", "The long hand counts minutes in groups of five.", "The long hand at two means ten minutes past ten."),
      question("An array has 3 rows with 7 dots in each row. How many dots are there?", "21", "10", "24", "Count 7 three times or multiply the rows by dots per row.", "3 rows of 7 make 21 dots."),
      question("A garden has 4 rows of 6 seedlings. How many seedlings are planted?", "24", "20", "28", "Multiply the number of rows by the seedlings in each row.", "4 groups of 6 make 24 seedlings."),
      question("A display has 8 columns with 2 shells in each column. How many shells are shown?", "16", "10", "18", "Use equal groups: 8 groups of 2.", "8 groups of 2 make 16 shells."),
    ],
    challenge: [
      question("Niko has ₱360. He buys a book for ₱43 and a ruler for ₱26. How much money remains?", "₱291", "₱301", "₱281", "Add the two prices, then subtract from ₱360.", "₱43 + ₱26 = ₱69; ₱360 - ₱69 = ₱291."),
      question("A family buys 5 rice cakes at ₱23 each and pays with ₱200. What is the change?", "₱85", "₱95", "₱75", "Find the cost of 5 rice cakes before subtracting from ₱200.", "5 × ₱23 = ₱115; ₱200 - ₱115 = ₱85."),
      question("Lara saves ₱75, then earns ₱40 more and spends ₱29 on art paper. How much does she have now?", "₱86", "₱96", "₱104", "Add her savings and earnings, then subtract the cost.", "₱75 + ₱40 - ₱29 = ₱86."),
      question("A snack costs ₱34 and a juice costs ₱12. Ben pays with ₱100. How much money remains after both purchases?", "₱54", "₱64", "₱44", "Add both costs, then subtract the total from ₱100.", "₱34 + ₱12 = ₱46; ₱100 - ₱46 = ₱54."),
      question("Find the missing number: 13, 26, 39, __, 65.", "52", "51", "53", "Check how much each number increases.", "The pattern adds 13, so the missing number is 52."),
      question("Complete the pattern: 96, 88, 80, __, 64.", "72", "74", "70", "Notice the amount subtracted each time.", "The pattern subtracts 8; 80 - 8 = 72."),
      question("What number is missing? 19, 38, 76, 152, __.", "304", "288", "306", "Look for a rule connecting each term to the next.", "Each number doubles, so 152 × 2 = 304."),
      question("A paper strip is divided into 9 equal parts. What fraction is one part?", "1/9", "1/3", "9/1", "The numerator is one part; the denominator is the total equal parts.", "One of nine equal parts is 1/9."),
      question("A watermelon is cut into 8 equal slices. Mina eats 5 slices. What fraction of the whole watermelon did she eat?", "5/8", "8/5", "1/8", "Write the number eaten over the total equal slices.", "Mina ate 5 of 8 equal slices, or 5/8."),
      question("A shape is divided into 10 equal parts. If 3 parts are shaded, what fraction is shaded?", "3/10", "1/10", "10/3", "Count shaded parts and place that number over the total parts.", "Three of the 10 equal parts are shaded, so 3/10 is shaded."),
    ],
  },
  science: {
    easy: [
      question("Which one is living?", "A sprouting bean plant", "A glass marble", "A wooden spoon", "Choose something that can grow.", "A bean plant is living and can grow."),
      question("Which one is non-living?", "A paper kite", "A young puppy", "A growing fern", "Choose something that does not grow or need food.", "A paper kite is non-living."),
      question("A snail moves across a wet leaf. Which thing is living?", "The snail", "The leaf after it has fallen", "A rain boot", "Look for the animal in the scene.", "The snail is an animal and is living."),
      question("Which word describes weather with many clouds covering the sky?", "Cloudy", "Foggy inside a room", "Underground", "Choose the weather word that tells about clouds.", "A sky covered with clouds is cloudy."),
      question("What type of weather has moving air that blows tree branches?", "Windy", "Sunny", "Snowy", "Think about air that you can feel moving.", "Moving air is wind."),
      question("Rain is falling from dark clouds. What is the weather like?", "Rainy", "Dry", "Clear", "Use the falling water as your clue.", "Falling rain means rainy weather."),
      question("What object can be seen in the daytime sky and gives us light?", "The Sun", "A fish", "A seashell", "Look for the bright object that lights the day.", "The Sun is seen in the daytime sky."),
      question("Which object appears in the night sky and reflects sunlight?", "The Moon", "A mountain", "A flower", "Look for Earth's natural companion in the sky.", "The Moon is visible in the night sky."),
      question("Which tiny objects appear like points of light in a clear night sky?", "Stars", "Pebbles", "Raindrops on the ground", "Look up at the distant lights after dark.", "Stars appear as points of light in the night sky."),
      question("Which object travels across the sky and is made by people?", "An airplane", "A cloud", "The Moon", "Choose the object people build for air travel.", "An airplane is a human-made object in the sky."),
    ],
    standard: [
      question("Which statement describes a solid block of wood?", "It keeps its own shape.", "It spreads to fill its container.", "It flows and takes the container's shape.", "Think about whether the wood keeps a fixed shape.", "A solid keeps its own shape."),
      question("What happens when juice is poured into a different-shaped cup?", "It takes the shape of the cup.", "It keeps a hard shape of its own.", "It becomes a gas immediately.", "Think about how a liquid behaves in a container.", "A liquid flows and takes the container's shape."),
      question("Which statement describes water vapor in the air?", "It is a gas that spreads out.", "It keeps the shape of a block.", "It stays only at the bottom of a cup.", "Think about how a gas moves through space.", "A gas spreads out to fill available space."),
      question("A potted plant is kept in a dark closet and its leaves become weak. What basic need is missing?", "Light", "A toy", "A loud sound", "Think about what plants use to grow and make food.", "The plant needs light."),
      question("What does a young bird need from its parent to grow?", "Food and protection", "A glass of paint", "A new nest every hour", "Choose resources that help an animal survive.", "Young birds need food and protection."),
      question("A rabbit has clean water and food but no safe place to hide. What need is missing?", "Shelter", "Sunlight for making leaves", "A school desk", "Think about a safe place where an animal can rest.", "A safe place to hide is shelter."),
      question("A flagpole's shadow is short at midday and longer later in the afternoon. What does this show?", "The direction of sunlight changes as the day passes.", "The flagpole grows taller every hour.", "The ground is turning into water.", "Compare the shadow at the two different times.", "The Sun's changing position makes shadows change during the day."),
      question("After sunset, a family turns on lamps and prepares to rest. What change does this show?", "People adjust their activities when day changes to night.", "The family is making a new star.", "The lamps make the Sun rise.", "Think about how routines change after daylight ends.", "Families often change from daytime activities to nighttime routines."),
      question("A puddle is still outside after a cool night. Which observation is most likely?", "The water stays liquid if it has not frozen.", "The water becomes a wooden block.", "The water turns into soil.", "Think about the state of liquid water in cool but nonfreezing conditions.", "Water remains liquid unless it freezes."),
      question("A balloon is filled with air. Which statement about the air is true?", "It is a gas inside the balloon.", "It is a solid with a fixed shape.", "It is a liquid that can be poured.", "Air spreads out and takes the space inside the balloon.", "Air is a gas that fills the balloon."),
    ],
    challenge: [
      question("An ice cube is left on a sunny windowsill. What change will most likely happen?", "It will melt into liquid water.", "It will freeze into a larger ice cube.", "It will change into a solid rock.", "Warmth can change frozen water into liquid.", "The ice cube will melt."),
      question("Water is placed in a freezer for several hours. What should happen?", "It will freeze into solid ice.", "It will turn into sand.", "It will become warmer liquid.", "Think about what a freezer does to water.", "Cold temperatures can freeze water into ice."),
      question("A cool drink has water droplets on the outside of its cold glass. Where did the droplets come from?", "Water vapor in the air cooled into liquid droplets.", "The glass leaked through solid glass.", "The drink turned into tiny stones.", "Consider how water vapor changes when cooled.", "Water vapor can condense into liquid on a cool surface."),
      question("A lizard living on pale sandy ground is difficult to see. How can its coloring help it?", "It helps the lizard blend into its habitat.", "It helps the lizard make its own water.", "It changes the sand into food.", "Think about how matching surroundings can protect an animal.", "Camouflage helps the lizard blend in."),
      question("A duck has webbed feet and lives near a pond. How do its feet help it?", "They help it paddle through water.", "They help it climb tall trees.", "They help it breathe underwater.", "Connect the foot shape to how a duck moves.", "Webbed feet help a duck paddle."),
      question("A cactus grows where rain is rare. Which feature helps it survive?", "A thick stem that stores water.", "Wide, thin leaves that lose water quickly.", "Roots that grow above the ground only.", "Think about a feature useful when water is scarce.", "A thick stem can store water."),
      question("A class finds snack wrappers beside a stream. What is the best Makakalikasan action?", "With an adult, put the wrappers in the proper bin.", "Push the wrappers into the water.", "Leave more wrappers for the fish.", "Choose an action that keeps the water clean and safe.", "Proper disposal helps protect the stream and living things."),
      question("A family sees a leaking tap in the school garden. What should they do to care for the environment?", "Tell an adult so the tap can be fixed and water saved.", "Leave it running all afternoon.", "Cover it with leaves and walk away.", "Think of a safe way to prevent wasting water.", "Reporting the leak helps save water."),
      question("A child notices a bird's nest in a tree while cleaning a park. Which action shows care for living things?", "Keep a respectful distance and avoid disturbing the nest.", "Shake the branch to see inside.", "Take the eggs home.", "Protect the animals while caring for the shared space.", "Leaving the nest undisturbed helps protect the birds."),
      question("A garden has fewer butterflies after many flowering plants are removed. What is a helpful way to improve the habitat?", "Plant suitable flowers and care for them.", "Remove every remaining plant.", "Cover the garden with plastic.", "Think about what butterflies need from flowering plants.", "Flowers provide food and habitat resources for butterflies."),
    ],
  },
};
