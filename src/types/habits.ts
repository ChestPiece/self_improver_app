import { Database } from "./database.types";

export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
export type HabitUpdate = Database["public"]["Tables"]["habits"]["Update"];

export type HabitLog = Database["public"]["Tables"]["habit_logs"]["Row"];
export type HabitLogInsert =
  Database["public"]["Tables"]["habit_logs"]["Insert"];

export type HabitFrequency = "daily" | "weekly" | "monthly";

export interface HabitFrequencyInfo {
  frequency: HabitFrequency;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const HABIT_FREQUENCIES: HabitFrequencyInfo[] = [
  {
    frequency: "daily",
    name: "Daily",
    description: "Every day",
    icon: "📅",
    color: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
  },
  {
    frequency: "weekly",
    name: "Weekly",
    description: "Once per week",
    icon: "📊",
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    frequency: "monthly",
    name: "Monthly",
    description: "Once per month",
    icon: "📆",
    color:
      "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300",
  },
];

export function getFrequencyInfo(frequency: string): HabitFrequencyInfo {
  return (
    HABIT_FREQUENCIES.find((f) => f.frequency === frequency) ||
    HABIT_FREQUENCIES[0]
  );
}

// Predefined habit suggestions
export const HABIT_SUGGESTIONS = [
  {
    name: "Drink 8 glasses of water",
    frequency: "daily" as HabitFrequency,
    target_count: 8,
    category: "health",
  },
  {
    name: "Read for 30 minutes",
    frequency: "daily" as HabitFrequency,
    target_count: 1,
    category: "personal_development",
  },
  {
    name: "Exercise or workout",
    frequency: "daily" as HabitFrequency,
    target_count: 1,
    category: "fitness",
  },
  {
    name: "Meditate",
    frequency: "daily" as HabitFrequency,
    target_count: 1,
    category: "mental",
  },
  {
    name: "Write in journal",
    frequency: "daily" as HabitFrequency,
    target_count: 1,
    category: "mental",
  },
  {
    name: "Practice gratitude",
    frequency: "daily" as HabitFrequency,
    target_count: 1,
    category: "mental",
  },
  {
    name: "Take vitamins",
    frequency: "daily" as HabitFrequency,
    target_count: 1,
    category: "health",
  },
  {
    name: "Plan next day",
    frequency: "daily" as HabitFrequency,
    target_count: 1,
    category: "personal",
  },
  {
    name: "Go for a walk",
    frequency: "weekly" as HabitFrequency,
    target_count: 3,
    category: "fitness",
  },
  {
    name: "Deep clean living space",
    frequency: "weekly" as HabitFrequency,
    target_count: 1,
    category: "personal",
  },
  {
    name: "Review weekly goals",
    frequency: "weekly" as HabitFrequency,
    target_count: 1,
    category: "personal",
  },
  {
    name: "Call family/friends",
    frequency: "weekly" as HabitFrequency,
    target_count: 1,
    category: "relationships",
  },
  {
    name: "Review finances",
    frequency: "monthly" as HabitFrequency,
    target_count: 1,
    category: "finance",
  },
  {
    name: "Schedule health checkups",
    frequency: "monthly" as HabitFrequency,
    target_count: 1,
    category: "health",
  },
  {
    name: "Review and update goals",
    frequency: "monthly" as HabitFrequency,
    target_count: 1,
    category: "personal",
  },
];

// Utility functions for habit calculations
export function calculateStreak(
  habitLogs: HabitLog[],
  frequency: HabitFrequency
): number {
  if (habitLogs.length === 0) return 0;

  const sortedLogs = habitLogs.sort(
    (a, b) =>
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );

  let streak = 0;
  const today = new Date();

  // Helper function to check if two dates are consecutive based on frequency
  const isConsecutive = (date1: Date, date2: Date): boolean => {
    const diffInDays =
      Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);

    switch (frequency) {
      case "daily":
        return diffInDays <= 1.5; // Allow some flexibility for different times of day
      case "weekly":
        return diffInDays <= 8; // Within a week + 1 day
      case "monthly":
        return diffInDays <= 32; // Within a month + 2 days
      default:
        return false;
    }
  };

  // Check if there's a recent completion
  const lastLog = new Date(sortedLogs[0].completed_at);
  if (!isConsecutive(today, lastLog)) {
    return 0;
  }

  // Count consecutive completions
  let lastDate = lastLog;
  for (let i = 0; i < sortedLogs.length; i++) {
    const currentDate = new Date(sortedLogs[i].completed_at);

    if (i === 0 || isConsecutive(lastDate, currentDate)) {
      streak++;
      lastDate = currentDate;
    } else {
      break;
    }
  }

  return streak;
}

export function getHabitCompletionToday(habitLogs: HabitLog[]): boolean {
  const today = new Date().toDateString();
  return habitLogs.some(
    (log) => new Date(log.completed_at).toDateString() === today
  );
}

export function getHabitCompletionThisWeek(habitLogs: HabitLog[]): number {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);

  return habitLogs.filter((log) => new Date(log.completed_at) >= startOfWeek)
    .length;
}

export function getHabitCompletionThisMonth(habitLogs: HabitLog[]): number {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return habitLogs.filter((log) => new Date(log.completed_at) >= startOfMonth)
    .length;
}
