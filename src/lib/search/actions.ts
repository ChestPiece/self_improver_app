"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/actions";

export interface SearchResult {
  id: string;
  title: string;
  description?: string | null;
  category?: string;
  type: "goal" | "habit" | "practice";
  status?: string | null;
  created_at: string;
  url: string;
}

export async function searchUserData(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const user = await getUser();
  if (!user) {
    return [];
  }

  const supabase = await createClient();
  const searchTerm = `%${query.toLowerCase()}%`;

  try {
    // Search goals
    const { data: goals } = await supabase
      .from("goals")
      .select("id, title, description, category, status, created_at")
      .eq("user_id", user.id)
      .or(
        `title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`
      )
      .order("created_at", { ascending: false })
      .limit(10);

    // Search habits
    const { data: habits } = await supabase
      .from("habits")
      .select("id, name, frequency, created_at")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .or(`name.ilike.${searchTerm},frequency.ilike.${searchTerm}`)
      .order("created_at", { ascending: false })
      .limit(10);

    // Search practices (both user's and public)
    const { data: practices } = await supabase
      .from("practices")
      .select("id, title, description, category, created_at")
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .or(
        `title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`
      )
      .order("created_at", { ascending: false })
      .limit(10);

    // Transform and combine results
    const results: SearchResult[] = [];

    // Add goals
    if (goals) {
      goals.forEach((goal) => {
        results.push({
          id: goal.id,
          title: goal.title,
          description: goal.description,
          category: goal.category,
          type: "goal",
          status: goal.status,
          created_at: goal.created_at,
          url: `/goals?highlight=${goal.id}`,
        });
      });
    }

    // Add habits
    if (habits) {
      habits.forEach((habit) => {
        results.push({
          id: habit.id,
          title: habit.name,
          description: `${habit.frequency} habit`,
          category: "habit",
          type: "habit",
          created_at: habit.created_at,
          url: `/habits?highlight=${habit.id}`,
        });
      });
    }

    // Add practices
    if (practices) {
      practices.forEach((practice) => {
        results.push({
          id: practice.id,
          title: practice.title,
          description: practice.description,
          category: practice.category,
          type: "practice",
          created_at: practice.created_at,
          url: `/practices?highlight=${practice.id}`,
        });
      });
    }

    // Sort by relevance (exact matches first, then by date)
    return results.sort((a, b) => {
      const aExact = a.title.toLowerCase().includes(query.toLowerCase())
        ? 1
        : 0;
      const bExact = b.title.toLowerCase().includes(query.toLowerCase())
        ? 1
        : 0;

      if (aExact !== bExact) {
        return bExact - aExact;
      }

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

export async function getQuickActions() {
  const user = await getUser();
  if (!user) {
    return [];
  }

  return [
    {
      id: "create-goal",
      title: "Create New Goal",
      description: "Set a new personal or professional goal",
      type: "action" as const,
      url: "/goals",
      icon: "target",
    },
    {
      id: "create-habit",
      title: "Add New Habit",
      description: "Start tracking a new daily habit",
      type: "action" as const,
      url: "/habits",
      icon: "calendar",
    },
    {
      id: "start-practice",
      title: "Start Practice Session",
      description: "Begin a mindfulness or development practice",
      type: "action" as const,
      url: "/practices",
      icon: "activity",
    },
    {
      id: "view-progress",
      title: "View Progress",
      description: "Check your overall progress and analytics",
      type: "action" as const,
      url: "/progress",
      icon: "trending-up",
    },
  ];
}
