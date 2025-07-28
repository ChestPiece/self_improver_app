import { getUser } from "@/lib/auth/actions";
import { getUserHabits, getHabitLogs } from "@/lib/habits/actions";
import { redirect } from "next/navigation";
import HabitsPageClient from "@/components/habits/habits-page-client";
import { HabitsErrorBoundary } from "@/components/error-boundaries/feature-error-boundary";

export default async function HabitsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch real habits and logs from database
  const habits = (await getUserHabits()) || [];
  const habitLogs = (await getHabitLogs()) || [];

  return (
    <HabitsErrorBoundary>
      <HabitsPageClient user={user} habits={habits} habitLogs={habitLogs} />
    </HabitsErrorBoundary>
  );
}
