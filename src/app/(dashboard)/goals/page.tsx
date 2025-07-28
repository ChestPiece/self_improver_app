import { getUser } from "@/lib/auth/actions";
import { getUserGoals } from "@/lib/goals/actions";
import { redirect } from "next/navigation";
import GoalsPageClient from "@/components/goals/goals-page-client";
import { GoalsErrorBoundary } from "@/components/error-boundaries/feature-error-boundary";

interface GoalsPageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function GoalsPage({ searchParams }: GoalsPageProps) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const goals = (await getUserGoals(params.status)) || [];

  return (
    <GoalsErrorBoundary>
      <GoalsPageClient
        user={user}
        goals={goals}
        initialFilters={{
          category: params.category || "all",
          status: params.status || "all",
          search: params.search || "",
        }}
      />
    </GoalsErrorBoundary>
  );
}
