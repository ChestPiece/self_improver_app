import { Database } from "./database.types";
import { LucideIcon } from "lucide-react";
import {
  Heart,
  Dumbbell,
  Brain,
  Briefcase,
  User,
  DollarSign,
  BookOpen,
  Users,
} from "lucide-react";

export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];

export type GoalStatus = "active" | "completed" | "paused" | "cancelled";
export type GoalCategory =
  | "health"
  | "fitness"
  | "mental"
  | "career"
  | "personal"
  | "finance"
  | "education"
  | "relationships";

export interface GoalCategoryInfo {
  value: GoalCategory;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const GOAL_CATEGORIES: GoalCategoryInfo[] = [
  {
    value: "health",
    label: "Health",
    description: "Physical health, medical goals, and wellness",
    icon: Heart,
    color: "text-red-600 bg-red-50 border-red-200",
  },
  {
    value: "fitness",
    label: "Fitness",
    description: "Exercise, strength, cardio, and physical activity",
    icon: Dumbbell,
    color: "text-orange-600 bg-orange-50 border-orange-200",
  },
  {
    value: "mental",
    label: "Mental Health",
    description: "Mindfulness, stress management, and mental wellbeing",
    icon: Brain,
    color: "text-purple-600 bg-purple-50 border-purple-200",
  },
  {
    value: "career",
    label: "Career",
    description: "Professional development, skills, and work goals",
    icon: Briefcase,
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    value: "personal",
    label: "Personal Development",
    description: "Self-improvement, habits, and personal growth",
    icon: User,
    color: "text-green-600 bg-green-50 border-green-200",
  },
  {
    value: "finance",
    label: "Finance",
    description: "Savings, investments, and financial goals",
    icon: DollarSign,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },
  {
    value: "education",
    label: "Education",
    description: "Learning, courses, and knowledge acquisition",
    icon: BookOpen,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
  {
    value: "relationships",
    label: "Relationships",
    description: "Social connections, family, and friendship goals",
    icon: Users,
    color: "text-pink-600 bg-pink-50 border-pink-200",
  },
];

export interface GoalStatusInfo {
  value: GoalStatus;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

export const GOAL_STATUSES: GoalStatusInfo[] = [
  {
    value: "active",
    label: "Active",
    description: "Currently working on this goal",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  {
    value: "completed",
    label: "Completed",
    description: "Goal has been achieved",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  {
    value: "paused",
    label: "Paused",
    description: "Temporarily not working on this goal",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    description: "No longer pursuing this goal",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
];

export function getCategoryInfo(category: string): GoalCategoryInfo {
  return (
    GOAL_CATEGORIES.find((c) => c.value === category) || GOAL_CATEGORIES[0]
  );
}

export function getStatusInfo(status: string): GoalStatusInfo {
  return GOAL_STATUSES.find((s) => s.value === status) || GOAL_STATUSES[0];
}

export function calculateProgress(
  current: number | null,
  target: number | null
): number {
  if (!current || !target || target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
}
