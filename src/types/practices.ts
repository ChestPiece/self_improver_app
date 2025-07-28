import { Database } from "./database.types";
import { LucideIcon } from "lucide-react";
import { Brain, Dumbbell, BookOpen } from "lucide-react";

export type Practice = Database["public"]["Tables"]["practices"]["Row"];
export type PracticeInsert =
  Database["public"]["Tables"]["practices"]["Insert"];
export type PracticeUpdate =
  Database["public"]["Tables"]["practices"]["Update"];

export type PracticeSession =
  Database["public"]["Tables"]["practice_sessions"]["Row"];
export type PracticeSessionInsert =
  Database["public"]["Tables"]["practice_sessions"]["Insert"];

export type PracticeCategory =
  | "mental_health"
  | "physical_health"
  | "personal_development";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface PracticeCategoryInfo {
  id: PracticeCategory;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const PRACTICE_CATEGORIES: PracticeCategoryInfo[] = [
  {
    id: "mental_health",
    name: "Mental Health",
    description: "Meditation, mindfulness, and emotional wellness practices",
    icon: Brain,
    color: "from-purple-500/10 to-blue-500/10",
  },
  {
    id: "physical_health",
    name: "Physical Health",
    description: "Fitness, yoga, strength training, and physical wellness",
    icon: Dumbbell,
    color: "from-green-500/10 to-emerald-500/10",
  },
  {
    id: "personal_development",
    name: "Personal Development",
    description: "Skill building, productivity, and personal growth",
    icon: BookOpen,
    color: "from-orange-500/10 to-yellow-500/10",
  },
];

export interface DifficultyInfo {
  level: DifficultyLevel;
  name: string;
  description: string;
  color: string;
}

export const DIFFICULTY_LEVELS: DifficultyInfo[] = [
  {
    level: "beginner",
    name: "Beginner",
    description: "Perfect for getting started",
    color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
  },
  {
    level: "intermediate",
    name: "Intermediate",
    description: "For those with some experience",
    color:
      "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300",
  },
  {
    level: "advanced",
    name: "Advanced",
    description: "For experienced practitioners",
    color: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
  },
];

export function getCategoryInfo(category: string): PracticeCategoryInfo {
  return (
    PRACTICE_CATEGORIES.find((c) => c.id === category) || PRACTICE_CATEGORIES[0]
  );
}

export function getDifficultyInfo(level: string): DifficultyInfo {
  return (
    DIFFICULTY_LEVELS.find((d) => d.level === level) || DIFFICULTY_LEVELS[0]
  );
}

// Predefined practices data
export const PREDEFINED_PRACTICES = {
  mental_health: [
    {
      title: "Morning Meditation",
      description: "Start your day with a peaceful 10-minute guided meditation",
      duration: 10,
      difficulty_level: "beginner" as DifficultyLevel,
      instructions: [
        "Find a quiet, comfortable place to sit",
        "Close your eyes and take three deep breaths",
        "Focus on your breath for 10 minutes",
        "If thoughts arise, gently return focus to breathing",
        "End with gratitude for taking this time",
      ],
    },
    {
      title: "Gratitude Journaling",
      description: "Write down three things you're grateful for today",
      duration: 5,
      difficulty_level: "beginner" as DifficultyLevel,
      instructions: [
        "Get your journal or open a notes app",
        "Write today's date",
        "List three specific things you're grateful for",
        "For each item, write why you're grateful",
        "Take a moment to feel the gratitude",
      ],
    },
    {
      title: "Mindful Breathing",
      description: "Practice focused breathing to reduce stress and anxiety",
      duration: 15,
      difficulty_level: "intermediate" as DifficultyLevel,
      instructions: [
        "Sit comfortably with your back straight",
        "Place one hand on chest, one on belly",
        "Breathe in slowly through your nose (4 counts)",
        "Hold your breath (4 counts)",
        "Exhale slowly through mouth (6 counts)",
        "Repeat for 15 minutes",
      ],
    },
  ],
  physical_health: [
    {
      title: "Morning Stretch Routine",
      description:
        "Gentle stretches to wake up your body and improve flexibility",
      duration: 15,
      difficulty_level: "beginner" as DifficultyLevel,
      instructions: [
        "Start with gentle neck rolls (5 each direction)",
        "Shoulder shrugs and rolls (10 times)",
        "Cat-cow stretches (10 repetitions)",
        "Forward fold to touch your toes",
        "Side stretches (hold 30 seconds each)",
        "End with child's pose (2 minutes)",
      ],
    },
    {
      title: "Bodyweight Workout",
      description: "No equipment needed - build strength with your body weight",
      duration: 30,
      difficulty_level: "intermediate" as DifficultyLevel,
      instructions: [
        "Warm up with jumping jacks (2 minutes)",
        "Push-ups: 3 sets of 10-15",
        "Squats: 3 sets of 15-20",
        "Plank: 3 sets of 30-60 seconds",
        "Lunges: 3 sets of 10 each leg",
        "Cool down with stretching",
      ],
    },
    {
      title: "Walking Meditation",
      description: "Combine mindfulness with gentle physical activity",
      duration: 20,
      difficulty_level: "beginner" as DifficultyLevel,
      instructions: [
        "Choose a quiet path or indoor space",
        "Walk at a slow, comfortable pace",
        "Focus on the sensation of your feet touching the ground",
        "Notice your surroundings without judgment",
        "When mind wanders, gently return to walking",
        "End with a moment of stillness",
      ],
    },
  ],
  personal_development: [
    {
      title: "Daily Reading",
      description: "Spend focused time reading for personal growth",
      duration: 30,
      difficulty_level: "beginner" as DifficultyLevel,
      instructions: [
        "Choose a book related to your goals",
        "Find a quiet, distraction-free space",
        "Set a timer for 30 minutes",
        "Read actively - take notes if helpful",
        "Reflect on key insights",
        "Consider how to apply what you learned",
      ],
    },
    {
      title: "Skill Practice Session",
      description: "Dedicated time to practice a new skill or hobby",
      duration: 45,
      difficulty_level: "intermediate" as DifficultyLevel,
      instructions: [
        "Choose your skill to practice",
        "Set up your practice space",
        "Review what you learned last session",
        "Practice with focus and intention",
        "Challenge yourself slightly beyond comfort zone",
        "Record your progress and insights",
      ],
    },
    {
      title: "Weekly Planning",
      description: "Organize your week for maximum productivity and balance",
      duration: 25,
      difficulty_level: "beginner" as DifficultyLevel,
      instructions: [
        "Review your goals and priorities",
        "Look at your calendar for the week",
        "Block time for important tasks",
        "Schedule self-care and breaks",
        "Identify potential challenges",
        "Set intention for the week ahead",
      ],
    },
  ],
};
