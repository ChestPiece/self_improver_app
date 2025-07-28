"use server";

import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  settings: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      daily_reminders?: boolean;
      weekly_reports?: boolean;
    };
    theme?: string;
    timezone?: string;
    onboarding_completed?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

export async function getUserSettings(
  userId: string
): Promise<UserSettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user settings:", error);
    return null;
  }

  return data;
}

export async function getUserWithProfile(userId: string) {
  const [user, profile, settings] = await Promise.all([
    getCurrentUser(),
    getUserProfile(userId),
    getUserSettings(userId),
  ]);

  return {
    user,
    profile,
    settings,
  };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, "full_name" | "avatar_url">>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateUserSettings(
  userId: string,
  settings: UserSettings["settings"]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("user_settings")
    .update({ settings })
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating user settings:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getUserNotifications(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data || [];
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }

  return true;
}

export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }

  return count || 0;
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type:
    | "goal_reminder"
    | "habit_reminder"
    | "achievement"
    | "weekly_report"
    | "system"
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
  });

  if (error) {
    console.error("Error creating notification:", error);
    return false;
  }

  return true;
}
