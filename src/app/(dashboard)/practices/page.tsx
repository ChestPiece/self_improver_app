import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import PracticesPageClient from "@/components/practices/practices-page-client";
import { PracticesErrorBoundary } from "@/components/error-boundaries/feature-error-boundary";

interface PracticesPageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    search?: string;
  }>;
}

export default async function PracticesPage({
  searchParams,
}: PracticesPageProps) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;

  return (
    <PracticesErrorBoundary>
      <PracticesPageClient
        user={user}
        initialFilters={{
          category: params.category || "all",
          difficulty: params.difficulty || "all",
          search: params.search || "",
        }}
      />
    </PracticesErrorBoundary>
  );
}
