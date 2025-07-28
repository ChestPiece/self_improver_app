import { getUser } from "@/lib/auth/actions";
import { getUserSettings } from "@/lib/settings/actions";
import { redirect } from "next/navigation";
import SettingsPageClient from "@/components/settings/settings-page-client";

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const userSettings = await getUserSettings();

  return (
    <SettingsPageClient user={user} initialSettings={userSettings} />
  );
}
