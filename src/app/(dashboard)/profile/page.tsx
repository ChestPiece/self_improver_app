import { getCurrentUser, getUserProfile } from "@/lib/user/service";
import { getUserGoals } from "@/lib/goals/actions";
import { redirect } from "next/navigation";
import ProfilePageClient from "@/components/profile/profile-page-client";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile and goals for statistics using optimized service
  const [profile, goals] = await Promise.all([
    getUserProfile(user.id),
    getUserGoals(),
  ]);

  return (
    <ProfilePageClient user={user} profile={profile} goals={goals || []} />
  );
}
