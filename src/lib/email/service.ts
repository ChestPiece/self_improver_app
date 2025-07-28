"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/actions";

interface EmailData {
  to: string;
  template:
    | "goal_reminder"
    | "habit_reminder"
    | "achievement"
    | "weekly_report"
    | "welcome";
  data: Record<string, any>;
}

// Call the Supabase Edge Function to send emails
async function sendEmail({ to, template, data }: EmailData) {
  const supabase = await createClient();

  // Get the current user to ensure they can send emails
  const user = await getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const { data: result, error } = await supabase.functions.invoke(
      "send-email",
      {
        body: { to, template, data },
      }
    );

    if (error) {
      throw error;
    }

    return result;
  } catch (error) {
    console.error("Email service error:", error);
    throw new Error("Failed to send email");
  }
}

// Send goal reminder email
export async function sendGoalReminderEmail(
  userEmail: string,
  goalTitle: string,
  goalDescription: string,
  daysUntilDeadline: number
) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

  return await sendEmail({
    to: userEmail,
    template: "goal_reminder",
    data: {
      goalTitle,
      goalDescription,
      daysUntilDeadline,
      dashboardUrl,
    },
  });
}

// Send habit reminder email
export async function sendHabitReminderEmail(
  userEmail: string,
  habitName: string,
  currentStreak: number = 0
) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/habits`;

  return await sendEmail({
    to: userEmail,
    template: "habit_reminder",
    data: {
      habitName,
      currentStreak,
      dashboardUrl,
    },
  });
}

// Send achievement notification email
export async function sendAchievementEmail(
  userEmail: string,
  achievementTitle: string,
  description: string
) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/progress`;

  return await sendEmail({
    to: userEmail,
    template: "achievement",
    data: {
      achievementTitle,
      description,
      dashboardUrl,
    },
  });
}

// Send weekly progress report email
export async function sendWeeklyReportEmail(
  userEmail: string,
  stats: {
    goalsCompleted: number;
    habitsCompleted: number;
    practiceMinutes: number;
  }
) {
  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const encouragementMessages = [
    "You're making great progress on your personal growth journey!",
    "Every small step counts toward your bigger goals!",
    "Consistency is the key to transformation - keep going!",
    "Your dedication this week is truly inspiring!",
    "Amazing work! You're building momentum that will carry you forward!",
  ];

  const randomMessage =
    encouragementMessages[
      Math.floor(Math.random() * encouragementMessages.length)
    ];
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/progress`;

  return await sendEmail({
    to: userEmail,
    template: "weekly_report",
    data: {
      weekStart: weekStart.toLocaleDateString(),
      weekEnd: weekEnd.toLocaleDateString(),
      goalsCompleted: stats.goalsCompleted,
      habitsCompleted: stats.habitsCompleted,
      practiceMinutes: stats.practiceMinutes,
      encouragementMessage: randomMessage,
      dashboardUrl,
    },
  });
}

// Send welcome email for new users
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

  return await sendEmail({
    to: userEmail,
    template: "welcome",
    data: {
      userName,
      dashboardUrl,
    },
  });
}

// Schedule email notifications based on user preferences
export async function scheduleEmailNotifications(userId: string) {
  const supabase = await createClient();

  try {
    // Get user settings to check notification preferences
    const { data: settings } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", userId)
      .single();

    const userSettings = settings?.settings;
    if (!userSettings?.notifications?.email) {
      return; // User has disabled email notifications
    }

    // Get user email from auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return;
    }

    // Check for due goals if goal reminders are enabled
    if (userSettings.notifications.goalReminders) {
      const { data: dueGoals } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .not("target_date", "is", null);

      if (dueGoals) {
        for (const goal of dueGoals) {
          const targetDate = new Date(goal.target_date);
          const today = new Date();
          const daysUntil = Math.ceil(
            (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Send reminder if goal is due within 3 days
          if (daysUntil <= 3 && daysUntil >= 0) {
            await sendGoalReminderEmail(
              user.email,
              goal.title,
              goal.description || "",
              daysUntil
            );
          }
        }
      }
    }

    // Check for incomplete habits if habit reminders are enabled
    if (userSettings.notifications.habitReminders) {
      const { data: habits } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true);

      if (habits) {
        const today = new Date().toDateString();

        for (const habit of habits) {
          // Check if habit was completed today
          const { data: todayLog } = await supabase
            .from("habit_logs")
            .select("*")
            .eq("habit_id", habit.id)
            .gte("completed_at", today)
            .limit(1);

          // Send reminder if habit not completed today (only for daily habits)
          if (!todayLog?.length && habit.frequency === "daily") {
            await sendHabitReminderEmail(
              user.email,
              habit.name,
              habit.current_streak || 0
            );
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error scheduling email notifications:", error);
    return { error: "Failed to schedule notifications" };
  }
}

// Send weekly report to all users who have opted in
export async function sendWeeklyReportsToAllUsers() {
  const supabase = await createClient();

  try {
    // Get all users who have weekly reports enabled
    const { data: users } = await supabase
      .from("user_settings")
      .select("user_id, settings")
      .eq("settings->notifications->weeklyReport", true);

    if (!users?.length) {
      return { success: true, message: "No users with weekly reports enabled" };
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const userSetting of users) {
      try {
        const userId = userSetting.user_id;

        // Get user email
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (!profile) continue;

        // Get user's auth data for email
        const {
          data: { user },
        } = await supabase.auth.admin.getUserById(userId);
        if (!user?.email) continue;

        // Calculate weekly stats
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Get goals completed this week
        const { count: goalsCompleted } = await supabase
          .from("goals")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "completed")
          .gte("updated_at", weekAgo.toISOString());

        // Get habits completed this week
        const { count: habitsCompleted } = await supabase
          .from("habit_logs")
          .select("*", { count: "exact", head: true })
          .gte("completed_at", weekAgo.toISOString());

        // Get practice minutes this week
        const { data: practices } = await supabase
          .from("practice_sessions")
          .select("duration")
          .eq("user_id", userId)
          .gte("completed_at", weekAgo.toISOString());

        const practiceMinutes =
          practices?.reduce(
            (total, session) => total + (session.duration || 0),
            0
          ) || 0;

        // Send weekly report
        await sendWeeklyReportEmail(user.email, {
          goalsCompleted: goalsCompleted || 0,
          habitsCompleted: habitsCompleted || 0,
          practiceMinutes,
        });

        sentCount++;
      } catch (error) {
        console.error(
          `Error sending weekly report to user ${userSetting.user_id}:`,
          error
        );
        errorCount++;
      }
    }

    return {
      success: true,
      message: `Sent ${sentCount} weekly reports, ${errorCount} errors`,
    };
  } catch (error) {
    console.error("Error sending weekly reports:", error);
    return { error: "Failed to send weekly reports" };
  }
}
 
