export interface Repository {
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  avatar_url: string | null;
  rank_daily: number | null;
  rank_weekly: number | null;
  rank_monthly: number | null;
  stars_total: number;
  stars_growth: string | null;
  forks_total: number;
  domains: string[];
  is_favorite: boolean;
  is_applied: boolean;
  is_viewed: boolean;
  notes: string | null;
  first_seen_at: string;
  last_ranked_at: string | null;
  updated_at: string;
}

export interface RepoRelease {
  id: string;
  repo_full_name: string;
  release_tag: string;
  release_title: string | null;
  release_url: string | null;
  published_at: string | null;
  ai_summary: string | null;
  breaking_changes: string | null;
  migration_notes: string | null;
  relevance_score: number | null;
  is_viewed: boolean;
  processed_at: string;
}

export interface SyncLog {
  id: string;
  sync_type: string;
  repos_scraped: number;
  repos_new: number;
  repos_classified: number;
  status: string;
  started_at: string;
  completed_at: string | null;
}
