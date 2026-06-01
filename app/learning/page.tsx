import type { Metadata } from "next";
import LearningHeader from "@/components/learning/LearningHeader";
import LearningGrid from "@/components/learning/LearningGrid";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Learning Hub — ThangVQ",
  description:
    "Curated Flutter & Android learning content. Track your progress, favorite the best, never fall behind.",
};

export default async function LearningPage() {
  return (
    <main id="learning-main" className="min-h-screen">
      <Suspense fallback={<div className="h-20" />}>
        <LearningHeader />
      </Suspense>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense>
          <LearningGrid />
        </Suspense>
      </div>
    </main>
  );
}
