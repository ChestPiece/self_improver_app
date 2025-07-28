"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// User settings validation schema
const userSettingsSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    goalReminders: z.boolean(),
    habitReminders: z.boolean(),
    achievements: z.boolean(),
    weeklyReport: z.boolean(),
  }),
  preferences: z.object({
    theme: z.enum(["light", "dark", "system"]),
    language: z.string().default("en"),
    timezone: z.string().default("UTC"),
    startOfWeek: z.enum(["sunday", "monday"]),
    dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
  }),
  privacy: z.object({
    profileVisibility: z.enum(["public", "private"]),
    shareProgress: z.boolean(),
    allowAnalytics: z.boolean(),
  }),
});

export async function saveUserSettings(formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const settingsJson = formData.get("settings") as string;
  if (!settingsJson) {
    return { error: "Settings data is required" };
  }

  let settingsData;
  try {
    settingsData = JSON.parse(settingsJson);
  } catch (error) {
    return { error: "Invalid settings data format" };
  }

  // Validate input
  const validatedFields = userSettingsSchema.safeParse(settingsData);
  if (!validatedFields.success) {
    return {
      error:
        "Invalid settings: " +
        validatedFields.error.issues.map((e) => e.message).join(", "),
    };
  }

  const supabase = await createClient();

  // Check if user settings already exist
  const { data: existingSettings } = await supabase
    .from("user_settings")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existingSettings) {
    // Update existing settings
    const { error } = await supabase
      .from("user_settings")
      .update({
        settings: validatedFields.data,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      return { error: error.message };
    }
  } else {
    // Create new settings
    const { error } = await supabase.from("user_settings").insert({
      user_id: user.id,
      settings: validatedFields.data,
    });

    if (error) {
      return { error: error.message };
    }
  }

  revalidatePath("/settings");
  return { success: "Settings saved successfully!" };
}

export async function getUserSettings() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("settings")
    .eq("user_id", user.id)
    .single();

  if (error) {
    // Return default settings if none exist
    return getDefaultSettings();
  }

  return settings?.settings || getDefaultSettings();
}

export async function resetUserSettings() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const defaultSettings = getDefaultSettings();
  const formData = new FormData();
  formData.append("settings", JSON.stringify(defaultSettings));

  return await saveUserSettings(formData);
}

export async function exportUserData() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Get all user data
  const [
    { data: profile },
    { data: goals },
    { data: habits },
    { data: habitLogs },
    { data: practices },
    { data: practiceSessions },
    { data: settings },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    supabase.from("goals").select("*").eq("user_id", user.id),
    supabase.from("habits").select("*").eq("user_id", user.id),
    supabase.from("habit_logs").select("*").eq("user_id", user.id),
    supabase.from("practices").select("*").eq("user_id", user.id),
    supabase.from("practice_sessions").select("*").eq("user_id", user.id),
    supabase.from("user_settings").select("*").eq("user_id", user.id).single(),
  ]);

  const exportData = {
    user: {
      id: user.id,
      email: user.email,
      exportedAt: new Date().toISOString(),
    },
    profile,
    goals: goals || [],
    habits: habits || [],
    habitLogs: habitLogs || [],
    practices: practices || [],
    practiceSessions: practiceSessions || [],
    settings: settings?.settings || getDefaultSettings(),
  };

  return { success: "Data export ready", data: exportData };
}

export async function deleteUserAccount() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Delete user data in the correct order (respecting foreign key constraints)
  const deleteOperations = [
    supabase.from("habit_logs").delete().eq("user_id", user.id),
    supabase.from("practice_sessions").delete().eq("user_id", user.id),
    supabase.from("habits").delete().eq("user_id", user.id),
    supabase.from("practices").delete().eq("user_id", user.id),
    supabase.from("goals").delete().eq("user_id", user.id),
    supabase.from("user_settings").delete().eq("user_id", user.id),
    supabase.from("profiles").delete().eq("user_id", user.id),
  ];

  for (const operation of deleteOperations) {
    const { error } = await operation;
    if (error) {
      console.error("Error deleting user data:", error);
      return { error: "Failed to delete some user data" };
    }
  }

  // Delete the auth user (this should be done last)
  const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
  if (authError) {
    console.error("Error deleting auth user:", authError);
    return { error: "Failed to delete user account" };
  }

  return { success: "Account deleted successfully" };
}

function getDefaultSettings() {
  return {
    notifications: {
      email: true,
      push: true,
      goalReminders: true,
      habitReminders: true,
      achievements: true,
      weeklyReport: false,
    },
    preferences: {
      theme: "system" as const,
      language: "en",
      timezone: "UTC",
      startOfWeek: "monday" as const,
      dateFormat: "MM/DD/YYYY" as const,
    },
    privacy: {
      profileVisibility: "private" as const,
      shareProgress: false,
      allowAnalytics: true,
    },
  };
}
