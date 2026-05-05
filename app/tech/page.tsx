import type { Metadata } from "next";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import FilterBar from "@/components/dashboard/FilterBar";
import StatsBar from "@/components/dashboard/StatsBar";
import RepoGrid from "@/components/dashboard/RepoGrid";

export const metadata: Metadata = {
  title: "TechTrend Dashboard",
  description:
    "Explore trending GitHub repositories classified by domain — AI, Mobile, DevOps, and more. Updated daily, weekly, and monthly.",
};

// Dashboard uses RSC for initial data fetch, Client Components only for interactive filters
export default async function TechTrendPage() {
  return (
    <main id="techtrend-main" className="min-h-screen">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <FilterBar />
        <StatsBar />
        <RepoGrid />
      </div>
    </main>
  );
}
