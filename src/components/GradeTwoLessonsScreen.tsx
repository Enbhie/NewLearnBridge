import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AnimatedPressable as Pressable } from "./AnimatedPressable";
import type { CategoryId } from "../data/learningContent";
import { playFeedback } from "../utils/soundEffects";
import { AppAppearanceContext } from "./CloudBackdrop";

export type LessonDifficulty = "easy" | "standard" | "challenge";

type Challenge = {
  prompt: string;
  options: string[];
  answer: string;
  hint: string;
  explanation: string;
};

type Lesson = {
  id: string;
  title: string;
  overview: string;
  topics: string[];
  questions: Record<LessonDifficulty, Challenge[]>;
};

type Subject = {
  id: CategoryId;
  title: string;
  emoji: string;
  lessons: Lesson[];
};

const q = (
  prompt: string,
  answer: string,
  wrongOne: string,
  wrongTwo: string,
  hint: string,
  explanation: string
): Challenge => ({
  prompt,
  options: [answer, wrongOne, wrongTwo],
  answer,
  hint,
  explanation,
});

const subjects: Subject[] = [
  {
    id: "reading",
    title: "Reading Comprehension",
    emoji: "📖",
    lessons: [
      {
        id: "story-elements",
        title: "Quarter 1: Phonemic Awareness and Story Elements",
        overview: "Listen for sounds, connect letters with phonemes, and explore stories and words.",
        topics: [
          "Connect English and Filipino letters with their sounds; identify sounds heard in the environment.",
          "Identify characters, setting, theme, and events in a story.",
          "Recognize common and proper nouns, articles (a/an), and action verbs.",
        ],
        questions: {
          easy: [
            q("Which sound begins the English word sun?", "/s/", "/m/", "/t/", "Say sun slowly and listen to its first sound.", "Sun begins with the /s/ sound."),
            q("In a story about Ana visiting a farm, who is a character?", "Ana", "The farm", "The morning", "A character is a person or animal in a story.", "Ana is the person in the story."),
            q("Which word is an action word (verb)?", "runs", "blue", "table", "An action word tells what someone does.", "Runs names an action."),
            q("Which sound begins the Filipino word araw?", "/a/", "/b/", "/m/", "Listen to the first sound in araw.", "Araw begins with the /a/ sound."),
            q("Which word names a person?", "teacher", "jump", "yellow", "A noun names a person, place, animal, or thing.", "Teacher names a person."),
            q("Which word is a common noun?", "city", "Manila", "Jairus", "A common noun names a general person, place, or thing.", "City is a general place name."),
            q("Which word completes the phrase: ___ apple?", "an", "a", "the", "Apple begins with a vowel sound.", "Use an before a vowel sound."),
            q("Which word names a place in a story?", "school", "laughs", "gentle", "A setting tells where a story happens.", "School can name a story's place."),
            q("Which is an environmental sound?", "A bird chirping", "A green leaf", "A round ball", "Think of a sound you might hear outside.", "A bird chirping is a sound in the environment."),
            q("Which word tells an action?", "claps", "pencil", "soft", "An action word tells what someone does.", "Claps tells an action."),
          ],
          standard: [
            q("Which pair has a letter and its beginning sound for Filipino bahay?", "B and /b/", "M and /b/", "B and /s/", "Listen to the first sound in bahay.", "Bah ay begins with /b/, written with the letter B."),
            q("A story happens at the beach at sunset. What does this tell you?", "The setting", "The character's name", "The story's ending", "Setting tells where and when.", "The beach and sunset describe the setting."),
            q("Which sentence uses a proper noun?", "Liza reads a book.", "The girl reads a book.", "A child reads.", "A proper noun names a specific person or place.", "Liza is the specific name, so it is a proper noun."),
            q("Which letter represents the first sound in Filipino mata?", "M", "S", "T", "Say mata and listen to its first phoneme.", "Mata begins with /m/, represented by M."),
            q("In “The children play at the park,” where is the setting?", "At the park", "The children", "Play", "Look for the place in the sentence.", "The park is where the action happens."),
            q("Which word is a proper noun?", "Cebu", "island", "school", "A proper noun names a specific place.", "Cebu is the name of a specific place."),
            q("Which sentence uses an article correctly?", "A dog naps.", "An dog naps.", "Dog a naps.", "Dog begins with a consonant sound.", "Use a before the consonant sound in dog."),
            q("Which word is the verb in “Bea paints a flower”?", "paints", "Bea", "flower", "Find the word that tells what Bea does.", "Paints is the action Bea performs."),
            q("Which detail tells when a story happens?", "It was early in the morning.", "They rode bicycles.", "The kitten was small.", "Look for a time clue.", "Early in the morning tells when."),
            q("Which pair starts with the same sound: moon and mat?", "Yes, both begin with /m/.", "No, one begins with /s/.", "No, they rhyme.", "Listen to the first sound in each word.", "Moon and mat both begin with /m/."),
          ],
          challenge: [
            q("Miko hears a bell, then sees a class enter. Which sound most likely came from the environment?", "The school bell ringing", "The word class on a page", "A character's name", "Choose a sound you could hear around you.", "A ringing bell is an environmental sound."),
            q("A story's characters help a neighbor, and the events show kindness. What is a likely theme?", "Helping others is kind.", "The story happens on Tuesday.", "The neighbor wears a hat.", "A theme is a message learned from events.", "The characters' actions suggest the message that helping others is kind."),
            q("Which sentence correctly uses an article and an action verb?", "An owl flies.", "A owl sleeps.", "The owl blue.", "Use an before a vowel sound and choose a verb for the action.", "Owl begins with a vowel sound, and flies is an action verb."),
            q("A story is about a child who keeps practicing and finally learns to swim. What is a likely theme?", "Practice can help you learn.", "Swimming happens in a kitchen.", "The child has a towel.", "A theme is the message suggested by story events.", "The events show that practice helped the child learn."),
            q("Which sentence has a common noun and a proper noun?", "Rosa visits the garden.", "She visits a.", "Visits Rosa the.", "Find a general noun and the name of a specific person.", "Rosa is a proper noun; garden is a common noun."),
            q("Why is “The puppy barked because it heard a sound” a complete idea?", "It names who acted and what happened.", "It only lists two colors.", "It has no action.", "A sentence shares a complete thought with an action.", "Puppy is the subject and barked is the action."),
            q("Which word correctly completes the sentence: “___ iguana is on the rock”?", "An", "A", "Those", "Iguana begins with a vowel sound.", "An is used before the vowel sound at the start of iguana."),
            q("The story says, “At noon, Lani opened her lunchbox.” What does noon tell you?", "When the event happened", "Who the character is", "Where the story takes place", "Look for the time clue.", "Noon tells when Lani opened her lunchbox."),
            q("Which event is most likely the beginning of a story about planting?", "Nico puts seeds in the soil.", "A tall plant gives fruit.", "Nico picks ripe fruit.", "A plot has events in an order.", "Planting seeds would happen before the plant grows and gives fruit."),
            q("Which sound pair has the same final phoneme?", "bus and rice", "map and moon", "sun and sock", "Listen to the last sound in each word.", "Bus and rice both end in the /s/ sound."),
          ],
        },
      },
      {
        id: "text-features",
        title: "Quarter 2: Text Features and Sequence",
        overview: "Use book parts and story clues to understand what you read and what may happen next.",
        topics: [
          "Identify the cover, title page, author, and illustrator.",
          "Sequence events with first, next, and last; predict outcomes using illustrations and clues.",
          "Build word knowledge with word families, synonyms, and antonyms.",
        ],
        questions: {
          easy: [
            q("Who writes the words in a book?", "The author", "The illustrator", "The reader", "Look for the person who wrote the story.", "The author writes the words."),
            q("Which word means the same as happy?", "glad", "sad", "slow", "A synonym has a similar meaning.", "Glad and happy have similar meanings."),
            q("Which word rhymes with cat and belongs to its word family?", "hat", "sun", "dog", "Listen for the same ending sound.", "Hat shares the -at word-family ending with cat."),
            q("Who draws the pictures in a book?", "The illustrator", "The author", "The reader", "Look for the person who makes the illustrations.", "The illustrator creates the pictures."),
            q("Which part of a book protects its pages?", "The cover", "The character", "The last sentence", "Find the outside part of a book.", "The cover protects the pages."),
            q("Which word means the same as big?", "large", "tiny", "slow", "A synonym has a similar meaning.", "Large and big have similar meanings."),
            q("Which word rhymes with sun?", "fun", "sit", "sock", "Listen for the same ending sound.", "Sun and fun rhyme."),
            q("What word tells what a book is called?", "Title", "Page", "Brush", "Look for the book's name.", "The title is the name of a book."),
            q("Which word is the opposite of hot?", "cold", "warm", "boiling", "An antonym means the opposite.", "Cold is the opposite of hot."),
            q("Which picture would you look at to guess what a story is about?", "The cover illustration", "A blank page", "The page number", "Look at the picture on the front of the book.", "The cover illustration can give clues about the story."),
          ],
          standard: [
            q("A child puts on shoes, walks to school, then enters class. What happens next after putting on shoes?", "The child walks to school.", "The child enters class.", "The child goes to sleep.", "Put the events in the order they would happen.", "Walking to school comes after putting on shoes."),
            q("The cover shows a girl holding a watering can beside dry plants. What might happen in the story?", "She may water the plants.", "She may swim in the ocean.", "She may bake a cake.", "Use the picture as a clue for your prediction.", "The watering can suggests she may water the plants."),
            q("Which word is an antonym of noisy?", "quiet", "loud", "busy", "An antonym means the opposite.", "Quiet is the opposite of noisy."),
            q("A book has a title page and an author name. What does the author do?", "Writes the book", "Draws every picture", "Reads it to the class", "Think about who creates the written story.", "The author writes the words in the book."),
            q("Which event comes last: wash hands, eat lunch, sit at the table?", "Eat lunch", "Wash hands", "Sit at the table", "Put the actions in a sensible order.", "Eating lunch comes after washing hands and sitting down."),
            q("A picture shows dark clouds and a child carrying an umbrella. What might happen next?", "It may rain.", "The child may bake bread.", "The clouds may become a book.", "Use the illustration as a clue.", "Dark clouds and an umbrella suggest rain."),
            q("Which word is a synonym of quick?", "fast", "late", "quiet", "Choose a word with a similar meaning.", "Quick and fast mean nearly the same thing."),
            q("Which word is an antonym of empty?", "full", "blank", "open", "Choose the opposite meaning.", "Full is the opposite of empty."),
            q("Which word belongs to the -ake word family?", "cake", "cook", "kite", "Look for the same ending letters and sound.", "Cake shares the -ake ending."),
            q("Where can you usually find the illustrator's name?", "On the cover or title page", "Inside a character's speech", "On a clock", "Check the book information near its title.", "The illustrator is often credited on the cover or title page."),
          ],
          challenge: [
            q("Which book part usually lists the title and author before the story begins?", "The title page", "The last illustration", "The back cover only", "Find the page inside the book that introduces it.", "The title page usually gives the book's title and author."),
            q("A story says, “First, Jo planted seeds. Next, she watered them.” What is the best prediction?", "The seeds may begin to grow.", "Jo will unplant the seeds.", "The story is already over.", "Combine the order clues with what you know about seeds.", "After planting and watering, seeds may begin to grow."),
            q("Which pair are antonyms?", "begin and end", "small and tiny", "glad and happy", "Antonyms have opposite meanings.", "Begin and end describe opposite parts of a sequence."),
            q("A book's title page names the author and illustrator. Who is responsible for the pictures?", "The illustrator", "The author only", "The reader", "Match each book role to its job.", "The illustrator makes the pictures."),
            q("A story says a seed was planted, watered, and then sprouted. Which event happened second?", "It was watered.", "It sprouted.", "It was planted.", "Follow the sequence words and events.", "Watering happened after planting and before sprouting."),
            q("A cover shows a lost kitten beside a mailbox. What is the best prediction?", "Someone may help find the kitten's home.", "The kitten will drive a bus.", "The mailbox will eat the kitten.", "Choose a likely event based on the cover clues.", "A lost kitten near a mailbox may be found or helped home."),
            q("Which word is an antonym of narrow?", "wide", "thin", "small", "Choose the word with the opposite meaning.", "Wide is the opposite of narrow."),
            q("Which pair are synonyms?", "begin and start", "up and down", "wet and dry", "Synonyms have similar meanings.", "Begin and start mean nearly the same thing."),
            q("Which word belongs to the -ight word family?", "light", "laugh", "little", "Listen for the shared ending sound and spelling.", "Light shares the -ight word-family pattern."),
            q("A paragraph says, “First, Tia mixed flour and water. Next, she shaped the dough. Last, she baked it.” What happened last?", "She baked it.", "She mixed the ingredients.", "She shaped the dough.", "Look for the event after the word last.", "Baking is the final event."),
          ],
        },
      },
      {
        id: "critical-thinking",
        title: "Quarter 3: Critical Thinking and Text Types",
        overview: "Use details to make inferences, tell facts from make-believe, and read with expression.",
        topics: [
          "Answer who, what, where, when, and why questions about passages.",
          "Distinguish factual information from make-believe stories.",
          "Practice choral speaking and echo reading with short poems, rhymes, and stories.",
        ],
        questions: {
          easy: [
            q("A passage says, “Tina fed the duck.” Who fed the duck?", "Tina", "The duck", "Nobody", "Look for the person named in the sentence.", "Tina is the person who fed the duck."),
            q("Which could happen in real life?", "A child rides a bicycle.", "A talking shoe flies to the moon.", "A cloud eats a sandwich.", "A fact can be checked in the real world.", "A child can ride a bicycle."),
            q("When echo reading, what do you do?", "Repeat after the reader.", "Read a different page silently.", "Skip every other word.", "Echo means to repeat a sound or words.", "In echo reading, you repeat the words after someone reads them."),
            q("A passage says, “Omar found a shell.” What did Omar find?", "A shell", "A shoe", "A kite", "Find the thing named in the sentence.", "Omar found a shell."),
            q("Where do fish usually live?", "In water", "In a tree", "In a desk", "Think of the place where fish can swim.", "Fish live in water."),
            q("Which sentence is a fact?", "A turtle has a shell.", "A turtle writes a letter.", "A turtle flies to the Moon.", "Choose something that can be checked in real life.", "Turtles have shells."),
            q("What do readers do during choral reading?", "Read aloud together", "Draw alone", "Close the book", "Choral means a group doing something together.", "Readers say the text aloud as a group."),
            q("When does “We ate breakfast before school” happen?", "Before school", "After bedtime only", "At the beach", "Look for the time-order clue.", "The sentence says breakfast was before school."),
            q("Which could be make-believe?", "A rabbit talks to a tree", "A child drinks water", "A bird builds a nest", "Look for an event that cannot happen in real life.", "A talking rabbit is make-believe."),
            q("Which question asks who?", "Who found the shell?", "Where is the shell?", "When was it found?", "A who question asks about a person or character.", "Who found the shell asks for a person."),
          ],
          standard: [
            q("A passage says, “Leo wore boots because the path was muddy.” Why did Leo wear boots?", "The path was muddy.", "He was going to bed.", "It was his birthday.", "Find the reason signaled by because.", "The muddy path explains why Leo wore boots."),
            q("Which detail is a fact rather than make-believe?", "Rain can make the ground wet.", "A pencil can talk.", "A fish can read a book.", "Choose something that can be observed and checked.", "Rain making ground wet is a real-world fact."),
            q("A group reads a poem aloud together. What is this called?", "Choral speaking", "Silent reading", "Drawing a diagram", "The group says the words together.", "Reading aloud together is choral speaking."),
            q("A passage says, “Nena went inside when the rain began.” When did Nena go inside?", "When the rain began", "Before she woke up", "Next summer", "Look for the time clue in the sentence.", "She went inside when the rain began."),
            q("A passage says Ben planted a seed in a pot. Where did he plant it?", "In a pot", "At the library", "In a shoe", "Find the place named in the sentence.", "Ben planted the seed in a pot."),
            q("Which statement is factual?", "Some birds build nests.", "A bird reads a newspaper.", "A bird drives a car.", "Choose something that occurs in the real world.", "Some birds build nests."),
            q("During echo reading, what should the student do after hearing a line?", "Repeat the line", "Change every word", "Skip to the end", "Echo reading repeats a model.", "The student repeats the line after hearing it."),
            q("A passage says, “The class planted flowers so the yard would look bright.” Why did the class plant flowers?", "To make the yard look bright", "To make it rain", "To build a boat", "Find the reason after the word so.", "The flowers were planted to brighten the yard."),
            q("Which event could be verified as a fact?", "Water freezes when it gets cold enough.", "A mountain sings at night.", "A book swims in a lake.", "Choose a claim that can be tested or observed.", "Water can freeze when cooled enough."),
            q("Which question asks where?", "Where did the class plant flowers?", "Why did they plant flowers?", "Who planted the flowers?", "A where question asks for a place.", "Where asks about location."),
          ],
          challenge: [
            q("Maya carried an umbrella, and drops tapped on the roof. What can you infer about the weather?", "It is probably raining.", "It is certainly snowing.", "There is no weather outside.", "Use both clues to reach a likely conclusion.", "An umbrella and tapping drops suggest rain."),
            q("Which sentence describes make-believe?", "A tiny dragon helps a baker make bread.", "A baker mixes flour and water.", "Bread can be baked in an oven.", "Look for an event that cannot happen in real life.", "A dragon helping a baker is an imaginary event."),
            q("In a poem, one reader says a line and the class repeats it. Which strategy is being practiced?", "Echo reading", "Fact checking", "Sequencing", "Listen for the repeat-after-me pattern.", "The class echoes the reader's line."),
            q("Luz brought a towel and changed into dry clothes after leaving the pool. What can you infer?", "She had been swimming.", "She was planting a tree.", "She was reading in bed.", "Use the clues and what you know about towels.", "A pool, towel, and dry clothes suggest Luz went swimming."),
            q("Which statement is make-believe rather than a fact?", "A talking mango gives directions.", "Mangoes grow on trees.", "People can eat mangoes.", "Find the event that could not really happen.", "A mango cannot talk or give directions."),
            q("A story says, “The lights went out, so Pio found a flashlight.” Why did he find a flashlight?", "The lights went out.", "He wanted to bake a cake.", "It was time for lunch.", "Use the cause-and-effect clue so.", "The power going out caused Pio to find a flashlight."),
            q("Which question asks when?", "When did the parade begin?", "Who led the parade?", "Where did it go?", "A when question asks for a time.", "When asks about the time something happened."),
            q("Which sentence is most likely a fact?", "The Moon appears in the night sky.", "The Moon eats the stars.", "The Moon tells jokes to Earth.", "Choose something that can be observed.", "The Moon can be seen in the sky."),
            q("A student reads a short poem with the class, repeating each line after the teacher. Which skills are practiced?", "Echo reading and expression", "Silent reading only", "Counting and measuring", "Listen for how the student follows and voices the lines.", "Repeating a model poem aloud is echo reading with expression."),
            q("A passage says, “Ari put the seed in soil, watered it, and waited. A green shoot appeared.” What happened before the shoot appeared?", "Ari planted and watered the seed.", "Ari picked fruit from a tree.", "Ari put the seed in a book.", "Use the sequence of details in the passage.", "Planting and watering came before the shoot appeared."),
          ],
        },
      },
      {
        id: "independent-reading",
        title: "Quarter 4: Independent Reading and Application",
        overview: "Read short words and stories, notice grammar patterns, and write about what you read.",
        topics: [
          "Read short-vowel CVC and sight words, phrases, and short stories.",
          "Use this/that/these/those and prepositions such as on, under, and in.",
          "Write simple sentences or short responses about characters and illustrations.",
        ],
        questions: {
          easy: [
            q("Which word is a CVC word with a short a sound?", "map", "moon", "bike", "CVC words have consonant-vowel-consonant letters.", "Map has three letters and a short a sound."),
            q("Which word names one book nearby?", "this", "those", "these", "Use this for one thing close by.", "This points to one nearby thing."),
            q("Where is the ball? It is ___ the box.", "in", "under", "between", "Choose the word that means inside.", "In means inside the box."),
            q("Which word has a short e sound?", "hen", "tree", "feet", "Say each word and listen to the vowel.", "Hen has a short e sound."),
            q("Which word is a sight word?", "said", "splim", "vop", "Choose a familiar word often recognized by sight.", "Said is a common sight word."),
            q("One nearby pencil: “___ pencil is sharp.”", "This", "Those", "These", "Use this for one nearby thing.", "This is used for a single nearby pencil."),
            q("Where are the shoes? They are ___ the bed.", "under", "on", "in", "Choose the word that means below.", "Under means below the bed."),
            q("Which CVC word has a short i sound?", "pig", "pie", "pine", "Listen for a short vowel sound.", "Pig has a short i sound and three letters."),
            q("A picture shows a cat. Which sentence tells about the picture?", "The cat naps.", "Cat the naps.", "The nap cat.", "Put the person or animal before its action.", "The cat naps is a complete simple sentence."),
            q("Which word tells where the fish is? “The fish swims ___ the pond.”", "in", "blue", "fast", "Choose the word that names a place relationship.", "In tells where the fish swims."),
          ],
          standard: [
            q("Which word has a short i sound?", "sit", "seat", "kite", "Say each word and listen to the vowel sound.", "Sit has the short i sound."),
            q("You are pointing to several faraway trees. Which word fits?", "those", "this", "that", "Use those for more than one thing far away.", "Those points to several things at a distance."),
            q("Which sentence is written correctly about a picture of a boy reading?", "The boy reads a book.", "Boy book reads the.", "The boy a book read.", "A sentence needs words in an order that makes sense.", "The boy reads a book is a complete sentence."),
            q("Which word has a short o sound?", "hot", "home", "hope", "Listen to the vowel sound in each word.", "Hot has a short o sound."),
            q("Which word is a sight word in the sentence “They went home”?", "they", "glorp", "flane", "Choose the familiar word that readers often recognize quickly.", "They is a common sight word."),
            q("You point to one nearby bag. Which sentence is correct?", "This bag is mine.", "These bag is mine.", "Those bag is mine.", "Use this for one nearby object.", "This agrees with the singular noun bag."),
            q("The puppy is ___ the table, not on top of it.", "under", "beside", "above", "Choose the word that means below.", "Under shows the puppy is below the table."),
            q("Which word has a short u sound?", "cup", "cube", "cute", "Say each word and listen to its vowel sound.", "Cup has a short u sound."),
            q("Which sentence uses a demonstrative pronoun for several nearby objects?", "These are my blocks.", "That is my block.", "This are my blocks.", "Use these for multiple things close by.", "These correctly refers to several nearby blocks."),
            q("A picture shows a bird sitting on a branch. Which sentence matches it?", "The bird sits on the branch.", "The bird swim in water.", "The branch is flying.", "Choose the sentence that matches the illustration.", "The sentence describes the bird on the branch."),
          ],
          challenge: [
            q("Which set contains only short-vowel CVC words?", "cat, pen, sun", "cake, boat, bike", "tree, play, moon", "Check for three letters and a short vowel in each word.", "Cat, pen, and sun are short-vowel CVC words."),
            q("A student points to two nearby crayons. Which sentence is correct?", "These are my crayons.", "This are my crayons.", "Those is my crayon.", "Use these for more than one nearby thing.", "These agrees with the plural noun crayons."),
            q("Which sentence uses a preposition to explain where the cat is?", "The cat sleeps under the chair.", "The cat is fluffy.", "The cat purrs loudly.", "A preposition can tell where something is.", "Under tells where the cat sleeps."),
            q("Which word has a short a sound and completes “The ___ sat on a log”?", "man", "mean", "moon", "Choose the word with a short vowel in a CVC pattern.", "Man has a short a sound."),
            q("Which sentence correctly uses a sight word and describes a picture of two birds?", "They are in the tree.", "They is in the tree.", "Them are tree.", "Use they with are for more than one bird.", "They are in the tree is grammatically correct."),
            q("A student points to one faraway house. Which word fits: “___ is my home”?", "That", "These", "This", "Use that for one thing at a distance.", "That points to one faraway object."),
            q("Which sentence uses a preposition to show where the book is?", "The book is between the two bags.", "The book is heavy.", "The book has a blue cover.", "Look for a word that tells location.", "Between describes the book's location."),
            q("Which group contains short-vowel CVC words?", "bed, fox, cup", "bead, fox, cute", "bee, boat, cup", "Check that each word has three letters and a short vowel.", "Bed, fox, and cup are CVC words with short vowels."),
            q("A picture shows a girl under an umbrella. Which sentence is the clearest response?", "She stands under the umbrella.", "Girl umbrella under.", "She happy umbrella.", "Write a complete sentence about the picture.", "She stands under the umbrella includes a subject and action."),
            q("Which phrase describes more than one faraway kite?", "Those kites", "This kite", "That kites", "Use those for multiple things far away.", "Those kites is the correct plural demonstrative phrase."),
          ],
        },
      },
    ],
  },
  {
    id: "math",
    title: "Math",
    emoji: "🔢",
    lessons: [
      {
        id: "place-value",
        title: "Quarter 1: Whole Numbers and Place Value",
        overview: "Represent, read, compare, and order whole numbers through 1,000.",
        topics: [
          "Visualize and count numbers up to 1,000; read and write numerals and number words.",
          "Understand ones, tens, and hundreds and compare numbers with >, <, and =.",
          "Skip-count by 2s, 5s, 10s, and 100s.",
        ],
        questions: {
          easy: [
            q("What is the value of 4 in 342?", "40", "4", "400", "The 4 is in the tens place.", "Four tens have a value of 40."),
            q("What number comes next when counting by 10s: 20, 30, 40, ...?", "50", "41", "60", "Add 10 to the last number.", "40 + 10 = 50."),
            q("Which is greater: 61 or 16?", "61", "16", "They are equal.", "Compare the tens digits first.", "Six tens is more than one ten, so 61 is greater."),
            q("How many hundreds are in 526?", "5", "2", "6", "Look at the digit in the hundreds place.", "The digit 5 is in the hundreds place."),
            q("What number comes after 399 when counting by ones?", "400", "390", "499", "Add one to 399.", "399 + 1 = 400."),
            q("Which number is written as seventy-two?", "72", "27", "702", "Seven tens and two ones make the number.", "Seventy-two is written 72."),
            q("Which is smaller: 48 or 84?", "48", "84", "They are equal.", "Compare the tens digits.", "Four tens is less than eight tens."),
            q("What number comes next when counting by 2s: 10, 12, 14, ...?", "16", "15", "24", "Add 2 to the last number.", "14 + 2 = 16."),
            q("What is the value of 8 in 183?", "80", "8", "800", "The 8 is in the tens place.", "Eight tens have a value of 80."),
            q("How many tens are in 70?", "7", "70", "17", "Count groups of ten.", "70 is 7 groups of ten."),
          ],
          standard: [
            q("Which numeral matches three hundred six?", "306", "360", "36", "Three hundred means 3 hundreds; six means 6 ones.", "Three hundred six is written 306."),
            q("Which comparison is true?", "428 > 382", "428 < 382", "428 = 382", "Compare the hundreds digits first.", "4 hundreds is greater than 3 hundreds."),
            q("What comes next when skip-counting by 5s: 35, 40, 45, ...?", "50", "46", "55", "Add 5 each time.", "45 + 5 = 50."),
            q("Which number has 6 hundreds, 2 tens, and 9 ones?", "629", "692", "269", "Write hundreds, then tens, then ones.", "Six hundreds, two tens, and nine ones make 629."),
            q("Which comparison is correct?", "706 > 670", "706 < 670", "706 = 670", "Compare the hundreds digits, then tens.", "Both have 6 or 7 hundreds? 706 has 7 hundreds, while 670 has 6 hundreds."),
            q("What number comes next when counting by 100s: 200, 300, 400, ...?", "500", "410", "600", "Add 100 each time.", "400 + 100 = 500."),
            q("Which is the word form of 518?", "Five hundred eighteen", "Fifty-one eight", "Five thousand eighteen", "Read the hundreds, tens, and ones.", "518 is five hundred eighteen."),
            q("Arrange 431, 413, and 341 from least to greatest.", "341, 413, 431", "413, 341, 431", "431, 413, 341", "Compare the hundreds digits first.", "341 has 3 hundreds; 413 and 431 have 4 hundreds, and 413 is smaller."),
            q("What is the value of 7 in 274?", "70", "7", "700", "Find the place of the digit 7.", "The 7 is in the tens place, so its value is 70."),
            q("What number comes next by 2s: 136, 138, 140, ...?", "142", "141", "160", "Add 2 to 140.", "140 + 2 = 142."),
          ],
          challenge: [
            q("Which expanded form equals 705?", "700 + 5", "70 + 5", "700 + 50", "705 has 7 hundreds, 0 tens, and 5 ones.", "Seven hundreds and five ones make 705."),
            q("Order these numbers from least to greatest: 219, 291, 129.", "129, 219, 291", "219, 129, 291", "291, 219, 129", "Compare hundreds first, then tens.", "129 has 1 hundred, then 219, then 291."),
            q("A pattern starts at 125 and skip-counts by 100. What are the next two numbers?", "225 and 325", "126 and 127", "200 and 300", "Add 100 twice, keeping the extra 25.", "125 + 100 = 225 and 225 + 100 = 325."),
            q("Which number is 9 hundreds, 0 tens, and 4 ones?", "904", "940", "409", "The zero shows there are no tens.", "Nine hundreds and four ones make 904."),
            q("Which statement compares 638 and 683 correctly?", "638 < 683", "638 > 683", "638 = 683", "The hundreds match; compare the tens digits.", "3 tens is less than 8 tens, so 638 is less."),
            q("A number has 4 hundreds and 16 ones. What is the number after regrouping?", "416", "460", "4016", "Regroup 10 ones as one ten.", "Four hundreds, one ten, and six ones make 416."),
            q("Which list counts backward by 5s from 125?", "125, 120, 115, 110", "125, 130, 135, 140", "125, 115, 105, 95", "Subtract 5 each time.", "Each number is 5 less than the one before."),
            q("Which word form matches 1,000?", "One thousand", "One hundred", "Ten thousand", "Count ten hundreds.", "Ten hundreds equal one thousand."),
            q("Order 809, 890, and 908 from greatest to least.", "908, 890, 809", "890, 908, 809", "809, 890, 908", "Compare the hundreds and then tens.", "908 has 9 hundreds; between 890 and 809, 890 is greater."),
            q("Skip-count by 100s starting at 375. What is the third number in the pattern?", "575", "475", "675", "Count 375 as the first number and add 100 twice.", "375, 475, 575: the third number is 575."),
          ],
        },
      },
      {
        id: "operations",
        title: "Quarter 2: Addition and Subtraction",
        overview: "Choose a strategy to add and subtract larger numbers and solve everyday word problems.",
        topics: [
          "Add 2-digit to 3-digit numbers with or without regrouping.",
          "Subtract 2-digit from 3-digit numbers with or without regrouping.",
          "Use mental addition and subtraction; solve one- and two-step problems, including money.",
        ],
        questions: {
          easy: [
            q("What is 34 + 20?", "54", "44", "64", "Adding 2 tens increases the tens by 2.", "34 + 20 = 54."),
            q("What is 78 - 8?", "70", "71", "80", "Take away 8 ones.", "78 - 8 = 70."),
            q("You have ₱10 and spend ₱3. How much remains?", "₱7", "₱13", "₱3", "Subtract the amount spent.", "₱10 - ₱3 = ₱7."),
            q("What is 25 + 13?", "38", "37", "48", "Add the ones and then the tens.", "25 + 13 = 38."),
            q("What is 46 - 20?", "26", "24", "66", "Take away 2 tens.", "46 - 20 = 26."),
            q("There are 12 red balls and 5 blue balls. How many balls altogether?", "17", "7", "18", "Put the two groups together.", "12 + 5 = 17 balls."),
            q("What is 63 - 3?", "60", "66", "30", "Take away 3 ones.", "63 - 3 = 60."),
            q("A pencil costs ₱8. You pay ₱10. How much change do you get?", "₱2", "₱18", "₱3", "Subtract the price from the amount paid.", "₱10 - ₱8 = ₱2."),
            q("What is 40 + 35?", "75", "65", "85", "Add 4 tens and 3 tens, then add 5 ones.", "40 + 35 = 75."),
            q("What is 59 - 10?", "49", "58", "69", "Take away one ten.", "59 - 10 = 49."),
          ],
          standard: [
            q("What is 267 + 158?", "425", "415", "325", "Add ones and tens; regroup when a place totals 10 or more.", "267 + 158 = 425."),
            q("What is 503 - 276?", "227", "237", "333", "Regroup across the zero in the tens place.", "503 - 276 = 227."),
            q("A notebook costs ₱36. You pay ₱50. How much change do you get?", "₱14", "₱16", "₱86", "Find 50 - 36.", "₱50 - ₱36 = ₱14."),
            q("What is 148 + 235?", "383", "373", "483", "Add ones and regroup, then add tens and hundreds.", "148 + 235 = 383."),
            q("What is 621 - 184?", "437", "447", "537", "Regroup one hundred and one ten as needed.", "621 - 184 = 437."),
            q("A class collected 126 cans on Monday and 138 on Tuesday. How many cans?", "264", "254", "274", "Add the two days' totals.", "126 + 138 = 264 cans."),
            q("A shop had 450 oranges and sold 175. How many are left?", "275", "285", "375", "Subtract 175 from 450.", "450 - 175 = 275 oranges."),
            q("You have ₱100. You buy a snack for ₱28 and juice for ₱35. How much remains?", "₱37", "₱47", "₱63", "Add the costs, then subtract from ₱100.", "₱28 + ₱35 = ₱63; ₱100 - ₱63 = ₱37."),
            q("What is 309 + 84?", "393", "383", "493", "Add 84 to 309, regrouping the ones.", "309 + 84 = 393."),
            q("What is 700 - 256?", "444", "454", "544", "Regroup across the zeroes.", "700 - 256 = 444."),
          ],
          challenge: [
            q("A library has 386 storybooks and 247 science books. How many books are there altogether?", "633", "623", "543", "Add the two 3-digit amounts and regroup.", "386 + 247 = 633 books."),
            q("A store had 700 pencils and sold 368. How many pencils remain?", "332", "342", "432", "Subtract 368 from 700, regrouping through zero.", "700 - 368 = 332 pencils."),
            q("Mia had ₱500. She bought a bag for ₱275 and a book for ₱98. How much money remains?", "₱127", "₱137", "₱225", "Add the costs, then subtract that total from ₱500.", "₱275 + ₱98 = ₱373; ₱500 - ₱373 = ₱127."),
            q("A school has 1,245 students. If 378 are absent, how many are present?", "867", "877", "967", "Subtract the absent students from the total.", "1,245 - 378 = 867 students."),
            q("A farmer packed 268 mangoes in the morning and 347 later. How many mangoes?", "615", "605", "515", "Add both amounts, regrouping as needed.", "268 + 347 = 615 mangoes."),
            q("A family saved ₱850 and spent ₱275 on groceries and ₱189 on supplies. How much remains?", "₱386", "₱396", "₱575", "Add both costs before subtracting from the savings.", "₱275 + ₱189 = ₱464; ₱850 - ₱464 = ₱386."),
            q("What is 1,000 - 468?", "532", "542", "632", "Regroup across the zeroes before subtracting.", "1,000 - 468 = 532."),
            q("A theater sold 328 tickets on Saturday and 295 on Sunday. How many tickets?", "623", "613", "533", "Add the ticket sales for both days.", "328 + 295 = 623 tickets."),
            q("A truck carried 925 kg of rice and delivered 467 kg. How many kilograms remain?", "458 kg", "468 kg", "558 kg", "Subtract 467 from 925.", "925 - 467 = 458 kg."),
            q("Lia had ₱1,000. She bought shoes for ₱425 and a bag for ₱238. How much money remains?", "₱337", "₱347", "₱575", "Add the prices, then subtract from ₱1,000.", "₱425 + ₱238 = ₱663; ₱1,000 - ₱663 = ₱337."),
          ],
        },
      },
      {
        id: "multiplication-fractions",
        title: "Quarter 3: Multiplication, Division, and Fractions",
        overview: "Explore equal groups, arrays, sharing, repeated subtraction, and unit fractions.",
        topics: [
          "Build multiplication foundations with repeated addition, equal groups, arrays, and multiples of 2, 3, 4, 5, and 10.",
          "Explore division by sharing equally and subtracting equal groups repeatedly.",
          "Identify unit fractions from one-half through one-tenth.",
        ],
        questions: {
          easy: [
            q("There are 3 bags with 2 apples in each. How many apples?", "6", "5", "9", "Add 2 three times.", "2 + 2 + 2 = 6 apples."),
            q("Share 8 shells equally between 2 friends. How many shells does each get?", "4", "6", "2", "Split 8 into two equal groups.", "8 shared equally by 2 is 4 each."),
            q("A whole is split into 2 equal parts. What is one part called?", "One-half", "One-third", "One-fourth", "The bottom number tells how many equal parts.", "One of two equal parts is one-half."),
            q("There are 2 plates with 3 cookies on each. How many cookies?", "6", "5", "9", "Add 3 two times.", "3 + 3 = 6 cookies."),
            q("Count by 5s: 5, 10, 15, ... What comes next?", "20", "16", "25", "Add 5 to the last number.", "15 + 5 = 20."),
            q("Share 10 blocks equally between 2 children. How many each?", "5", "8", "2", "Split the blocks into 2 equal groups.", "10 ÷ 2 = 5 blocks each."),
            q("A pizza is cut into 4 equal pieces. One piece is what fraction?", "One-fourth", "One-half", "One-third", "One piece out of four equal pieces.", "One of four equal pieces is one-fourth."),
            q("There are 4 groups with 2 stars in each group. How many stars?", "8", "6", "10", "Count by 2s four times.", "2 + 2 + 2 + 2 = 8 stars."),
            q("Count by 10s: 30, 40, 50, ... What comes next?", "60", "55", "70", "Add 10 each time.", "50 + 10 = 60."),
            q("Share 12 grapes equally among 3 friends. How many each?", "4", "3", "9", "Make 3 equal groups.", "12 divided into 3 equal groups gives 4 each."),
          ],
          standard: [
            q("A 3-row array has 4 counters in each row. How many counters are there?", "12", "7", "16", "Add 4 three times or count by 4s.", "3 groups of 4 make 12."),
            q("Use repeated subtraction to solve 15 ÷ 5. How many groups of 5 can you take away?", "3", "2", "5", "Subtract 5 until you reach zero.", "15 - 5 - 5 - 5 = 0, so there are 3 groups."),
            q("A shape is divided into 5 equal parts. One part is what unit fraction?", "One-fifth", "One-half", "Five-halves", "A unit fraction has 1 as its numerator.", "One of five equal parts is one-fifth."),
            q("How many objects are in 5 equal groups of 3?", "15", "8", "12", "Count by 3s five times.", "5 × 3 = 15."),
            q("Count by 4s: 12, 16, 20, ... What comes next?", "24", "22", "28", "Add 4 to 20.", "20 + 4 = 24."),
            q("Share 24 pencils equally among 4 students. How many each?", "6", "8", "4", "Find 4 equal groups that make 24.", "24 ÷ 4 = 6 pencils each."),
            q("A rectangle has 3 rows of 5 dots. How many dots?", "15", "8", "20", "Use the rows as equal groups.", "3 groups of 5 make 15."),
            q("Which fraction names one of 3 equal pieces?", "One-third", "One-fourth", "Three-halves", "The denominator tells the number of equal pieces.", "One of three equal pieces is one-third."),
            q("Count by 10s: 60, 70, 80, ... What comes next?", "90", "85", "100", "Add 10 to 80.", "80 + 10 = 90."),
            q("Subtract groups of 4 from 20 until none remain. How many groups?", "5", "4", "6", "Count 20, 16, 12, 8, 4, 0.", "Five groups of 4 make 20."),
          ],
          challenge: [
            q("A theater has 4 rows with 8 seats in each row. How many seats are there?", "32", "12", "24", "Think of 4 equal groups of 8.", "4 × 8 = 32 seats."),
            q("Thirty stickers are shared equally among 5 children. How many does each child receive?", "6", "5", "25", "Find the number that makes 5 equal groups total 30.", "30 ÷ 5 = 6 stickers each."),
            q("Which fraction names one equal part when a whole is divided into 10 parts?", "One-tenth", "One-fifth", "Ten-halves", "The denominator names the number of equal parts.", "One of ten equal parts is one-tenth."),
            q("A garden has 6 rows with 7 plants in each row. How many plants?", "42", "13", "36", "Use equal groups: 6 groups of 7.", "6 × 7 = 42 plants."),
            q("A baker packs 45 rolls equally into 5 bags. How many rolls per bag?", "9", "8", "10", "Divide 45 into 5 equal groups.", "45 ÷ 5 = 9 rolls in each bag."),
            q("A whole is divided into 8 equal parts. What unit fraction names one part?", "One-eighth", "One-sixth", "Eight-halves", "Use 1 as the numerator and 8 as the denominator.", "One of eight equal parts is one-eighth."),
            q("An array has 9 columns with 4 tiles in each. How many tiles?", "36", "13", "45", "Count 9 groups of 4.", "9 × 4 = 36 tiles."),
            q("A class has 40 crayons. They put 5 crayons in each box. How many boxes?", "8", "9", "35", "Subtract groups of 5 or divide 40 by 5.", "40 ÷ 5 = 8 boxes."),
            q("Which is greater: one-half or one-fourth of the same-sized whole?", "One-half", "One-fourth", "They are equal.", "When the whole is split into fewer equal pieces, each piece is larger.", "One-half is larger than one-fourth."),
            q("Count by 3s from 21. What are the next two numbers?", "24 and 27", "22 and 23", "30 and 33", "Add 3 twice.", "21 + 3 = 24; 24 + 3 = 27."),
          ],
        },
      },
      {
        id: "measurement-geometry-data",
        title: "Quarter 4: Measurement, Geometry, and Data",
        overview: "Read time and money, measure objects, classify shapes, and make sense of data.",
        topics: [
          "Tell time in minutes (a.m./p.m.) on analog and digital clocks; read Philippine pesos and centavos.",
          "Measure length, mass, and capacity using standard units such as meters, centimeters, grams, and kilograms.",
          "Identify half-circles, quarter-circles, and 3D shapes; collect and represent data in scaled pictographs and bar graphs.",
        ],
        questions: {
          easy: [
            q("The clock shows 2:00 in the afternoon. Is it a.m. or p.m.?", "p.m.", "a.m.", "Both", "Afternoon times use p.m.", "2:00 in the afternoon is 2:00 p.m."),
            q("Which coin is worth less: ₱1 or 25 centavos?", "25 centavos", "₱1", "They are equal.", "One peso is 100 centavos.", "25 centavos is less than ₱1."),
            q("Which unit could measure the length of a crayon?", "Centimeters", "Kilograms", "Liters", "Choose a unit for length.", "Centimeters measure length."),
            q("What time is one hour after 3:00?", "4:00", "3:30", "5:00", "Move the hour hand forward one hour.", "One hour after 3:00 is 4:00."),
            q("How many centavos make ₱1?", "100", "10", "50", "One peso equals one hundred centavos.", "₱1 = 100 centavos."),
            q("Which unit measures the mass of an apple?", "Grams", "Meters", "Liters", "Mass tells how heavy something is.", "Grams can measure the mass of an apple."),
            q("Which shape is a half-circle?", "Half of a circle", "A full square", "A triangle", "A half-circle is one of two equal parts of a circle.", "A semicircle is half of a circle."),
            q("A jug holds water. Which unit might measure its capacity?", "Liters", "Kilograms", "Centimeters", "Capacity tells how much a container holds.", "Liters measure liquid capacity."),
            q("A graph shows 3 children chose mangoes and 2 chose bananas. How many chose mangoes?", "3", "2", "5", "Read the number for mangoes.", "Three children chose mangoes."),
            q("Which object is a 3D shape?", "A ball", "A drawn circle", "A straight line", "A 3D object takes up space.", "A ball is a three-dimensional object."),
          ],
          standard: [
            q("The minute hand points to 6 and the hour hand is between 4 and 5. What time is it?", "4:30", "6:20", "5:30", "Each clock number counts 5 minutes for the minute hand.", "The 6 marks 30 minutes; the hour is 4."),
            q("Which unit is best for the mass of a bag of rice?", "Kilograms", "Centimeters", "Milliliters", "Choose a unit used to measure mass.", "A bag of rice is commonly measured in kilograms."),
            q("In a pictograph, one picture represents 2 children. Four pictures represent how many children?", "8", "6", "4", "Multiply the number of pictures by 2.", "4 pictures × 2 children = 8 children."),
            q("What time is 15 minutes after 6:20?", "6:35", "6:25", "6:45", "Add 15 minutes to the minutes on the clock.", "20 + 15 = 35 minutes, so it is 6:35."),
            q("How many 25-centavo coins equal ₱1?", "4", "2", "5", "₱1 equals 100 centavos.", "100 ÷ 25 = 4 coins."),
            q("Which unit is best for the capacity of a small water bottle?", "Milliliters", "Kilograms", "Meters", "Choose a unit for liquid.", "Milliliters measure the capacity of a small bottle."),
            q("A circle is divided into 4 equal parts. What is one part called?", "A quarter-circle", "A half-circle", "A full circle", "One of four equal parts is a quarter.", "One fourth of a circle is a quarter-circle."),
            q("A bar graph uses 2 votes for each mark. Three marks stand for how many votes?", "6", "5", "3", "Multiply 3 marks by 2 votes each.", "3 × 2 = 6 votes."),
            q("Which unit could measure a child's height?", "Centimeters", "Grams", "Liters", "Height measures length.", "Centimeters measure height."),
            q("What time is 30 minutes after 9:15 a.m.?", "9:45 a.m.", "9:30 a.m.", "10:15 a.m.", "Add 30 to 15 minutes.", "15 + 30 = 45 minutes after 9."),
          ],
          challenge: [
            q("A class starts at 8:15 a.m. and ends at 9:00 a.m. How many minutes long is the class?", "45 minutes", "35 minutes", "75 minutes", "Count from 8:15 to 9:00.", "There are 45 minutes from 8:15 to 9:00."),
            q("A bottle holds 1 liter. How many 250-milliliter cups can fill it?", "4", "2", "5", "There are 1,000 milliliters in 1 liter.", "1,000 ÷ 250 = 4 cups."),
            q("A scaled bar graph uses 5 votes per mark. A bar has 6 marks. How many votes does it show?", "30", "11", "25", "Multiply the marks by the scale.", "6 marks × 5 votes = 30 votes."),
            q("A movie begins at 1:35 p.m. and lasts 50 minutes. When does it end?", "2:25 p.m.", "2:15 p.m.", "1:85 p.m.", "Add 25 minutes to reach 2:00, then add the remaining 25.", "The movie ends at 2:25 p.m."),
            q("A toy costs ₱38.50. You pay ₱50.00. How much change?", "₱11.50", "₱12.50", "₱88.50", "Subtract pesos and centavos.", "₱50.00 - ₱38.50 = ₱11.50."),
            q("Which unit is best for the mass of a large dog?", "Kilograms", "Centimeters", "Milliliters", "Choose a standard unit of mass.", "A dog's mass is measured in kilograms."),
            q("A scaled pictograph uses 4 books per symbol. Five symbols represent how many books?", "20", "9", "25", "Multiply 5 symbols by 4 books each.", "5 × 4 = 20 books."),
            q("A rectangular prism is which kind of shape?", "A 3D solid", "A half-circle", "A flat line", "It has length, width, and height.", "A rectangular prism is a three-dimensional solid."),
            q("A bottle contains 2 liters of juice. How many milliliters is that?", "2,000 mL", "200 mL", "20 mL", "Each liter is 1,000 milliliters.", "2 × 1,000 = 2,000 milliliters."),
            q("A bar graph shows 18 votes for cats and 12 for dogs. How many more votes were for cats?", "6", "5", "30", "Find the difference between 18 and 12.", "18 - 12 = 6 more votes."),
          ],
        },
      },
    ],
  },
  {
    id: "science",
    title: "Science",
    emoji: "🌱",
    lessons: [
      {
        id: "life-science",
        title: "Living Things and Their Environment",
        overview: "Learn how bodies use their senses and how plants and animals meet their needs.",
        topics: [
          "Identify body parts and senses; practice personal hygiene and healthy habits.",
          "Explore the basic needs and habitats of plants and animals.",
          "Practice caring for pets, domestic animals, plants, and the surrounding environment.",
        ],
        questions: {
          easy: [
            q("Which body part helps you hear a song?", "Ears", "Elbows", "Knees", "Think about the sense of hearing.", "Ears help us hear sounds."),
            q("What do plants need from sunlight?", "Light energy", "Plastic", "Toy blocks", "Plants use light to help them grow.", "Sunlight provides energy plants use to make food."),
            q("What is a kind way to care for a pet?", "Give it clean water", "Leave it without food", "Scare it for fun", "Choose an action that helps keep an animal healthy.", "Pets need clean water and kind care."),
            q("Which body part helps you see a rainbow?", "Eyes", "Ears", "Elbows", "Think about the sense of sight.", "Eyes help us see."),
            q("Which food is a healthy choice for many animals?", "Food made for that animal", "Plastic wrappers", "Soap", "Animals need safe food suited to them.", "Animals should eat food appropriate for their kind."),
            q("What should you do before eating?", "Wash your hands", "Wipe hands on a dirty shoe", "Touch your face after playing in soil", "Choose a clean habit before meals.", "Washing hands helps keep them clean."),
            q("Which is a basic need for a plant?", "Water", "A television", "A toy car", "Plants need resources to live and grow.", "Plants need water."),
            q("Where might a bird build its nest?", "In a tree", "Under the ocean", "Inside a rock", "Choose a place where birds can shelter.", "Many birds build nests in trees."),
            q("How can you care for a classroom plant?", "Water it when needed", "Pull off all its leaves", "Keep it in a dark box", "Choose a gentle way to help a plant.", "Watering a plant helps care for it."),
            q("Which sense helps you smell a flower?", "Smell", "Hearing", "Sight", "Think about the sense used by your nose.", "Your nose helps you smell."),
          ],
          standard: [
            q("Which habit helps stop germs from spreading before eating?", "Wash your hands", "Share an unwashed cup", "Touch your face with dirty hands", "Think of a hygiene habit to do before meals.", "Washing hands helps remove germs."),
            q("A fish lives in a pond. What is the pond for the fish?", "Its habitat", "Its body part", "Its food", "A habitat is the place where an organism lives.", "The pond is the fish's habitat."),
            q("Which set includes basic needs for many animals?", "Water, air, food, and shelter", "Paint, toys, and music", "Only sunlight", "Think about what helps an animal survive.", "Animals need water, air, food, and shelter."),
            q("Which sense helps you tell that a bell is ringing?", "Hearing", "Taste", "Touch", "Think of the sense that notices sounds.", "Your ears help you hear a bell."),
            q("A rabbit lives in a grassy field with places to hide. What does its habitat provide?", "A place to live and find food", "A book to read", "A school desk", "Habitats provide living things with important resources.", "The field is a place where the rabbit can live and find food."),
            q("Why should you brush your teeth every day?", "To help keep teeth clean and healthy", "To make teeth grow leaves", "To help you hear better", "Choose a hygiene habit that protects your mouth.", "Brushing helps keep teeth clean and healthy."),
            q("What do both plants and animals need?", "Water", "A bicycle", "A television", "Look for a basic need shared by living things.", "Both plants and animals need water."),
            q("A dog has a warm coat of fur. How can fur help it?", "It helps keep the dog warm.", "It helps the dog fly.", "It makes the dog a plant.", "Think about how a body covering can help an animal.", "Fur can help keep an animal warm."),
            q("Which action shows care for the surrounding environment?", "Put litter in a bin", "Drop wrappers on the ground", "Break young plants", "Choose an action that keeps shared spaces clean.", "Using a bin helps keep the environment clean."),
            q("Which sense helps you know that soup is sweet?", "Taste", "Hearing", "Sight", "Think about the sense used by your tongue.", "Your tongue helps you taste food."),
          ],
          challenge: [
            q("You smell smoke and see a pan getting too hot. Which senses are you using?", "Smell and sight", "Taste and touch", "Hearing and taste", "Smelling smoke and seeing the pan use two different senses.", "Your nose detects smell and your eyes detect sight."),
            q("A cactus lives in a dry place. Which feature helps it save water?", "A thick stem that stores water", "Thin leaves that lose water quickly", "Roots that avoid the soil", "Think of a feature that helps in a dry habitat.", "A cactus's thick stem can store water."),
            q("A class notices litter near a garden. What is the best action?", "Put the litter in the proper bin with adult guidance", "Leave more litter there", "Pull up every plant", "Choose an action that protects the shared environment.", "Properly disposing of litter helps care for the garden."),
            q("A person touches a warm mug and quickly moves their hand away. Which sense noticed the heat?", "Touch", "Smell", "Hearing", "The skin notices temperature.", "The sense of touch helped the person notice the warm mug."),
            q("A plant in a dark cupboard becomes pale and weak. What does it most likely need more of?", "Sunlight", "Noise", "A smaller pot with no light", "Think about what plants use to make food.", "Plants need light to make food and grow well."),
            q("A bird has a beak shaped for cracking seeds. How might this adaptation help?", "It helps the bird get food.", "It helps the bird breathe underwater.", "It turns the bird into a tree.", "An adaptation helps an organism meet a need.", "A seed-cracking beak helps the bird eat seeds."),
            q("A pet is thirsty on a hot day. What should its caregiver do?", "Provide clean water and shade", "Leave it in a hot car", "Give it candy instead of water", "Choose a safe action that meets the pet's needs.", "Clean water and shade help protect a pet from heat."),
            q("Which example shows a healthy hygiene routine?", "Wash hands after using the bathroom", "Share a toothbrush", "Avoid bathing after playing in mud", "Choose an action that reduces germs.", "Handwashing after using the bathroom is healthy hygiene."),
            q("A local pond is filled in with trash. Which living things could be harmed?", "Fish, plants, and other pond life", "Only the clouds", "No living things", "Think about organisms that depend on pond water.", "Pollution can harm fish, plants, and other pond organisms."),
            q("A rabbit's large ears help it notice sounds. Which sense is supported by this body part?", "Hearing", "Taste", "Touch", "Ears collect sound.", "Large ears help a rabbit hear sounds around it."),
          ],
        },
      },
      {
        id: "matter-physical-world",
        title: "Matter and the Physical World",
        overview: "Describe materials and notice everyday sources of light, sound, and heat.",
        topics: [
          "Observe objects by shape, size, color, texture, and state (solid or liquid).",
          "Identify natural light sources such as the Sun and everyday energy or sound around home and school.",
        ],
        questions: {
          easy: [
            q("Which word describes how a surface feels?", "Rough", "Triangle", "Tuesday", "Texture tells how something feels.", "Rough describes a texture."),
            q("Which is a solid?", "A stone", "Milk", "Juice", "A solid keeps its own shape.", "A stone is a solid."),
            q("What is a natural source of light during the day?", "The Sun", "A notebook", "A spoon", "Choose a source found in nature.", "The Sun is a natural source of light."),
            q("Which word describes an object's color?", "Blue", "Heavy", "Smooth", "Color tells what an object looks like.", "Blue names a color."),
            q("Which object is a liquid?", "Milk", "A rock", "A block", "Liquids can flow.", "Milk is a liquid."),
            q("Which can make a sound?", "A drum", "A silent drawing", "A shadow", "Choose something that can vibrate and be heard.", "A drum makes sound when it is played."),
            q("What gives Earth light during the day?", "The Sun", "A pillow", "A cup", "Choose the natural daytime light source.", "The Sun lights Earth during the day."),
            q("Which word tells an object's size?", "Large", "Purple", "Rough", "Size tells how big or small something is.", "Large describes size."),
            q("Which surface feels smooth?", "A polished stone", "A rough tree bark", "A fuzzy towel", "Smooth is a texture.", "A polished stone can feel smooth."),
            q("What do you hear when a bell rings?", "Sound", "Color", "Shape", "Use your ears to notice it.", "A ringing bell makes sound."),
          ],
          standard: [
            q("A glass of water takes the shape of the glass. What state is the water?", "Liquid", "Solid", "A shadow", "Liquids flow and take the shape of their container.", "Water is a liquid."),
            q("Which pair describes an object by color and size?", "A small red ball", "A loud bell", "A sweet smell", "Find one word for color and one for size.", "Small describes size; red describes color."),
            q("Which object makes sound using electrical energy?", "A ringing school bell", "A silent paper sheet", "A rock in a box", "Think of an everyday powered sound source.", "An electric bell uses energy to make sound."),
            q("Which statement describes a solid?", "It keeps its shape.", "It flows to fit its cup.", "It is always invisible.", "Think about what happens when you move a block.", "A solid keeps its own shape."),
            q("A cup holds orange juice. What state of matter is the juice?", "Liquid", "Solid", "A sound", "Liquids flow and take the shape of a container.", "Orange juice is a liquid."),
            q("Which property tells whether a rock is rough or smooth?", "Texture", "Color", "Shape", "Texture describes how a surface feels.", "Rough and smooth describe texture."),
            q("Which is an everyday source of heat energy?", "A warm oven", "A paper drawing", "A quiet book", "Choose a source that can make things warm.", "An oven gives off heat when it is operating."),
            q("Which sound source is natural?", "Thunder", "A phone alarm", "A school buzzer", "Choose a sound made by nature.", "Thunder is a natural sound."),
            q("A blue cup is taller than a red cup. Which property is taller?", "Size", "Color", "Texture", "Taller compares how big an object is.", "Taller describes size."),
            q("What can happen when you strike a drum?", "It vibrates and makes sound.", "It becomes a liquid.", "It loses its shape forever.", "Sound can be made by vibrations.", "A struck drum vibrates and makes sound."),
          ],
          challenge: [
            q("A wooden block is hard, brown, and cube-shaped. Which property is its shape?", "Cube-shaped", "Brown", "Hard", "Shape tells the form of an object.", "Cube-shaped describes the block's shape."),
            q("Which statement correctly compares a solid and a liquid?", "A solid keeps its shape; a liquid flows.", "A liquid always keeps its own shape.", "A solid always flows to fit a cup.", "Think about what happens when each is poured.", "Solids keep a shape; liquids flow and take their container's shape."),
            q("A lamp changes electrical energy mainly into which useful forms?", "Light and some heat", "Soil and water", "Food and wind", "Notice what you can see and feel near a lamp.", "A lamp gives off light and some heat."),
            q("A student sorts objects by smooth, bumpy, and fuzzy surfaces. Which property is being compared?", "Texture", "Mass", "State", "Those words describe how surfaces feel.", "Smooth, bumpy, and fuzzy are textures."),
            q("A sealed bottle contains liquid water. What happens to the water's shape?", "It takes the shape of the bottle.", "It keeps a cube shape.", "It disappears because it is liquid.", "Liquids flow and fit the container they are in.", "Liquid water takes the shape of its bottle."),
            q("Which situation changes electrical energy into sound?", "A speaker playing music", "A book sitting on a desk", "A rock under the ground", "Choose a device that uses electricity to make sound.", "A speaker converts electrical energy into sound."),
            q("Why can sunlight be called a natural energy source?", "It comes from nature and gives light and warmth.", "It is made by a pencil.", "It only exists inside a battery.", "Think of where sunlight comes from and what it provides.", "The Sun naturally provides light and heat energy."),
            q("Two objects are both blue, but one is smooth and one is rough. Which properties are compared?", "Color and texture", "Sound and taste", "Mass and temperature only", "Blue is a color; smooth and rough describe a surface.", "The objects share a color but differ in texture."),
            q("A metal spoon feels warm after sitting in hot soup. What happened?", "Heat moved from the soup to the spoon.", "The spoon changed into a liquid.", "The soup became sound.", "Warmth can transfer between objects that touch.", "Heat transferred from the hot soup to the spoon."),
            q("Which source of light is natural rather than made by people?", "Starlight", "A flashlight", "A desk lamp", "Choose a source found in nature.", "Stars are natural sources of light."),
          ],
        },
      },
      {
        id: "earth-sky",
        title: "Earth and Sky",
        overview: "Observe local weather and recognize landforms and bodies of water nearby.",
        topics: [
          "Identify sunny, rainy, windy, and cloudy weather and choose suitable clothing or activities.",
          "Recognize landforms and bodies of water in local communities.",
        ],
        questions: {
          easy: [
            q("Which kind of weather has falling raindrops?", "Rainy", "Sunny", "Windy", "Think about what an umbrella is used for.", "Falling raindrops mean rainy weather."),
            q("What could you wear on a rainy day?", "A raincoat", "A swimsuit for snow", "No clothes", "Choose clothing that helps keep you dry.", "A raincoat helps keep you dry."),
            q("Which is a body of water?", "Lake", "Hill", "Valley", "Choose a place filled with water.", "A lake is a body of water."),
            q("Which kind of weather has bright sunshine?", "Sunny", "Rainy", "Cloudy", "Look for the word that describes a bright Sun.", "Sunny weather has sunshine."),
            q("What might you use on a windy day?", "A jacket", "A bowl for rain", "A snow shovel in summer", "Choose clothing that helps keep you comfortable.", "A jacket can help when the wind feels cool."),
            q("Which landform is higher than the land around it?", "Mountain", "Pond", "Stream", "Choose a raised landform.", "A mountain is raised land."),
            q("Where does a river carry water?", "Along a waterway", "Across the sky", "Inside a mountain cave only", "A river is moving water.", "A river is a body of flowing water."),
            q("What can you see in cloudy weather?", "Clouds", "Only stars", "A dry river in the sky", "Look up at the sky.", "Clouds are visible in cloudy weather."),
            q("Which clothing can keep you dry in rain?", "Rain boots", "Sandals made of paper", "A wool blanket over your head", "Choose footwear made for wet weather.", "Rain boots help keep feet dry."),
            q("Which is a body of water?", "Pond", "Hill", "Mountain", "Choose a place that holds water.", "A pond is a small body of water."),
          ],
          standard: [
            q("The sky is covered with clouds and the Sun is hidden. How would you describe the weather?", "Cloudy", "Snowy", "Earthquake", "Describe what you see covering the sky.", "A sky covered with clouds is cloudy."),
            q("It is very windy outside. Which activity is safest?", "Fly a kite with an adult in an open safe area", "Stand under a loose tree branch", "Chase objects into the road", "Choose a safe activity with adult help.", "Kite-flying should be done with an adult in a safe open area."),
            q("Which landform is raised higher than the land around it?", "Hill", "River", "Pond", "Choose a raised area of land.", "A hill is raised land."),
            q("The wind pushes leaves across the yard. What kind of weather is happening?", "Windy", "Still", "Snowy", "Look for moving air.", "Moving air is wind, so the weather is windy."),
            q("It is sunny and hot. Which choice is sensible?", "Wear a hat and drink water", "Wear a heavy coat and avoid water", "Stand in the hottest place", "Choose a way to stay comfortable in the heat.", "A hat and water help in sunny, hot weather."),
            q("Which landform is low between hills or mountains?", "Valley", "Lake", "Ocean", "Choose a low area of land.", "A valley is often found between higher landforms."),
            q("Which body of water usually flows from one place to another?", "River", "Pond", "Lake", "Choose the flowing body of water.", "A river flows along a channel."),
            q("Clouds are dark and rain begins. What weather should you expect?", "Rainy", "Sunny", "Clear and dry", "Use the falling water as your clue.", "Falling rain means rainy weather."),
            q("Which item is useful when the weather is sunny and bright?", "A sun hat", "A rain umbrella only", "Snow gloves", "Choose something that shades your head.", "A sun hat helps shade you."),
            q("A community has a stream and a hill. Which one is a landform?", "Hill", "Stream", "Both are bodies of water", "A landform is a natural feature of land.", "A hill is a landform; a stream is water."),
          ],
          challenge: [
            q("The forecast says sunny and hot. Which plan best fits the weather?", "Wear a hat and drink water outdoors", "Wear a heavy raincoat", "Play outside without water all day", "Choose a plan that suits sunshine and heat.", "A hat and water help you stay comfortable in hot sunny weather."),
            q("A stream flows through a community and into a lake. Which two bodies of water are named?", "Stream and lake", "Hill and valley", "Mountain and plain", "Find the features that contain flowing or still water.", "A stream and a lake are both bodies of water."),
            q("Dark clouds gather and strong wind begins. What is a sensible prediction?", "Rain may be coming", "The ground will turn into a star", "The weather cannot change", "Use both weather clues to predict what may happen.", "Dark clouds and strong wind can come before rain."),
            q("A family plans a hike, but the forecast predicts strong wind and rain. What is the safest choice?", "Choose another time or a safer indoor activity.", "Hike near a river during a storm.", "Ignore the forecast and climb a tree.", "Consider how rain and strong wind affect safety.", "Changing plans can help keep the family safe in stormy weather."),
            q("A map shows a river flowing between two hills. Which feature is water and which are landforms?", "River is water; hills are landforms.", "River is a hill; hills are rivers.", "All three are clouds.", "Sort each feature by whether it is water or raised land.", "A river is water, while hills are landforms."),
            q("A child sees lightning while playing outside. What should the child do?", "Go indoors with an adult.", "Stand under a tall tree.", "Stay in an open field.", "Choose the safest response to stormy weather.", "Going indoors with an adult is safer during lightning."),
            q("The air is moving strongly, clouds are thick, and leaves are blowing. Which observation describes the weather?", "Windy and cloudy", "Sunny and still", "Hot and snowing", "Use the clues about moving air and clouds.", "Blowing leaves show wind, and thick clouds make it cloudy."),
            q("A valley lies between two mountains. What is the valley?", "A low landform", "A body of water", "A kind of weather", "Valleys are lower areas of land.", "A valley is a low landform between higher areas."),
            q("A local pond becomes very shallow during a dry, hot period. Which weather condition may have contributed?", "Little rain and hot sunny days", "Many cool rainy days", "Snow falling every hour", "Think about how heat and lack of rain affect water.", "Hot weather and little rain can reduce water in a pond."),
            q("Which pair correctly matches weather and suitable clothing?", "Rainy: raincoat; sunny: sun hat", "Windy: paper shoes; rainy: no coat", "Sunny: snow gloves; cloudy: swimsuit", "Match clothing to the conditions it helps with.", "A raincoat helps in rain; a sun hat gives shade."),
          ],
        },
      },
    ],
  },
];

