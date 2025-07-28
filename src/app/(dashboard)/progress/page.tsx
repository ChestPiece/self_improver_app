import { getUser } from "@/lib/auth/actions";
import { getUserGoals } from "@/lib/goals/actions";
import { getUserHabits } from "@/lib/habits/actions";
import { getPracticeSessions } from "@/lib/practices/actions";
import { redirect } from "next/navigation";
import ProgressPageClient from "@/components/progress/progress-page-client";

export default async function ProgressPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user data for analytics
  const goals = (await getUserGoals()) || [];
  const habits = (await getUserHabits()) || [];
  const practiceSessions = (await getPracticeSessions()) || [];

  return (
    <ProgressPageClient
      user={user}
      goals={goals}
      habits={habits}
      practiceSessions={practiceSessions}
    />
  );
}
