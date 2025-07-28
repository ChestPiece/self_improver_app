import { redirect } from "next/navigation";
import { getCurrentUser, getUserProfile } from "@/lib/user/service";
import SidebarLayout from "@/components/layouts/sidebar-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile for complete user data
  const profile = await getUserProfile(user.id);

  // Combine user data with profile
  const userWithProfile = {
    ...user,
    full_name: profile?.full_name || user.user_metadata?.full_name || null,
    avatar_url: profile?.avatar_url || null,
    subscription_tier: profile?.subscription_tier || "free",
  };

  return <SidebarLayout user={userWithProfile}>{children}</SidebarLayout>;
}
