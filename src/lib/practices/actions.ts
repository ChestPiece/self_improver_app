"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Practice validation schema
const practiceSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  category: z.enum([
    "mental_health",
    "physical_health",
    "personal_development",
  ]),
  duration: z.number().positive("Duration must be positive"),
  difficulty_level: z.enum(["beginner", "intermediate", "advanced"]),
  instructions: z.array(z.string()).optional(),
  is_public: z.boolean().default(false),
});

// Practice session validation schema
const practiceSessionSchema = z.object({
  practice_id: z.string().min(1, "Practice ID is required"),
  duration: z.number().positive("Duration must be positive"),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
  completed_at: z.string().datetime().optional(),
});

export async function createPractice(formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const instructions = formData.get("instructions") as string;
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    duration: formData.get("duration") ? Number(formData.get("duration")) : 15,
    difficulty_level: formData.get("difficulty_level") as string,
    instructions: instructions ? JSON.parse(instructions) : [],
    is_public: formData.get("is_public") === "true",
  };

  // Validate input
  const validatedFields = practiceSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error:
        "Invalid input: " +
        validatedFields.error.issues.map((e) => e.message).join(", "),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("practices").insert({
    ...validatedFields.data,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/practices");
  revalidatePath("/dashboard");
  return { success: "Practice created successfully!" };
}

export async function updatePractice(id: string, formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const instructions = formData.get("instructions") as string;
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    duration: formData.get("duration") ? Number(formData.get("duration")) : 15,
    difficulty_level: formData.get("difficulty_level") as string,
    instructions: instructions ? JSON.parse(instructions) : [],
    is_public: formData.get("is_public") === "true",
  };

  // Validate input
  const validatedFields = practiceSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error:
        "Invalid input: " +
        validatedFields.error.issues.map((e) => e.message).join(", "),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("practices")
    .update({
      ...validatedFields.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/practices");
  revalidatePath("/dashboard");
  return { success: "Practice updated successfully!" };
}

export async function deletePractice(id: string) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("practices")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/practices");
  revalidatePath("/dashboard");
  return { success: "Practice deleted successfully!" };
}

export async function createPracticeSession(formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const data = {
    practice_id: formData.get("practice_id") as string,
    duration: formData.get("duration") ? Number(formData.get("duration")) : 15,
    notes: (formData.get("notes") as string) || null,
    completed_at:
      (formData.get("completed_at") as string) || new Date().toISOString(),
  };

  // Validate input
  const validatedFields = practiceSessionSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error:
        "Invalid input: " +
        validatedFields.error.issues.map((e) => e.message).join(", "),
    };
  }

  const supabase = await createClient();

  // Verify practice belongs to user or is public
  const { data: practice } = await supabase
    .from("practices")
    .select("*")
    .eq("id", validatedFields.data.practice_id)
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .single();

  if (!practice) {
    return { error: "Practice not found or access denied" };
  }

  // Insert practice session
  const { error: sessionError } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: user.id,
      practice_id: validatedFields.data.practice_id,
      duration: validatedFields.data.duration,
      notes: validatedFields.data.notes,
      completed_at: validatedFields.data.completed_at,
    });

  if (sessionError) {
    return { error: sessionError.message };
  }

  revalidatePath("/practices");
  revalidatePath("/progress");
  revalidatePath("/dashboard");
  return { success: "Practice session completed!" };
}

export async function getUserPractices(includePublic = true) {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  let query = supabase
    .from("practices")
    .select("*")
    .order("created_at", { ascending: false });

  if (includePublic) {
    query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
  } else {
    query = query.eq("user_id", user.id);
  }

  const { data: practices, error } = await query;

  if (error) {
    console.error("Error fetching practices:", error);
    return null;
  }

  return practices;
}

export async function getPracticeSessions(practiceId?: string, limit = 100) {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  let query = supabase
    .from("practice_sessions")
    .select(
      `
      *,
      practices!inner(
        id,
        title,
        category
      )
    `
    )
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (practiceId) {
    query = query.eq("practice_id", practiceId);
  }

  const { data: sessions, error } = await query;

  if (error) {
    console.error("Error fetching practice sessions:", error);
    return null;
  }

  return sessions;
}

export async function getPracticeById(id: string) {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data: practice, error } = await supabase
    .from("practices")
    .select("*")
    .eq("id", id)
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .single();

  if (error) {
    console.error("Error fetching practice:", error);
    return null;
  }

  return practice;
}

export async function getUserPracticeStats() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();

  // Get total sessions and time
  const { data: sessions } = await supabase
    .from("practice_sessions")
    .select("duration, completed_at")
    .eq("user_id", user.id);

  if (!sessions) {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      sessionsThisWeek: 0,
      sessionsThisMonth: 0,
    };
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce(
    (sum, session) => sum + session.duration,
    0
  );
  const sessionsThisWeek = sessions.filter(
    (session) => new Date(session.completed_at) >= weekAgo
  ).length;
  const sessionsThisMonth = sessions.filter(
    (session) => new Date(session.completed_at) >= monthAgo
  ).length;

  return {
    totalSessions,
    totalMinutes,
    sessionsThisWeek,
    sessionsThisMonth,
  };
}
