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
  const [isSyncingRelease, setIsSyncingRelease] = useState(false);

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
        // Auto-sync if no release tag yet
        if (!data.latest_release_tag) {
          setIsSyncingRelease(true);
          api.repos.syncRelease(fullName)
            .then(setRepoData)
            .catch(console.error)
            .finally(() => setIsSyncingRelease(false));
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

  const handleSyncRelease = useCallback(async () => {
    if (!repoData || isSyncingRelease) return;
    setIsSyncingRelease(true);
    try {
      const updated = await api.repos.syncRelease(fullName);
      setRepoData(updated);
    } catch (err) {
      console.error("Sync release failed:", err);
    } finally {
      setIsSyncingRelease(false);
    }
  }, [repoData, fullName, isSyncingRelease]);

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

        <div className="flex flex-wrap gap-4 mt-6">
          <a
            href={repoData.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 inline-flex items-center gap-2.5 border"
            style={{ 
              background: "var(--bg-card)", 
              color: "var(--text-primary)",
              borderColor: "var(--border)"
            }}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>

      {/* ─── Release Section ─────────────────────────────────────────────── */}
      <div
        className="p-6 rounded-2xl glass mb-6"
        style={{ border: "1px solid var(--border)" }}
      >
        <h2
          className="text-lg font-semibold mb-4 flex items-center justify-between"
          style={{ color: "var(--text-primary)" }}
        >
          <div className="flex items-center gap-2">
            🏷️ Releases
            {repoData.has_new_release && (
              <span
                className="px-2 py-0.5 text-xs font-medium rounded-full"
                style={{ background: "hsl(142, 71%, 45%)", color: "#fff" }}
              >
                New!
              </span>
            )}
          </div>
          <button
            onClick={handleSyncRelease}
            disabled={isSyncingRelease}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all disabled:opacity-50 cursor-pointer"
            title="Sync latest release"
          >
            <svg 
              className={`w-4 h-4 fill-none stroke-current ${isSyncingRelease ? 'animate-spin' : ''}`}
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </h2>

        {isSyncingRelease && !repoData.latest_release_tag ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
             <div className="w-6 h-6 border-2 border-t-transparent animate-spin rounded-full" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
             <p className="text-sm" style={{ color: "var(--text-muted)" }}>Syncing latest release...</p>
          </div>
        ) : repoData.latest_release_tag ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span
                  className="text-sm font-mono px-3 py-1 rounded-lg border"
                  style={{
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border)"
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
                  View on GitHub →
                </button>
              </div>

              <a
                href={`${repoData.html_url}/releases/tag/${repoData.latest_release_tag}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all duration-200 flex-shrink-0 cursor-pointer border"
                style={{ borderColor: "var(--border)" }}
                title="Open Release on GitHub"
              >
                <svg
                  className="w-5 h-5 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </a>
            </div>

            {repoData.latest_release_body && (
              <div className="space-y-4">
                <div 
                  className="p-4 rounded-xl bg-black/20 border border-white/5 text-xs max-h-96 overflow-y-auto prose prose-invert prose-sm max-w-none [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_code]:bg-white/10 [&_code]:px-1 [&_code]:rounded"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {repoData.latest_release_body}
                  </ReactMarkdown>
                </div>
                <div className="flex justify-center">
                  <a
                    href={`${repoData.html_url}/releases`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-wider font-bold py-2 px-6 rounded-full glass border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-neutral-500 hover:text-neutral-200"
                  >
                    View full release history on GitHub →
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleSyncRelease}
            disabled={isSyncingRelease}
            className="w-full py-10 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed transition-all hover:bg-white/5 group cursor-pointer"
            style={{ borderColor: "var(--border)" }}
          >
            <div 
              className={`p-4 rounded-full glass group-hover:scale-110 transition-transform ${isSyncingRelease ? 'animate-spin' : ''}`}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <svg
                className="w-8 h-8 fill-none stroke-current"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--text-muted)" }}
              >
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg" style={{ color: "var(--text-primary)" }}>{isSyncingRelease ? 'Syncing...' : 'No release info yet'}</p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{isSyncingRelease ? 'Fetching from GitHub...' : 'Click to sync latest release from GitHub'}</p>
            </div>
          </button>
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
