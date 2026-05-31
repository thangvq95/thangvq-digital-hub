"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Star, CheckCircle, BookOpen, Layers } from "lucide-react";
import { fetchSubtopics } from "@/lib/api/learning-client";
import type { LearningSubtopic } from "@/lib/api/learning-types";
import AddLearningDialog from "./AddLearningDialog";

const TABS = [
  { id: "tab-to-learn", label: "To Learn", value: "to_learn", icon: BookOpen },
  { id: "tab-learned", label: "Learned", value: "learned", icon: CheckCircle },
  { id: "tab-favorites", label: "Favorites", value: "favorites", icon: Star },
] as const;

const TOPICS = [
  { name: "all", displayName: "All Topics", color: "var(--accent)" },
  { name: "flutter", displayName: "Flutter", color: "#027DFD" },
  { name: "android", displayName: "Android", color: "#3DDC84" },
] as const;

export const LearningHeader: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") ?? "to_learn";
  const currentTopic = searchParams.get("topic") ?? "all";
  const currentSubtopic = searchParams.get("subtopic") ?? "";

  const [subtopics, setSubtopics] = useState<LearningSubtopic[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchSubtopics().then(setSubtopics).catch(console.error);
  }, []);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === "" || val === "all") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset subtopic if topic changes
    if ("topic" in newParams) {
      params.delete("subtopic");
    }

    const searchStr = params.toString();
    router.push(`/learning${searchStr ? `?${searchStr}` : ""}`);
  };

  const handleAddSuccess = () => {
    // Refresh page to show new item
    router.refresh();
  };

  return (
    <header
      id="learning-header"
      className="sticky top-0 z-40 glass border-b"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col py-4 gap-4">
          {/* Main Top Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Logo / Title */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link
                href="/learning"
                id="learning-home-link"
                className="flex items-center gap-2 group"
              >
                <span
                  className="text-lg sm:text-xl font-bold tracking-tight group-hover:opacity-80 transition-opacity"
                  style={{ color: "var(--text-primary)" }}
                >
                  Learning<span className="gradient-text">Hub</span>
                </span>
              </Link>
              <span
                className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(99, 102, 241, 0.15)",
                  color: "#818cf8",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                }}
              >
                Beta
              </span>
            </div>

            {/* Navigation Tabs */}
            <div
              className="flex gap-1 p-1 rounded-xl bg-black/30 border border-white/5"
              style={{ background: "var(--bg-card)" }}
            >
              {TABS.map((tab) => {
                const TabIcon = tab.icon;
                const active = currentTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    id={tab.id}
                    onClick={() => updateFilters({ tab: tab.value })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap"
                    style={
                      active
                        ? { background: "var(--accent)", color: "#fff" }
                        : { color: "var(--text-muted)" }
                    }
                  >
                    <TabIcon
                      size={12}
                      className={active ? "text-white" : "text-neutral-500"}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDialogOpen(true)}
                className="text-xs sm:text-sm px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                + Add Learning
              </button>

              <Link
                href="/tech"
                id="learning-techtrend-link"
                className="hidden md:inline text-xs font-medium hover:underline text-neutral-400 hover:text-white"
              >
                TechTrend
              </Link>
              <Link
                href="/"
                id="learning-portfolio-link"
                className="hidden md:inline text-xs font-medium hover:underline text-neutral-400 hover:text-white"
              >
                Portfolio
              </Link>
            </div>
          </div>

          {/* Filters Row: Topic Pills + Subtopic Chips */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            {/* Topics */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex-shrink-0 mr-1">
                Topic:
              </span>
              {TOPICS.map((topic) => {
                const active = currentTopic === topic.name;
                return (
                  <button
                    key={topic.name}
                    onClick={() => updateFilters({ topic: topic.name })}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border"
                    style={
                      active
                        ? {
                            background:
                              topic.color === "var(--accent)"
                                ? "var(--accent)"
                                : `${topic.color}22`,
                            borderColor:
                              topic.color === "var(--accent)"
                                ? "var(--accent)"
                                : topic.color,
                            color:
                              topic.color === "var(--accent)"
                                ? "#fff"
                                : topic.color,
                          }
                        : {
                            background: "transparent",
                            borderColor: "var(--border)",
                            color: "var(--text-muted)",
                          }
                    }
                  >
                    {topic.displayName}
                  </button>
                );
              })}
            </div>

            {/* Subtopics — only show if topics are loaded and subtopics exist */}
            {subtopics.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex-shrink-0 mr-1 flex items-center gap-1">
                  <Layers size={10} /> Subtopic:
                </span>
                <button
                  onClick={() => updateFilters({ subtopic: "" })}
                  className="px-2.5 py-0.5 rounded-md text-[11px] transition-all cursor-pointer whitespace-nowrap border"
                  style={
                    !currentSubtopic
                      ? {
                          background: "var(--accent)",
                          borderColor: "var(--accent)",
                          color: "#fff",
                        }
                      : {
                          background: "transparent",
                          borderColor: "var(--border)",
                          color: "var(--text-muted)",
                        }
                  }
                >
                  All
                </button>
                {subtopics.map((sub) => {
                  const active = currentSubtopic === sub.name;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => updateFilters({ subtopic: sub.name })}
                      className="px-2.5 py-0.5 rounded-md text-[11px] transition-all cursor-pointer whitespace-nowrap border"
                      style={
                        active
                          ? {
                              background: "var(--accent)",
                              borderColor: "var(--accent)",
                              color: "#fff",
                            }
                          : {
                              background: "transparent",
                              borderColor: "var(--border)",
                              color: "var(--text-muted)",
                            }
                      }
                    >
                      {sub.display_name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddLearningDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </header>
  );
};

export default LearningHeader;
