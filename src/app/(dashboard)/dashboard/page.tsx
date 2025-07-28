import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/actions";
import { getUserGoals } from "@/lib/goals/actions";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile and goals from database
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const goals = (await getUserGoals()) || [];

  return <DashboardContent user={user} profile={profile} goals={goals} />;
}
