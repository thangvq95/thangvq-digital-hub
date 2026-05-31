"use client";

import { useEffect, useState, useCallback, useRef, ComponentPropsWithoutRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy, Heart, BookOpen, ExternalLink, Calendar, Layers, CheckCircle } from "lucide-react";
import { fetchLearning, patchLearning, fetchSubtopics } from "@/lib/api/learning-client";
import type { Learning, LearningSubtopic } from "@/lib/api/learning-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

const PreWithCopy = ({
  children,
  ...props
}: ComponentPropsWithoutRef<"pre">) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (preRef.current) {
      navigator.clipboard.writeText(preRef.current.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-lg border border-white/10 bg-[#1e1e1e]/80 text-white/50 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 hover:text-white z-10 backdrop-blur-sm cursor-pointer"
        title="Copy code"
      >
        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
      </button>
      <pre
        ref={preRef}
        {...props}
        className="bg-black/40 rounded-xl p-4 overflow-x-auto text-sm m-0 border border-white/5 scrollbar-thin"
      >
        {children}
      </pre>
    </div>
  );
};

export default function LearningDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const learningId = params.id;

  const [learning, setLearning] = useState<Learning | null>(null);
  const [subtopics, setSubtopics] = useState<LearningSubtopic[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLearned, setIsLearned] = useState<boolean>(false);

  // Fetch subtopics list
  useEffect(() => {
    fetchSubtopics().then(setSubtopics).catch(console.error);
  }, []);

  // Fetch learning data
  useEffect(() => {
    if (!learningId) return;
    fetchLearning(learningId)
      .then((data) => {
        setLearning(data);
        setIsFavorite(data.is_favorite);
        setIsLearned(data.is_learned);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [learningId]);

  // Polling for AI summary completion if it's currently analyzing
  useEffect(() => {
    if (!learning || learning.analyze_status !== "analyzing") return;

    const interval = setInterval(async () => {
      try {
        const updated = await fetchLearning(learningId);
        setLearning(updated);
        if (updated.analyze_status !== "analyzing") {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [learning, learningId]);

  const handleToggleFavorite = useCallback(async () => {
    if (!learning) return;
    const targetVal = !isFavorite;
    setIsFavorite(targetVal);
    try {
      const updated = await patchLearning(learning.id, { is_favorite: targetVal });
      setLearning(updated);
    } catch (err) {
      console.error(err);
      setIsFavorite(!targetVal);
    }
  }, [learning, isFavorite]);

  const handleToggleLearned = useCallback(async () => {
    if (!learning) return;
    const targetVal = !isLearned;
    setIsLearned(targetVal);
    try {
      const updated = await patchLearning(learning.id, { is_learned: targetVal });
      setLearning(updated);
    } catch (err) {
      console.error(err);
      setIsLearned(!targetVal);
    }
  }, [learning, isLearned]);

  const handleSubtopicChange = useCallback(async (subtopicId: number | null) => {
    if (!learning) return;
    try {
      const updated = await patchLearning(learning.id, { subtopic_id: subtopicId });
      setLearning(updated);
    } catch (err) {
      console.error("Failed to update subtopic:", err);
    }
  }, [learning]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-96 rounded-2xl animate-pulse" style={{ background: "var(--bg-card)" }} />
      </main>
    );
  }

  if (!learning) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p style={{ color: "var(--text-muted)" }}>Learning content not found.</p>
        <Link href="/learning" className="mt-4 inline-block text-sm text-indigo-400 hover:underline">
          ← Return to Learning Hub
        </Link>
      </main>
    );
  }

  const topicColor = learning.topic.color || "#6366f1";
  const imageUrl = learning.image_path ? `${API_URL}/uploads/${learning.image_path}` : null;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <Link
        href="/learning"
        className="text-sm mb-6 inline-flex items-center gap-1 hover:underline cursor-pointer"
        style={{ color: "var(--accent)" }}
      >
        ← Back to Hub
      </Link>

      {/* Grid Layout: image + details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Thumbnail Screenshot */}
        <div className="md:col-span-5 space-y-4">
          {imageUrl ? (
            <div 
              className="rounded-2xl border overflow-hidden bg-black/40 shadow-xl"
              style={{ borderColor: "var(--border)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={learning.title}
                className="w-full h-auto object-contain max-h-[500px]"
              />
            </div>
          ) : (
            <div 
              className="rounded-2xl border p-12 flex flex-col items-center justify-center text-center aspect-square bg-black/20"
              style={{ borderColor: "var(--border)" }}
            >
              <BookOpen size={48} className="text-neutral-600 mb-3" />
              <p className="text-sm font-semibold text-neutral-400">No Image Uploaded</p>
              <p className="text-xs text-neutral-500 mt-1">This learning consists of text content or a web URL.</p>
            </div>
          )}
        </div>

        {/* Right Side: metadata, details, & AI Summary */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Header Card */}
          <div 
            className="p-5 sm:p-6 rounded-2xl glass space-y-4"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            {/* Topic & subtopic badges */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border"
                  style={{
                    background: `${topicColor}15`,
                    color: topicColor,
                    borderColor: `${topicColor}30`,
                  }}
                >
                  {learning.topic.display_name}
                </span>

                {learning.subtopic && (
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {learning.subtopic.display_name}
                  </span>
                )}
              </div>

              {/* Status and Favorite Toggles */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className="p-2 rounded-lg transition-colors cursor-pointer border hover:bg-white/5"
                  style={
                    isFavorite
                      ? { color: "#ec4899", background: "rgba(236, 72, 153, 0.1)", borderColor: "#ec4899" }
                      : { color: "var(--text-muted)", borderColor: "var(--border)" }
                  }
                  title={isFavorite ? "Saved to favorites" : "Favorite"}
                >
                  <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                </button>

                <button
                  onClick={handleToggleLearned}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 border"
                  style={
                    isLearned
                      ? { background: "rgba(16, 185, 129, 0.15)", borderColor: "#10B981", color: "#10B981" }
                      : { background: "transparent", borderColor: "var(--border)", color: "var(--text-muted)" }
                  }
                >
                  <CheckCircle size={14} />
                  <span>{isLearned ? "Learned" : "To Learn"}</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {learning.title}
            </h1>

            {/* Metadata (date + link) */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 border-t border-white/5 pt-3">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-neutral-500" />
                <span>Captured: {formatDate(learning.created_at)}</span>
              </div>
              
              {learning.source_url && (
                <a
                  href={learning.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  <ExternalLink size={13} />
                  <span>Open Source Link</span>
                </a>
              )}
            </div>

            {/* Subtopic Classification Selector */}
            <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-xs">
              <Layers size={13} className="text-neutral-500" />
              <span className="text-neutral-400">Classify Subtopic:</span>
              <select
                value={learning.subtopic?.id ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleSubtopicChange(val ? Number(val) : null);
                }}
                className="px-2 py-1 rounded bg-black/40 outline-none border border-neutral-700 text-xs text-neutral-300 cursor-pointer hover:bg-black/50 transition-colors"
                style={{ borderColor: "var(--border)" }}
              >
                <option value="">Unclassified / Other</option>
                {subtopics.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Summary Markdown Section */}
          <div 
            className="p-6 rounded-2xl glass space-y-4"
            style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
          >
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <span>✨ AI Analysis Summary</span>
              {learning.analyze_status === "analyzing" && (
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
                  Analyzing...
                </span>
              )}
            </h2>

            {learning.analyze_status === "failed" ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                AI summary analysis failed. Ensure that NINE_ROUTER_API_KEY is configured correctly.
              </div>
            ) : learning.summary ? (
              <div
                className="max-w-none text-sm text-neutral-300 leading-relaxed
                           prose prose-invert prose-sm
                           [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-white
                           [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-neutral-300
                           [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1.5
                           [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1.5
                           [&_li]:text-neutral-300
                           [&_strong]:font-semibold [&_strong]:text-white
                           [&_code]:text-xs [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-white/10 [&_code]:text-indigo-300
                           [&_a]:text-indigo-400 hover:[&_a]:underline"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    pre: PreWithCopy,
                  }}
                >
                  {learning.summary}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
                <p className="text-xs text-neutral-500">Retrieving AI summary content...</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
