"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { fetchLearnings } from "@/lib/api/learning-client";
import type { Learning } from "@/lib/api/learning-types";
import LearningCard from "./LearningCard";

const PAGE_SIZE = 20;

export const LearningGrid: React.FC = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "to_learn";
  const topic = searchParams.get("topic") ?? "";
  const subtopic = searchParams.get("subtopic") ?? "";

  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadLearnings = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);
      try {
        const queryTopic = topic === "all" ? "" : topic;
        const res = await fetchLearnings({
          tab,
          topic: queryTopic || undefined,
          subtopic: subtopic || undefined,
          page: pageNum,
          limit: PAGE_SIZE,
        });

        if (append) {
          setLearnings((prev) => [...prev, ...res.data]);
        } else {
          setLearnings(res.data);
        }
        setHasMore(pageNum * PAGE_SIZE < res.meta.total);
      } catch (err) {
        console.error("Failed to load learnings:", err);
      } finally {
        setLoading(false);
      }
    },
    [tab, topic, subtopic],
  );

  // Trigger loading list when filter changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    loadLearnings(1, false);
  }, [tab, topic, subtopic, loadLearnings]);

  const handleLoadMore = () => {
    if (loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadLearnings(nextPage, true);
  };

  const handleRefresh = () => {
    setPage(1);
    loadLearnings(1, false);
  };

  if (loading && learnings.length === 0) {
    return (
      <div
        id="learning-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-72 rounded-2xl animate-pulse"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div
        id="learning-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {learnings.length === 0 ? (
          <div
            className="col-span-full flex flex-col items-center justify-center py-24 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            <p className="text-4xl mb-3">🧠</p>
            <p
              className="text-lg font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              {tab === "favorites"
                ? "No favorite learnings yet"
                : tab === "learned"
                  ? "No learned items yet"
                  : "No learnings found"}
            </p>
            <p className="text-xs mt-1 text-neutral-500 max-w-sm">
              {tab === "favorites"
                ? "Toggle the heart icon on cards to add learnings to favorites."
                : tab === "learned"
                  ? "Mark items as 'Learned' to move them here and track your progress."
                  : "Click '+ Add Learning' or wait for the scraper cronjob to find interesting content."}
            </p>
          </div>
        ) : (
          learnings.map((item) => (
            <LearningCard
              key={item.id}
              learning={item}
              onUpdate={handleRefresh}
            />
          ))
        )}
      </div>

      {hasMore && learnings.length > 0 && (
        <div className="flex justify-center mt-10">
          <button
            id="load-more-btn"
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2.5 rounded-full text-xs font-semibold glass transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
            style={{
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
            }}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};
export default LearningGrid;
