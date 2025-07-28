"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Habit validation schema
const habitSchema = z.object({
  name: z
    .string()
    .min(1, "Habit name is required")
    .max(100, "Habit name must be less than 100 characters"),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  target_count: z.number().positive("Target count must be positive").default(1),
  is_active: z.boolean().default(true),
});

// Habit log validation schema
const habitLogSchema = z.object({
  habit_id: z.string().min(1, "Habit ID is required"),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

export async function createHabit(formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const data = {
    name: formData.get("name") as string,
    frequency: formData.get("frequency") as string,
    target_count: formData.get("target_count")
      ? Number(formData.get("target_count"))
      : 1,
    is_active: true,
  };

  // Validate input
  const validatedFields = habitSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error:
        "Invalid input: " +
        validatedFields.error.issues.map((e) => e.message).join(", "),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("habits").insert({
    ...validatedFields.data,
    user_id: user.id,
    current_streak: 0,
    best_streak: 0,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { success: "Habit created successfully!" };
}

export async function updateHabit(id: string, formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const data = {
    name: formData.get("name") as string,
    frequency: formData.get("frequency") as string,
    target_count: formData.get("target_count")
      ? Number(formData.get("target_count"))
      : 1,
    is_active: formData.get("is_active") === "true",
  };

  // Validate input
  const validatedFields = habitSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error:
        "Invalid input: " +
        validatedFields.error.issues.map((e) => e.message).join(", "),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({
      ...validatedFields.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { success: "Habit updated successfully!" };
}

export async function deleteHabit(id: string) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { success: "Habit deleted successfully!" };
}

export async function logHabitCompletion(formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const data = {
    habit_id: formData.get("habit_id") as string,
    notes: (formData.get("notes") as string) || null,
  };

  // Validate input
  const validatedFields = habitLogSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error:
        "Invalid input: " +
        validatedFields.error.issues.map((e) => e.message).join(", "),
    };
  }

  const supabase = await createClient();

  // Insert habit log
  const { error: logError } = await supabase.from("habit_logs").insert({
    habit_id: validatedFields.data.habit_id,
    completed_at: new Date().toISOString(),
    notes: validatedFields.data.notes,
  });

  if (logError) {
    return { error: logError.message };
  }

  // Update habit streak
  await updateHabitStreak(validatedFields.data.habit_id);

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return { success: "Habit completion logged!" };
}

export async function getUserHabits(includeInactive = false) {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  let query = supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data: habits, error } = await query;

  if (error) {
    console.error("Error fetching habits:", error);
    return null;
  }

  return habits;
}

export async function getHabitLogs(habitId?: string, limit = 100) {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  // Get user's habits first to ensure security
  const { data: userHabits } = await supabase
    .from("habits")
    .select("id")
    .eq("user_id", user.id);

  if (!userHabits) {
    return null;
  }

  const habitIds = userHabits.map((h) => h.id);

  let query = supabase
    .from("habit_logs")
    .select("*")
    .in("habit_id", habitIds)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (habitId) {
    query = query.eq("habit_id", habitId);
  }

  const { data: logs, error } = await query;

  if (error) {
    console.error("Error fetching habit logs:", error);
    return null;
  }

  return logs;
}

export async function getHabitById(id: string) {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data: habit, error } = await supabase
    .from("habits")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching habit:", error);
    return null;
  }

  return habit;
}

// Helper function to update habit streak
async function updateHabitStreak(habitId: string) {
  const user = await getUser();
  if (!user) return;

  const supabase = await createClient();

  // Get habit details
  const { data: habit } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", user.id)
    .single();

  if (!habit) return;

  // Get recent logs for this habit
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .order("completed_at", { ascending: false })
    .limit(100);

  if (!logs) return;

  // Calculate current streak based on frequency
  const currentStreak = calculateStreakFromLogs(logs, habit.frequency);
  const bestStreak = Math.max(currentStreak, habit.best_streak || 0);

  // Update habit with new streak data
  await supabase
    .from("habits")
    .update({
      current_streak: currentStreak,
      best_streak: bestStreak,
      updated_at: new Date().toISOString(),
    })
    .eq("id", habitId);
}

// Helper function to calculate streak from logs
function calculateStreakFromLogs(logs: any[], frequency: string): number {
  if (!logs || logs.length === 0) return 0;

  const now = new Date();
  let streak = 0;

  if (frequency === "daily") {
    // Check consecutive days
    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].completed_at);
      const expectedDate = new Date(now);
      expectedDate.setDate(expectedDate.getDate() - i);

      // Check if log is from expected date (within same day)
      if (isSameDay(logDate, expectedDate)) {
        streak++;
      } else {
        break;
      }
    }
  } else if (frequency === "weekly") {
    // Check consecutive weeks
    const weeksWithLogs = new Set();
    logs.forEach((log) => {
      const logDate = new Date(log.completed_at);
      const weekKey = getWeekKey(logDate);
      weeksWithLogs.add(weekKey);
    });

    const currentWeek = getWeekKey(now);
    let weekOffset = 0;
    while (
      weeksWithLogs.has(
        getWeekKey(
          new Date(now.getTime() - weekOffset * 7 * 24 * 60 * 60 * 1000)
        )
      )
    ) {
      streak++;
      weekOffset++;
    }
  } else if (frequency === "monthly") {
    // Check consecutive months
    const monthsWithLogs = new Set();
    logs.forEach((log) => {
      const logDate = new Date(log.completed_at);
      const monthKey = `${logDate.getFullYear()}-${logDate.getMonth()}`;
      monthsWithLogs.add(monthKey);
    });

    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    let monthOffset = 0;
    while (monthsWithLogs.has(getMonthKey(now, monthOffset))) {
      streak++;
      monthOffset++;
    }
  }

  return streak;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getWeekKey(date: Date): string {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  return `${startOfWeek.getFullYear()}-${startOfWeek.getMonth()}-${startOfWeek.getDate()}`;
}

function getMonthKey(date: Date, monthOffset: number): string {
  const targetDate = new Date(date);
  targetDate.setMonth(targetDate.getMonth() - monthOffset);
  return `${targetDate.getFullYear()}-${targetDate.getMonth()}`;
}
