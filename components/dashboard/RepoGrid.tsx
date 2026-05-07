import RepoCard from "@/components/dashboard/RepoCard";
import type { Repository } from "@/lib/api/types";

// Server Component — fetches repo list from API
const RepoGrid: React.FC = async () => {
  // TODO: fetch repos from API with filters from searchParams
  const repos: Repository[] = [];

  if (repos.length === 0) {
    return (
      <div
        id="repo-grid-empty"
        className="flex flex-col items-center justify-center py-24 text-center"
        style={{ color: "var(--text-muted)" }}
      >
        <p className="text-4xl mb-3">🔭</p>
        <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>
          No repositories yet
        </p>
        <p className="text-sm mt-1">
          Waiting for the first Hermes sync...
        </p>
      </div>
    );
  }

  return (
    <div
      id="repo-grid"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {repos.map((repo) => (
        <RepoCard key={repo.full_name} repo={repo} />
      ))}
    </div>
  );
};

export default RepoGrid;
