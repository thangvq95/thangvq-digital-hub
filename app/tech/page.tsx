import type { Metadata } from "next";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RepoGrid from "@/components/dashboard/RepoGrid";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "TechTrend Dashboard",
  description:
    "Weekly trending GitHub repositories, curated by Hermes. Favorite, archive, and AI-analyze repos.",
};

export default async function TechTrendPage() {
  return (
    <main id="techtrend-main" className="min-h-screen">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense>
          <RepoGrid />
        </Suspense>
      </div>
    </main>
  );
}
