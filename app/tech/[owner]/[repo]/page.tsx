"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { api } from "@/lib/api/client";
import type { Repository } from "@/lib/api/types";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Check, Copy } from "lucide-react";
import mermaid from "mermaid";
import { useRef } from "react";

const PreWithCopy = ({ children, ...props }: any) => {
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
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <pre ref={preRef} {...props} className="bg-black/30 rounded-xl p-4 overflow-x-auto text-sm m-0 border border-white/5">
        {children}
      </pre>
    </div>
  );
};

const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>('');
  const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    mermaid.render(id, chart).then((result) => {
      setSvg(result.svg);
    }).catch(e => {
       setSvg(`<div style="color:red">Error rendering diagram</div><pre>${chart}</pre>`);
    });
  }, [chart]);

  if (!svg) return <div className="animate-pulse h-32 bg-white/5 rounded-xl flex items-center justify-center text-xs text-white/50">Rendering diagram...</div>;
  return <div className="mermaid-diagram my-6 flex justify-center bg-black/20 p-6 rounded-xl" dangerouslySetInnerHTML={{ __html: svg }} />;
};

export default function RepoDetailPage() {
  const params = useParams<{ owner: string; repo: string }>();
  const fullName = `${params.owner}/${params.repo}`;

  const [repoData, setRepoData] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Initial fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    api.repos
      .detail(fullName)
      .then((data) => {
        setRepoData(data);
        if (!data.is_read) {
          api.repos.patch(fullName, { is_read: true }).then((updated) => {
            setRepoData((prev) => (prev ? { ...prev, is_read: true } : updated));
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fullName]);

  const analyzeStatus = repoData?.analyze_status;

  // ─── Poll for analysis completion ─────────────────────────────────────────
  useEffect(() => {
    if (analyzeStatus !== "analyzing") return;

    const interval = setInterval(async () => {
      try {
        const updated = await api.repos.detail(fullName);
        setRepoData(updated);
        if (updated.analyze_status !== "analyzing") {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 3000); // poll every 3 seconds

    return () => clearInterval(interval);
  }, [analyzeStatus, fullName]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleToggleFavorite = useCallback(async () => {
    if (!repoData) return;
    const updated = await api.repos.patch(fullName, {
      is_favorite: !repoData.is_favorite,
    });
    setRepoData(updated);
  }, [repoData, fullName]);

  const handleToggleArchive = useCallback(async () => {
    if (!repoData) return;
    const updated = await api.repos.patch(fullName, {
      is_archived: !repoData.is_archived,
    });
    setRepoData(updated);
  }, [repoData, fullName]);

  const handleMagicAnalyze = useCallback(async () => {
    if (!repoData) return;
    // Trigger async analysis — BE will process in background
    const updated = await api.repos.analyze(fullName);
    setRepoData(updated); // status will be 'analyzing', polling kicks in
  }, [repoData, fullName]);

  const handleViewChangelog = useCallback(async () => {
    if (!repoData) return;
    // Dismiss new release highlight
    if (repoData.has_new_release) {
      const updated = await api.repos.patch(fullName, {
        has_new_release: false,
      });
      setRepoData(updated);
    }
    // Open GitHub releases page
    window.open(`https://github.com/${fullName}/releases`, "_blank");
  }, [repoData, fullName]);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div
          className="h-64 rounded-2xl animate-pulse"
          style={{ background: "var(--bg-card)" }}
        />
      </main>
    );
  }

  if (!repoData) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <p style={{ color: "var(--text-muted)" }}>Repository not found.</p>
      </main>
    );
  }

  const isAnalyzing = repoData.analyze_status === "analyzing";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/tech"
        className="text-sm mb-6 inline-block cursor-pointer hover:underline"
        style={{ color: "var(--accent)" }}
      >
        ← Back to Dashboard
      </Link>

      {/* ─── Repo Info Card ──────────────────────────────────────────────── */}
      <div
        className="p-6 rounded-2xl glass mb-6"
        style={{ border: "1px solid var(--border)" }}
      >
        <div className="flex items-start justify-between mb-3">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {repoData.full_name}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleToggleFavorite}
              className="cursor-pointer transition-colors text-lg"
              style={{
                color: repoData.is_favorite
                  ? "hsl(0, 72%, 51%)"
                  : "var(--text-muted)",
              }}
              aria-label={
                repoData.is_favorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
            >
              {repoData.is_favorite ? "♥" : "♡"}
            </button>
            <button
              onClick={handleToggleArchive}
              className="cursor-pointer transition-colors text-lg"
              style={{
                color: repoData.is_archived
                  ? "var(--accent)"
                  : "var(--text-muted)",
              }}
              aria-label={repoData.is_archived ? "Unarchive" : "Archive"}
            >
              📦
            </button>
          </div>
        </div>

        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
          {repoData.description ?? "No description available."}
        </p>

        <div
          className="flex flex-wrap gap-4 text-sm mb-4"
          style={{ color: "var(--text-muted)" }}
        >
          <span>⭐ {repoData.stars_total?.toLocaleString()} stars</span>
          {repoData.stars_growth && (
            <span style={{ color: "hsl(142, 71%, 55%)" }}>
              ↑ {repoData.stars_growth}
            </span>
          )}
          <span>🍴 {repoData.forks_total?.toLocaleString()} forks</span>
          {repoData.language && <span>· {repoData.language}</span>}
        </div>

        {repoData.tags && repoData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {repoData.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full font-medium border"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  borderColor: "var(--border)",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <a
          href={repoData.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm hover:underline"
          style={{ color: "var(--accent)" }}
        >
          View on GitHub →
        </a>
      </div>

      {/* ─── Release Section ─────────────────────────────────────────────── */}
      <div
        className="p-6 rounded-2xl glass mb-6"
        style={{ border: "1px solid var(--border)" }}
      >
        <h2
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          🏷️ Releases
          {repoData.has_new_release && (
            <span
              className="px-2 py-0.5 text-xs font-medium rounded-full"
              style={{ background: "hsl(142, 71%, 45%)", color: "#fff" }}
            >
              New!
            </span>
          )}
        </h2>
        {repoData.latest_release_tag ? (
          <div className="flex items-center gap-4">
            <span
              className="text-sm font-mono px-3 py-1 rounded-lg"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-primary)",
              }}
            >
              {repoData.latest_release_tag}
            </span>
            <button
              id="view-changelog-btn"
              onClick={handleViewChangelog}
              className="inline-flex items-center gap-1.5 text-sm cursor-pointer hover:underline"
              style={{ color: "var(--accent)" }}
            >
              View Changelog →
            </button>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No releases published
          </p>
        )}
      </div>

      {/* ─── AI Analysis Section ─────────────────────────────────────────── */}
      <div
        className="p-6 rounded-2xl glass"
        style={{ border: "1px solid var(--border)" }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          ✨ AI Analysis
        </h2>

        {isAnalyzing ? (
          <div className="text-center py-12">
            <div
              className="inline-block w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-4"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
            />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              AI is reading and analyzing this repository...
            </p>
            <p
              className="text-xs mt-2"
              style={{ color: "var(--text-muted)", opacity: 0.6 }}
            >
              This usually takes 10-30 seconds
            </p>
          </div>
        ) : repoData.ai_summary ? (
          <div>
            <div
              className="max-w-none text-sm mb-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[var(--text-primary)] [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[var(--text-primary)] [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol]:space-y-1 [&_li]:text-sm [&_li]:pl-1 [&_strong]:font-bold [&_strong]:text-[var(--text-primary)] [&_code]:text-xs [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-white/10 [&_a]:text-[var(--accent)] [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-4 [&_blockquote]:border-white/20 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:mb-4"
              style={{ color: "var(--text-secondary)" }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                components={{
                  pre: PreWithCopy,
                  code(props) {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    if (match && match[1] === "mermaid") {
                      return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                    }
                    return (
                      <code {...rest} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {repoData.ai_summary}
              </ReactMarkdown>
            </div>
            <button
              id="magic-analyze-btn"
              onClick={handleMagicAnalyze}
              className="px-4 py-2 rounded-full text-xs font-medium glass transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              🔄 Re-analyze
            </button>
            {repoData.analyze_status === "failed" && (
              <p
                className="text-xs mt-2"
                style={{ color: "hsl(0, 72%, 51%)" }}
              >
                Previous analysis failed. Try again.
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              No analysis yet. Click the button below to let AI read and explain
              this repository.
            </p>
            <button
              id="magic-analyze-btn"
              onClick={handleMagicAnalyze}
              className="px-8 py-3 rounded-full font-medium transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              ✨ Magic Analyze
            </button>
            {repoData.analyze_status === "failed" && (
              <p
                className="text-xs mt-3"
                style={{ color: "hsl(0, 72%, 51%)" }}
              >
                Previous analysis failed. Try again.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
