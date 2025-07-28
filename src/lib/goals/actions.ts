"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Goal validation schema
const goalSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  category: z.enum([
    "health",
    "fitness",
    "mental",
    "career",
    "personal",
    "finance",
    "education",
    "relationships",
  ]),
  target_value: z.number().positive("Target value must be positive").optional(),
  target_date: z.string().optional(),
  status: z
    .enum(["active", "completed", "paused", "cancelled"])
    .default("active"),
});

export async function createGoal(formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    target_value: formData.get("target_value")
      ? Number(formData.get("target_value"))
      : null,
    target_date: (formData.get("target_date") as string) || null,
    status: "active" as const,
  };

  // Validate input
  const validatedFields = goalSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error:
        "Invalid input: " +
        validatedFields.error.issues.map((e) => e.message).join(", "),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("goals").insert({
    ...validatedFields.data,
    user_id: user.id,
    current_value: 0,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: "Goal created successfully!" };
}

export async function updateGoal(goalId: string, formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    category: formData.get("category") as string,
    target_value: formData.get("target_value")
      ? Number(formData.get("target_value"))
      : null,
    target_date: (formData.get("target_date") as string) || null,
    status: formData.get("status") as string,
  };

  // Validate input
  const validatedFields = goalSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      error:
        "Invalid input: " +
        validatedFields.error.issues.map((e) => e.message).join(", "),
    };
  }

  const supabase = await createClient();

  // Check if goal belongs to user
  const { data: existingGoal } = await supabase
    .from("goals")
    .select("user_id")
    .eq("id", goalId)
    .single();

  if (!existingGoal || existingGoal.user_id !== user.id) {
    return { error: "Goal not found or access denied" };
  }

  const { error } = await supabase
    .from("goals")
    .update(validatedFields.data)
    .eq("id", goalId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: "Goal updated successfully!" };
}

export async function updateGoalProgress(goalId: string, currentValue: number) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Check if goal belongs to user and get target value
  const { data: existingGoal } = await supabase
    .from("goals")
    .select("user_id, target_value, status")
    .eq("id", goalId)
    .single();

  if (!existingGoal || existingGoal.user_id !== user.id) {
    return { error: "Goal not found or access denied" };
  }

  // Auto-complete goal if target reached
  let newStatus = existingGoal.status;
  if (
    existingGoal.target_value &&
    currentValue >= existingGoal.target_value &&
    existingGoal.status === "active"
  ) {
    newStatus = "completed";
  }

  const { error } = await supabase
    .from("goals")
    .update({
      current_value: currentValue,
      status: newStatus,
    })
    .eq("id", goalId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: "Progress updated successfully!" };
}

export async function updateGoalStatus(
  goalId: string,
  status: "active" | "paused" | "completed" | "cancelled"
) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Check if goal belongs to user
  const { data: existingGoal } = await supabase
    .from("goals")
    .select("user_id")
    .eq("id", goalId)
    .single();

  if (!existingGoal || existingGoal.user_id !== user.id) {
    return { error: "Goal not found or access denied" };
  }

  const { error } = await supabase
    .from("goals")
    .update({ status })
    .eq("id", goalId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");

  const statusMessages = {
    active: "Goal resumed successfully!",
    paused: "Goal paused successfully!",
    completed: "Goal completed successfully!",
    cancelled: "Goal cancelled successfully!",
  };

  return { success: statusMessages[status] };
}

export async function deleteGoal(goalId: string) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Check if goal belongs to user
  const { data: existingGoal } = await supabase
    .from("goals")
    .select("user_id")
    .eq("id", goalId)
    .single();

  if (!existingGoal || existingGoal.user_id !== user.id) {
    return { error: "Goal not found or access denied" };
  }

  const { error } = await supabase.from("goals").delete().eq("id", goalId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return { success: "Goal deleted successfully!" };
}

export async function getUserGoals(status?: string) {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  let query = supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: goals, error } = await query;

  if (error) {
    console.error("Error fetching goals:", error);
    return null;
  }

  return goals;
}

export async function getGoalById(goalId: string) {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data: goal, error } = await supabase
    .from("goals")
    .select("*")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching goal:", error);
    return null;
  }

  return goal;
}
