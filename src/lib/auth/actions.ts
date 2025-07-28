"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Validate input
  const validatedFields = loginSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: "Invalid input. Please check your email and password." };
  }

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  // Return success instead of redirecting immediately
  // This allows the client to handle the redirect after the session is established
  return { success: true };
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    fullName: formData.get("fullName") as string,
  };

  // Validate input
  const validatedFields = registerSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error:
        "Invalid fields: " +
        validatedFields.error.issues.map((e) => e.message).join(", "),
    };
  }

  const { email, password, fullName } = validatedFields.data;

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create user account" };
  }

  try {
    // Create user profile
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: authData.user.id,
      full_name: fullName,
      subscription_tier: "free",
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
    }

    // Create default user settings
    const { error: settingsError } = await supabase
      .from("user_settings")
      .insert({
        user_id: authData.user.id,
        settings: {
          notifications: {
            email: true,
            push: true,
            daily_reminders: true,
            weekly_reports: true,
          },
          theme: "dark",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          onboarding_completed: false,
        },
      });

    if (settingsError) {
      console.error("Settings creation error:", settingsError);
    }

    // Create welcome notification
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: authData.user.id,
        title: "Welcome to Self Improver!",
        message: `Hi ${fullName}! Welcome to your personal development journey. Start by setting your first goal or creating a habit.`,
        type: "system",
      });

    if (notificationError) {
      console.error("Welcome notification error:", notificationError);
    }

    // Send welcome email
    try {
      const { sendWelcomeEmail } = await import("@/lib/email/service");
      await sendWelcomeEmail(email, fullName);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }
  } catch (setupError) {
    console.error("User setup error:", setupError);
    // Don't fail registration if profile setup fails
  }

  return {
    success:
      "Account created successfully! Please check your email to verify your account.",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}
