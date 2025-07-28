"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Notification validation schema
const notificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  message: z.string().min(1, "Message is required"),
  type: z.enum([
    "goal_reminder",
    "habit_reminder",
    "achievement",
    "weekly_report",
    "system",
  ]),
});

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string
) {
  const data = { title, message, type };

  // Validate input
  const validatedFields = notificationSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error:
        "Invalid notification data: " +
        validatedFields.error.issues.map((e) => e.message).join(", "),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    ...validatedFields.data,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Notification created successfully!" };
}

export async function getUserNotifications(limit = 50) {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }

  return notifications;
}

export async function getUnreadNotificationCount() {
  const user = await getUser();
  if (!user) {
    return 0;
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }

  return count || 0;
}

export async function markNotificationRead(notificationId: string) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: "Notification marked as read" };
}

export async function markAllNotificationsRead() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: "All notifications marked as read" };
}

export async function deleteNotification(notificationId: string) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: "Notification deleted" };
}

// Helper function to create achievement notifications with email
export async function createAchievementNotification(
  userId: string,
  achievementTitle: string,
  achievementDescription: string
) {
  // Create in-app notification
  const inAppResult = await createNotification(
    userId,
    `🏆 Achievement Unlocked: ${achievementTitle}`,
    achievementDescription,
    "achievement"
  );

  // Also send email if user has email notifications enabled
  try {
    const supabase = await createClient();

    // Check if user has email notifications and achievements enabled
    const { data: settings } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", userId)
      .single();

    const userSettings = settings?.settings;

    if (
      userSettings?.notifications?.email &&
      userSettings?.notifications?.achievements
    ) {
      // Get user email
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(userId);

      if (user?.email) {
        // Import email service (dynamic import to avoid issues)
        const { sendAchievementEmail } = await import("@/lib/email/service");
        await sendAchievementEmail(
          user.email,
          achievementTitle,
          achievementDescription
        );
      }
    }
  } catch (error) {
    // Don't fail the notification if email fails
    console.error("Failed to send achievement email:", error);
  }

  return inAppResult;
}

// Helper function to create goal reminder notifications with email
export async function createGoalReminderNotification(
  userId: string,
  goalTitle: string,
  daysUntilDeadline: number,
  goalDescription?: string
) {
  const message =
    daysUntilDeadline <= 0
      ? `Your goal "${goalTitle}" is due today!`
      : `Your goal "${goalTitle}" is due in ${daysUntilDeadline} day${
          daysUntilDeadline > 1 ? "s" : ""
        }.`;

  // Create in-app notification
  const inAppResult = await createNotification(
    userId,
    "🎯 Goal Reminder",
    message,
    "goal_reminder"
  );

  // Also send email if user has email notifications enabled
  try {
    const supabase = await createClient();

    // Check if user has email notifications and goal reminders enabled
    const { data: settings } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", userId)
      .single();

    const userSettings = settings?.settings;

    if (
      userSettings?.notifications?.email &&
      userSettings?.notifications?.goalReminders
    ) {
      // Get user email
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(userId);

      if (user?.email) {
        // Import email service (dynamic import to avoid issues)
        const { sendGoalReminderEmail } = await import("@/lib/email/service");
        await sendGoalReminderEmail(
          user.email,
          goalTitle,
          goalDescription || message,
          daysUntilDeadline
        );
      }
    }
  } catch (error) {
    // Don't fail the notification if email fails
    console.error("Failed to send goal reminder email:", error);
  }

  return inAppResult;
}

// Helper function to create habit reminder notifications with email
export async function createHabitReminderNotification(
  userId: string,
  habitName: string,
  currentStreak?: number
) {
  // Create in-app notification
  const inAppResult = await createNotification(
    userId,
    "📅 Habit Reminder",
    `Don't forget to complete your habit: ${habitName}`,
    "habit_reminder"
  );

  // Also send email if user has email notifications enabled
  try {
    const supabase = await createClient();

    // Check if user has email notifications and habit reminders enabled
    const { data: settings } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", userId)
      .single();

    const userSettings = settings?.settings;

    if (
      userSettings?.notifications?.email &&
      userSettings?.notifications?.habitReminders
    ) {
      // Get user email
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(userId);

      if (user?.email) {
        // Import email service (dynamic import to avoid issues)
        const { sendHabitReminderEmail } = await import("@/lib/email/service");
        await sendHabitReminderEmail(user.email, habitName, currentStreak);
      }
    }
  } catch (error) {
    // Don't fail the notification if email fails
    console.error("Failed to send habit reminder email:", error);
  }

  return inAppResult;
}

// Helper function to create weekly report notifications with email
export async function createWeeklyReportNotification(
  userId: string,
  weeklyStats: {
    goalsCompleted: number;
    habitsCompleted: number;
    practiceMinutes: number;
  }
) {
  const message = `This week you completed ${weeklyStats.goalsCompleted} goals, ${weeklyStats.habitsCompleted} habits, and practiced for ${weeklyStats.practiceMinutes} minutes. Keep it up!`;

  // Create in-app notification
  const inAppResult = await createNotification(
    userId,
    "📊 Weekly Progress Report",
    message,
    "weekly_report"
  );

  // Also send email if user has email notifications enabled
  try {
    const supabase = await createClient();

    // Check if user has email notifications and weekly reports enabled
    const { data: settings } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", userId)
      .single();

    const userSettings = settings?.settings;

    if (
      userSettings?.notifications?.email &&
      userSettings?.notifications?.weeklyReport
    ) {
      // Get user email
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(userId);

      if (user?.email) {
        // Import email service (dynamic import to avoid issues)
        const { sendWeeklyReportEmail } = await import("@/lib/email/service");
        await sendWeeklyReportEmail(user.email, weeklyStats);
      }
    }
  } catch (error) {
    // Don't fail the notification if email fails
    console.error("Failed to send weekly report email:", error);
  }

  return inAppResult;
}
