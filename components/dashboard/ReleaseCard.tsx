import type { RepoRelease } from "@/lib/api/types";

const ReleaseCard: React.FC<{ release: RepoRelease }> = ({ release }) => {
  const scoreColor =
    (release.relevance_score ?? 0) >= 71 ? "hsl(0, 72%, 51%)" :
    (release.relevance_score ?? 0) >= 31 ? "hsl(45, 93%, 47%)" : "var(--text-muted)";

  return (
    <div className="p-5 rounded-2xl glass card-hover" style={{ border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {release.repo_full_name}
        </span>
        {release.relevance_score != null && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: scoreColor, color: "#fff" }}
          >
            {release.relevance_score}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
        >
          {release.release_tag}
        </span>
        {release.release_title && (
          <span className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>
            {release.release_title}
          </span>
        )}
        {release.published_at && (
          <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
            {new Date(release.published_at).toLocaleDateString()}
          </span>
        )}
      </div>
      {release.ai_summary && (
        <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
          {release.ai_summary}
        </p>
      )}
      {release.breaking_changes && (
        <div
          className="text-xs p-2 rounded-lg mb-2"
          style={{ background: "hsla(0, 72%, 51%, 0.1)", color: "hsl(0, 72%, 65%)" }}
        >
          ⚠ Breaking: {release.breaking_changes}
        </div>
      )}
      {release.release_url && (
        <a
          href={release.release_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs hover:underline"
          style={{ color: "var(--accent)" }}
        >
          View release →
        </a>
      )}
    </div>
  );
};

export default ReleaseCard;