export const gradeTwoLessonCount = subjects.reduce(
  (count, subject) => count + subject.lessons.length,
  0
);

function getLessonProgressId(subject: Subject, lesson: Lesson): string {
  return `grade:2:online:${subject.id}:${lesson.id}`;
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function getRoundQuestions(lesson: Lesson, difficulty: LessonDifficulty): Challenge[] {
  return shuffle(lesson.questions[difficulty])
    .slice(0, 10)
    .map((challenge) => ({
      ...challenge,
      options: shuffle(challenge.options),
    }));
}

const difficultyLabels: Record<LessonDifficulty, string> = {
  easy: "Easy",
  standard: "Standard",
  challenge: "Challenge",
};

type Props = {
  difficulty: LessonDifficulty;
  onDifficultyChange: (difficulty: LessonDifficulty) => void;
  onBack: () => void;
  onMusicCategoryChange: (category: CategoryId | null) => void;
  completedLessonIds: string[];
  lessonProgressReady: boolean;
  onCompleteLesson: (lessonId: string) => void;
};

export default function GradeTwoLessonsScreen({
  difficulty,
  onDifficultyChange,
  onBack,
  onMusicCategoryChange,
  completedLessonIds,
  lessonProgressReady,
  onCompleteLesson,
}: Props) {
  const { darkMode } = useContext(AppAppearanceContext);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [roundQuestions, setRoundQuestions] = useState<Challenge[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerIsCorrect, setAnswerIsCorrect] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const previousCompletedRef = useRef(new Set(completedLessonIds));
  const [unlockingLessonId, setUnlockingLessonId] = useState<string | null>(null);
  const unlockFade = useRef(new Animated.Value(1)).current;
  const unlockScale = useRef(new Animated.Value(1)).current;

  const currentChallenge = roundQuestions[questionIndex];
  const currentLessonId =
    activeSubject && activeLesson
      ? getLessonProgressId(activeSubject, activeLesson)
      : null;
  const isLessonComplete = Boolean(
    currentLessonId && completedLessonIds.includes(currentLessonId)
  );
  const lessonIndex =
    activeSubject && activeLesson
      ? activeSubject.lessons.findIndex((lesson) => lesson.id === activeLesson.id)
      : -1;
  const isLessonLocked =
    !lessonProgressReady ||
    Boolean(
      activeSubject &&
        activeSubject.lessons
          .slice(0, lessonIndex)
          .some(
            (lesson) =>
              !completedLessonIds.includes(getLessonProgressId(activeSubject, lesson))
          )
    );

  useEffect(() => {
    const newlyCompleted = completedLessonIds.find(
      (lessonId) => !previousCompletedRef.current.has(lessonId)
    );
    previousCompletedRef.current = new Set(completedLessonIds);
    if (!newlyCompleted || !activeSubject) return;

    const completedIndex = activeSubject.lessons.findIndex(
      (lesson) => getLessonProgressId(activeSubject, lesson) === newlyCompleted
    );
    if (completedIndex < 0) return;
    const nextLesson = activeSubject.lessons[completedIndex + 1];
    if (!nextLesson) return;

    setUnlockingLessonId(getLessonProgressId(activeSubject, nextLesson));
  }, [activeSubject, completedLessonIds]);

  useEffect(() => {
    if (!unlockingLessonId || activeLesson) return;
    unlockFade.setValue(0.25);
    unlockScale.setValue(0.94);
    const animation = Animated.parallel([
      Animated.timing(unlockFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(unlockScale, {
          toValue: 1.06,
          useNativeDriver: true,
          speed: 14,
          bounciness: 8,
        }),
        Animated.spring(unlockScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 12,
          bounciness: 4,
        }),
      ]),
    ]);
    animation.start(({ finished: animationFinished }) => {
      if (animationFinished) setUnlockingLessonId(null);
    });
    return () => animation.stop();
  }, [activeLesson, unlockFade, unlockScale, unlockingLessonId]);

  const resetGame = () => {
    setRoundQuestions([]);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerIsCorrect(null);
    setFinished(false);
  };

  const handleBack = () => {
    if (activeLesson) {
      setActiveLesson(null);
      resetGame();
    } else if (activeSubject) {
      setActiveSubject(null);
      onMusicCategoryChange(null);
    } else {
      onMusicCategoryChange(null);
      onBack();
    }
  };

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setRoundQuestions(getRoundQuestions(lesson, difficulty));
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerIsCorrect(null);
    setFinished(false);
  };

  const checkAnswer = () => {
    if (!currentChallenge || !selectedAnswer) return;
    const correct = selectedAnswer === currentChallenge.answer;
    setAnswerIsCorrect(correct);
    playFeedback(correct ? "success" : "error");
  };

  const advanceChallenge = () => {
    if (!activeLesson || !answerIsCorrect) return;
    if (questionIndex === roundQuestions.length - 1) {
      if (currentLessonId && !isLessonComplete) onCompleteLesson(currentLessonId);
      setFinished(true);
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
    setAnswerIsCorrect(null);
  };

  return (
    <SafeAreaView style={[styles.screen, darkMode && styles.darkScreen]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

        <View style={[styles.header, darkMode && styles.darkCard]}>
          <Text style={styles.headerIcon}>
            {activeSubject?.emoji ?? "🌈"}
          </Text>
          <Text style={[styles.gradeLabel, darkMode && styles.darkMutedText]}>GRADE 2 ONLINE LESSONS</Text>
          <Text style={[styles.title, darkMode && styles.darkText]}>
            {activeLesson?.title ?? activeSubject?.title ?? "Choose an adventure"}
          </Text>
          <Text style={[styles.subtitle, darkMode && styles.darkMutedText]}>
            {activeLesson
              ? "Learn the idea, then play the challenge!"
              : activeSubject
                ? "Choose a quarter on your learning trail."
                : "Math, reading, and science adventures made for Grade 2."}
          </Text>
        </View>

        {activeLesson && activeSubject ? (
          <View style={styles.lessonContent}>
            {finished ? (
              <View style={[styles.finishCard, darkMode && styles.darkCard]}>
                <Text style={styles.finishEmoji}>⭐</Text>
                <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Quarter complete!</Text>
                <Text style={[styles.finishHint, darkMode && styles.darkMutedText]}>
                  Difficulty: {difficultyLabels[difficulty]}
                </Text>
                <View style={styles.difficultyControls}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Decrease question difficulty"
                    accessibilityState={{ disabled: difficulty === "easy" }}
                    disabled={difficulty === "easy"}
                    onPress={() =>
                      onDifficultyChange(difficulty === "challenge" ? "standard" : "easy")
                    }
                    style={({ pressed }) => [
                      styles.difficultyButton,
                      difficulty === "easy" && styles.difficultyButtonDisabled,
                      pressed && difficulty !== "easy" && styles.pressed,
                    ]}
                  >
                    <Text style={styles.difficultyButtonText}>↓ Easier</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Increase question difficulty"
                    accessibilityState={{ disabled: difficulty === "challenge" }}
                    disabled={difficulty === "challenge"}
                    onPress={() =>
                      onDifficultyChange(difficulty === "easy" ? "standard" : "challenge")
                    }
                    style={({ pressed }) => [
                      styles.difficultyButton,
                      difficulty === "challenge" && styles.difficultyButtonDisabled,
                      pressed && difficulty !== "challenge" && styles.pressed,
                    ]}
                  >
                    <Text style={styles.difficultyButtonText}>↑ Harder</Text>
                  </Pressable>
                </View>
              </View>
            ) : isLessonLocked ? (
              <View style={[styles.lockedCard, darkMode && styles.darkCard]}>
                <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Lesson preview</Text>
                <Text style={[styles.bodyText, darkMode && styles.darkMutedText]}>{activeLesson.overview}</Text>
                <Text style={[styles.hintText, darkMode && styles.darkMutedText]}>
                  {!lessonProgressReady
                    ? "Loading your saved lesson progress..."
                    : "Finish the earlier quarter on this subject trail to play this challenge."}
                </Text>
              </View>
            ) : (
              <>
                <View style={[styles.learnCard, darkMode && styles.darkCard]}>
                  <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Learn it</Text>
                  <Text style={[styles.bodyText, darkMode && styles.darkMutedText]}>{activeLesson.overview}</Text>
                  {activeLesson.topics.map((topic) => (
                    <View style={styles.topicRow} key={topic}>
                      <Text style={styles.topicBullet}>•</Text>
                      <Text style={[styles.topicText, darkMode && styles.darkMutedText]}>{topic}</Text>
                    </View>
                  ))}
                </View>

                {currentChallenge ? (
                  <View style={[styles.gameCard, darkMode && styles.darkCard]}>
                    <View style={styles.gameHeader}>
                      <Text style={[styles.gameTitle, darkMode && styles.darkText]}>🎮 Play and practice</Text>
                      <Text style={styles.questionCount}>
                        {questionIndex + 1} / {roundQuestions.length}
                      </Text>
                    </View>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyBadgeText}>
                        {difficultyLabels[difficulty]} difficulty
                      </Text>
                    </View>
                    <View style={[styles.questionTrack, darkMode && styles.darkTrack]}>
                      <View
                        style={[
                          styles.questionProgress,
                          { width: `${((questionIndex + 1) / roundQuestions.length) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={[styles.prompt, darkMode && styles.darkText]}>{currentChallenge.prompt}</Text>
                    <View style={styles.options}>
                      {currentChallenge.options.map((option) => {
                        const selected = selectedAnswer === option;
                        return (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            disabled={answerIsCorrect === true}
                            key={option}
                            onPress={() => {
                              setSelectedAnswer(option);
                              setAnswerIsCorrect(null);
                            }}
                            style={({ pressed }) => [
                              styles.option,
                              darkMode && styles.darkOption,
                              selected && styles.selectedOption,
                              answerIsCorrect === true && selected && styles.correctOption,
                              darkMode && selected && styles.darkSelectedOption,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text style={[styles.optionText, darkMode && styles.darkMutedText, selected && styles.selectedOptionText]}>
                              {option}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {answerIsCorrect !== null ? (
                      <Text style={answerIsCorrect ? styles.correctFeedback : styles.tryAgainFeedback}>
                        {answerIsCorrect
                          ? `✅ ${currentChallenge.explanation}`
                          : `Not quite. ${currentChallenge.hint}`}
                      </Text>
                    ) : null}

                    {answerIsCorrect === true ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={advanceChallenge}
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                      >
                        <Text style={styles.primaryButtonText}>
                          {questionIndex === roundQuestions.length - 1
                            ? "FINISH LESSON"
                            : "NEXT CHALLENGE"}
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        disabled={!selectedAnswer}
                        onPress={checkAnswer}
                        style={({ pressed }) => [
                          styles.primaryButton,
                          !selectedAnswer && styles.disabledButton,
                          pressed && selectedAnswer && styles.pressed,
                        ]}
                      >
                        <Text style={styles.primaryButtonText}>CHECK ANSWER</Text>
                      </Pressable>
                    )}
                  </View>
                ) : null}
              </>
            )}
          </View>
        ) : activeSubject ? (
          <View style={styles.trail}>
            <View style={styles.trailHeading}>
              <Text style={styles.trailFlag}>🚩</Text>
              <Text style={[styles.trailTitle, darkMode && styles.darkText]}>
                Your {activeSubject.title} adventure
              </Text>
            </View>
            {activeSubject.lessons.map((lesson, index) => {
              const lessonId = getLessonProgressId(activeSubject, lesson);
              const complete = completedLessonIds.includes(lessonId);
              const locked =
                !lessonProgressReady ||
                activeSubject.lessons
                  .slice(0, index)
                  .some(
                    (previous) =>
                      !completedLessonIds.includes(getLessonProgressId(activeSubject, previous))
                  );
              return (
                <View style={styles.trailStep} key={lesson.id}>
                  <View style={styles.roadColumn}>
                    {index < activeSubject.lessons.length - 1 ? (
                      <View
                        style={[
                          styles.roadConnector,
                          complete && styles.roadConnectorComplete,
                        ]}
                      />
                    ) : (
                      <Text style={styles.roadFinish}>🏁</Text>
                    )}
                    <View
                      style={[
                        styles.roadNode,
                        complete && styles.roadNodeComplete,
                        locked && styles.roadNodeLocked,
                      ]}
                    >
                      <Text style={styles.roadNodeText}>{complete ? "✓" : index + 1}</Text>
                    </View>
                  </View>
                  <Animated.View
                    style={[
                      styles.trailCardWrap,
                      unlockingLessonId === lessonId && {
                        opacity: unlockFade,
                        transform: [{ scale: unlockScale }],
                      },
                    ]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${locked ? "Preview locked" : "Open"} lesson ${index + 1}: ${lesson.title}`}
                      onPress={() => startLesson(lesson)}
                      style={({ pressed }) => [
                        styles.lessonCard,
                        darkMode && styles.darkCard,
                        locked && styles.lockedLessonCard,
                        darkMode && locked && styles.darkLockedLessonCard,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.lessonCopy}>
                        <Text
                          style={[
                            styles.stepStatus,
                            darkMode && styles.darkMutedText,
                            complete && (darkMode ? styles.darkCompleteStatus : styles.completeStatus),
                          ]}
                        >
                          {complete ? "COMPLETED · REPLAY" : !lessonProgressReady ? "LOADING" : locked ? "LOCKED · PREVIEW" : "READY · PLAY GAME"}
                        </Text>
                        <Text style={[styles.lessonTitle, darkMode && styles.darkText]}>
                          {lesson.title}
                        </Text>
                        <Text style={[styles.lessonOverview, darkMode && styles.darkMutedText]}>
                          {lesson.overview}
                        </Text>
                      </View>
                      <Text style={[styles.lessonArrow, darkMode && styles.darkMutedText]}>
                        {locked ? "🔒" : "›"}
                      </Text>
                    </Pressable>
                  </Animated.View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.subjects}>
            {subjects.map((subject) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${subject.title}, ${subject.lessons.length} Grade 2 quarter lessons`}
                key={subject.id}
                onPress={() => {
                  setActiveSubject(subject);
                  onMusicCategoryChange(subject.id);
                }}
                style={({ pressed }) => [
                  styles.subjectCard,
                  darkMode && styles.darkCard,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.subjectIcon}>{subject.emoji}</Text>
                <Text style={[styles.subjectTitle, darkMode && styles.darkText]}>
                  {subject.title}
                </Text>
                <View style={styles.subjectFooter}>
                  <Text style={[styles.subjectCount, darkMode && styles.darkMutedText]}>
                    {subject.lessons.length} lessons
                  </Text>
                  <Text style={[styles.subjectArrow, darkMode && styles.darkMutedText]}>→</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  content: { padding: 20, paddingBottom: 36 },
  backButton: { alignSelf: "flex-start", minHeight: 42, minWidth: 64, borderRadius: 8, backgroundColor: "#C62828", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  backButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  header: { alignItems: "center", backgroundColor: "#DDF5F2", borderRadius: 20, marginBottom: 20, padding: 22 },
  headerIcon: { fontSize: 42 },
  gradeLabel: { color: "#258EA3", fontSize: 11, fontWeight: "900", letterSpacing: 1, marginTop: 8 },
  title: { color: "#173B53", fontSize: 25, fontWeight: "900", marginTop: 5, textAlign: "center" },
  subtitle: { color: "#36566A", fontSize: 15, marginTop: 6, textAlign: "center" },
  subjects: { gap: 12 },
  subjectCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#CDEEF1", borderRadius: 20, borderWidth: 1.5, justifyContent: "center", minHeight: 168, padding: 16 },
  subjectIcon: { fontSize: 54 },
  subjectTitle: { color: "#173B53", fontSize: 17, fontWeight: "900", marginTop: 9, textAlign: "center" },
  subjectFooter: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 8 },
  subjectCount: { color: "#6E8190", fontSize: 14, fontWeight: "700" },
  subjectArrow: { color: "#258EA3", fontSize: 20, fontWeight: "900" },
  trail: { gap: 10 },
  trailHeading: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 4, paddingLeft: 6 },
  trailFlag: { fontSize: 26 },
  trailTitle: { color: "#315C4A", fontSize: 17, fontWeight: "900" },
  trailStep: { alignItems: "stretch", flexDirection: "row", gap: 8 },
  roadColumn: { alignItems: "center", alignSelf: "stretch", position: "relative", width: 42 },
  roadConnector: { position: "absolute", backgroundColor: "#A9D7CE", borderRadius: 3, width: 5, top: 34, bottom: -12 },
  roadConnectorComplete: { backgroundColor: "#6FB78E" },
  roadNode: { alignItems: "center", backgroundColor: "#D6EEF1", borderColor: "#78C7D2", borderRadius: 18, borderWidth: 2, height: 36, justifyContent: "center", marginTop: 15, width: 36, zIndex: 1 },
  roadNodeComplete: { backgroundColor: "#BDE7C2", borderColor: "#72B77D" },
  roadNodeLocked: { backgroundColor: "#E2E7EA", borderColor: "#B7C1C7" },
  roadNodeText: { color: "#173B53", fontSize: 14, fontWeight: "900" },
  roadFinish: { fontSize: 22, marginTop: 19, zIndex: 1 },
  trailCardWrap: { flex: 1 },
  lessonCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#CDEEF1", borderRadius: 18, borderWidth: 1.5, flexDirection: "row", gap: 12, minHeight: 94, padding: 14 },
  lockedLessonCard: { backgroundColor: "#F1F4F5", borderColor: "#D4DEE1" },
  darkLockedLessonCard: { backgroundColor: "#26334A", borderColor: "#3C4B63" },
  lessonCopy: { flex: 1 },
  stepStatus: { color: "#258EA3", fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  lessonTitle: { color: "#173B53", fontSize: 15, fontWeight: "900", lineHeight: 20, marginTop: 4 },
  lessonOverview: { color: "#536D79", fontSize: 12, lineHeight: 17, marginTop: 4 },
  lessonArrow: { color: "#258EA3", fontSize: 24, fontWeight: "800" },
  lessonContent: { gap: 12 },
  learnCard: { backgroundColor: "#FFFFFF", borderColor: "#CDEEF1", borderRadius: 18, borderWidth: 1.5, padding: 18 },
  cardTitle: { color: "#173B53", fontSize: 20, fontWeight: "900" },
  bodyText: { color: "#36566A", fontSize: 15, lineHeight: 22, marginTop: 7 },
  topicRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  topicBullet: { color: "#258EA3", fontSize: 18, fontWeight: "900" },
  topicText: { color: "#36566A", flex: 1, fontSize: 14, lineHeight: 21 },
  gameCard: { backgroundColor: "#E8F8F6", borderColor: "#9AD8D1", borderRadius: 18, borderWidth: 1.5, padding: 18 },
  gameHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  gameTitle: { color: "#173B53", fontSize: 17, fontWeight: "900" },
  questionCount: { color: "#258EA3", fontSize: 13, fontWeight: "900" },
  difficultyBadge: { alignSelf: "flex-start", backgroundColor: "#315C4A", borderRadius: 16, marginTop: 10, paddingHorizontal: 12, paddingVertical: 6 },
  difficultyBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  questionTrack: { backgroundColor: "#FFFFFF", borderRadius: 5, height: 9, marginTop: 12, overflow: "hidden" },
  questionProgress: { backgroundColor: "#F17D65", height: "100%" },
  prompt: { color: "#173B53", fontSize: 18, fontWeight: "800", lineHeight: 26, marginTop: 18 },
  options: { gap: 8, marginTop: 14 },
  option: { backgroundColor: "#FFFFFF", borderColor: "#CDEEF1", borderRadius: 12, borderWidth: 1.5, padding: 13 },
  selectedOption: { backgroundColor: "#D8F1F2", borderColor: "#258EA3" },
  correctOption: { backgroundColor: "#E0F3DF", borderColor: "#4E8B5C" },
  optionText: { color: "#36566A", fontSize: 15, fontWeight: "700", lineHeight: 21 },
  selectedOptionText: { color: "#173B53" },
  correctFeedback: { color: "#397147", fontSize: 14, fontWeight: "800", lineHeight: 21, marginTop: 14 },
  tryAgainFeedback: { color: "#8A4F20", fontSize: 14, fontWeight: "800", lineHeight: 21, marginTop: 14 },
  primaryButton: { alignItems: "center", backgroundColor: "#258EA3", borderRadius: 13, justifyContent: "center", marginTop: 16, minHeight: 50, paddingHorizontal: 14 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900", textAlign: "center" },
  disabledButton: { opacity: 0.45 },
  lockedCard: { backgroundColor: "#FFFFFF", borderColor: "#CDEEF1", borderRadius: 18, borderWidth: 1.5, padding: 18 },
  hintText: { color: "#8A4F20", fontSize: 14, fontWeight: "700", lineHeight: 21, marginTop: 12 },
  finishCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#F4C451", borderRadius: 18, borderWidth: 1.5, padding: 22 },
  finishEmoji: { fontSize: 54, marginBottom: 10 },
  finishHint: { color: "#536D79", fontSize: 14, fontWeight: "700", marginTop: 8, textAlign: "center" },
  difficultyControls: { flexDirection: "row", gap: 12, marginTop: 12, width: "100%" },
  difficultyButton: { alignItems: "center", backgroundColor: "#258EA3", borderRadius: 13, flex: 1, justifyContent: "center", minHeight: 50, paddingHorizontal: 10 },
  difficultyButtonDisabled: { backgroundColor: "#A8B8BC" },
  difficultyButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  pressed: { opacity: 0.72 },
  darkScreen: { backgroundColor: "rgba(18, 29, 50, 0.32)" },
  darkCard: { backgroundColor: "#303D55", borderColor: "#465671" },
  darkOption: { backgroundColor: "#29364D", borderColor: "#54647D" },
  darkSelectedOption: { backgroundColor: "#394C68", borderColor: "#7897B0" },
  darkTrack: { backgroundColor: "#46546A" },
  darkText: { color: "#E4EAF3" },
  darkMutedText: { color: "#B9C5D8" },
  completeStatus: { color: "#397147" },
  darkCompleteStatus: { color: "#9ADAA5" },
});
