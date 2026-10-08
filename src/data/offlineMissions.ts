
export type Grade = "K" | "1" | "2" | "3";

// How the child hands in the work:
// "shape-scan" = camera shape detector, "photo" = photo of paper/drawing/objects,
// "in-person" = done out loud with the parent (no photo needed)
export type SubmissionType = "shape-scan" | "photo" | "in-person";



export type OfflineMission = {
  id: string;
  grade: Grade;
  title: string;
  subject: string;
  area: "Math" | "Science" | "Reading & Writing";
  task: string;
  parentCheck: string;
  submission: SubmissionType;
  targetShapes?: string[];
};

export const gradeLabels: Record<Grade, string> = {
  K: "Kindergarten",
  "1": "Grade 1",
  "2": "Grade 2",
  "3": "Grade 3",
};

export const offlineMissions: OfflineMission[] = [
  // ---------- Kindergarten (Easy) ----------
  {
    id: "K-1",
    grade: "K",
    title: "Shape Hunt: Circle",
    subject: "Math – Shapes",
    area: "Math",
    task: "Find 3 round objects at home (a coin, a plate, a clock).",
    parentCheck: "Child shows the 3 objects and names the shape (circle).",
    submission: "shape-scan",
    targetShapes: ["circle"],
  },
  {
    id: "K-2",
    grade: "K",
    title: "Shape Hunt: Square/Triangle/Rectangle",
    subject: "Math – Shapes",
    area: "Math",
    task: "Find one object for each shape and line them up.",
    parentCheck: "All 3 shapes are matched correctly.",
    submission: "shape-scan",
    targetShapes: ["square", "triangle", "rectangle"],
  },
  {
    id: "K-3",
    grade: "K",
    title: "Count the Items",
    subject: "Math – Counting",
    area: "Math",
    task: "Count 10 spoons, pieces of paper, or candies out loud.",
    parentCheck: "Child counts out loud correctly up to 10.",
    submission: "in-person",
  },
  {
    id: "K-4",
    grade: "K",
    title: "First Letter",
    subject: "Reading – Alphabet",
    area: "Reading & Writing",
    task: "Find 3 things at home that start with the same letter as your name.",
    parentCheck: "Child says each object's name and starting letter correctly.",
    submission: "in-person",
  },
  {
    id: "K-5",
    grade: "K",
    title: "Letter Tracing",
    subject: "Reading & Writing – Letters",
    area: "Reading & Writing",
    task: "Trace your first name on paper and show it to your parent.",
    parentCheck: "Parent looks at the paper and confirms the name is traced.",
    submission: "photo",
  },

  // ---------- Grade 1 (Medium) ----------
  {
    id: "G1-1",
    grade: "1",
    title: "Mini Store",
    subject: "Math – Money & Change",
    area: "Math",
    task: "Pay ₱50 for a ₱25 snack and compute the correct change.",
    parentCheck: "Child says the correct change (₱25).",
    submission: "in-person",
  },
  {
    id: "G1-2",
    grade: "1",
    title: "Savings Count",
    subject: "Math – Counting Money",
    area: "Math",
    task: "Count coins in a small pouch and write the total.",
    parentCheck: "Written total is correct.",
    submission: "photo",
  },
  {
    id: "G1-3",
    grade: "1",
    title: "Living or Non-Living",
    subject: "Science – Living & Non-Living",
    area: "Science",
    task: "Sort 10 household items into living and non-living.",
    parentCheck: "Sorting of all 10 items is correct.",
    submission: "photo",
  },
  {
    id: "G1-4",
    grade: "1",
    title: "Animals and Their Food",
    subject: "Science – Animals & Food",
    area: "Science",
    task: "Name 3 pets or nearby animals and what each one eats.",
    parentCheck: "Child explains all 3 animals and their food correctly.",
    submission: "in-person",
  },
  {
    id: "G1-5",
    grade: "1",
    title: "Day and Night",
    subject: "Science – Day-Night Cycle",
    area: "Science",
    task: "Draw what you do in the morning vs. at night.",
    parentCheck: "Drawing has both morning and night parts.",
    submission: "photo",
  },
  {
    id: "G1-6",
    grade: "1",
    title: "Weather Watch",
    subject: "Science – Weather",
    area: "Science",
    task: "Observe and report today's weather (sunny/cloudy/rainy).",
    parentCheck: "Child reports the weather correctly.",
    submission: "in-person",
  },
  {
    id: "G1-7",
    grade: "1",
    title: "Parts of Speech Hunt",
    subject: "Reading & Writing – Parts of Speech",
    area: "Reading & Writing",
    task: "Write 3 nouns, 2 verbs, 2 adjectives for things at home.",
    parentCheck: "All words are placed in the correct categories.",
    submission: "photo",
  },

  // ---------- Grade 2 (Medium-High) ----------
  {
    id: "G2-1",
    grade: "2",
    title: "Correct Change",
    subject: "Math – Money & Change",
    area: "Math",
    task: "Buy something worth ₱38 using ₱100 and compute the change.",
    parentCheck: "Child says the correct change (₱62) and shows the counting.",
    submission: "in-person",
  },
  {
    id: "G2-2",
    grade: "2",
    title: "Savings Challenge",
    subject: "Math – Running Totals",
    area: "Math",
    task: "Save coins for 3 days and add up the daily running total.",
    parentCheck: "Daily totals are added correctly.",
    submission: "photo",
  },
  {
    id: "G2-3",
    grade: "2",
    title: "Two-Step Problem",
    subject: "Math – Two-Step Problems",
    area: "Math",
    task: "Buy 2 items (e.g. ₱15 + ₱20), compute total, then change from ₱50.",
    parentCheck: "Both steps (total, then change) are correct.",
    submission: "in-person",
  },
  {
    id: "G2-4",
    grade: "2",
    title: "Living or Non-Living: Advanced",
    subject: "Science – Living & Non-Living",
    area: "Science",
    task: "Sort 10 outdoor objects into living/non-living with a reason each.",
    parentCheck: "Sorting and explanation are both correct.",
    submission: "photo",
  },
  {
    id: "G2-5",
    grade: "2",
    title: "Animals and Their Diet",
    subject: "Science – Animals & Food",
    area: "Science",
    task: "List 3 neighborhood animals and match each to its food.",
    parentCheck: "Child explains the pairing correctly.",
    submission: "in-person",
  },
  {
    id: "G2-6",
    grade: "2",
    title: "Day-Night Journal",
    subject: "Science – Daily Routine",
    area: "Science",
    task: "Write/draw 2 morning activities and 2 night activities.",
    parentCheck: "4 activities total, correctly split morning/night.",
    submission: "photo",
  },
  {
    id: "G2-7",
    grade: "2",
    title: "Weather Tracker",
    subject: "Science – Weather",
    area: "Science",
    task: "Log the weather for 3 days in a row.",
    parentCheck: "All 3 days logged, child explains each.",
    submission: "photo",
  },
  {
    id: "G2-8",
    grade: "2",
    title: "Words at Home Hunt",
    subject: "Reading & Writing – Parts of Speech",
    area: "Reading & Writing",
    task: "Find/write nouns, verbs, adjectives, pronoun from home.",
    parentCheck: "Words correctly categorized, child uses one in a sentence.",
    submission: "photo",
  },
  {
    id: "G2-9",
    grade: "2",
    title: "Simple Sentence",
    subject: "Reading & Writing – Sentences",
    area: "Reading & Writing",
    task: "Write 2 sentences about your day, each with an adjective.",
    parentCheck: "Sentences make sense, adjective identified.",
    submission: "photo",
  },

  // ---------- Grade 3 (Hard) ----------
  {
    id: "G3-1",
    grade: "3",
    title: "Sharing Rice Cake",
    subject: "Math – Fractions",
    area: "Math",
    task: "Cut paper/bread into equal parts and name the fractions (1/2, 1/4).",
    parentCheck: "Child shows and explains each fraction correctly.",
    submission: "photo",
  },
  {
    id: "G3-2",
    grade: "3",
    title: "Market Multiplication",
    subject: "Math – Multiplication",
    area: "Math",
    task: "Compute total for 3 packs of noodles at ₱12 each.",
    parentCheck: "Answer (₱36) is correct and child explains it.",
    submission: "in-person",
  },
  {
    id: "G3-3",
    grade: "3",
    title: "Equal Division",
    subject: "Math – Division",
    area: "Math",
    task: "Share 12 candies equally among family members.",
    parentCheck: "Each person receives the same amount.",
    submission: "photo",
  },
  {
    id: "G3-4",
    grade: "3",
    title: "Order of Operations Card",
    subject: "Math – Order of Operations",
    area: "Math",
    task: "Solve 3 order-of-operations cards written by a parent.",
    parentCheck: "Working shown and answers are correct.",
    submission: "photo",
  },
  {
    id: "G3-5",
    grade: "3",
    title: "Calendar Detective",
    subject: "Math – Time/Calendar",
    area: "Math",
    task: "Find 3 important dates and count days until each.",
    parentCheck: "Counting is correct.",
    submission: "photo",
  },
  {
    id: "G3-6",
    grade: "3",
    title: "Roman Numeral Hunt",
    subject: "Math – Roman Numerals",
    area: "Math",
    task: "Find Roman numerals on a clock or in a book.",
    parentCheck: "Child reads them correctly.",
    submission: "photo",
  },
  {
    id: "G3-7",
    grade: "3",
    title: "Food Chain Draw",
    subject: "Science – Ecosystems",
    area: "Science",
    task: "Draw a food chain and label herbivore/omnivore/carnivore.",
    parentCheck: "Labels are correct.",
    submission: "photo",
  },
  {
    id: "G3-8",
    grade: "3",
    title: "Short Paragraph",
    subject: "Reading & Writing – Paragraphs",
    area: "Reading & Writing",
    task: "Write a 4–5 sentence paragraph with correct capitalization/punctuation.",
    parentCheck: "Paragraph is read and signed off.",
    submission: "photo",
  },
];

export function getMissionsForGrade(grade: Grade): OfflineMission[] {
  return offlineMissions.filter((mission) => mission.grade === grade);
}
