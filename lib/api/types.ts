export interface Repository {
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  avatar_url: string | null;
  stars_total: number;
  stars_growth: string | null;
  forks_total: number;
  trending_rank: number | null;
  is_favorite: boolean;
  is_archived: boolean;
  is_read: boolean;
  latest_release_tag: string | null;
  latest_release_body: string | null;
  has_new_release: boolean;
  ai_summary: string | null; // Markdown format
  tags: string[]; // AI generated tags
  analyze_status: 'idle' | 'analyzing' | 'done' | 'failed';
  first_seen_at: string;
  last_scraped_at: string | null;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  repos_scraped: number;
  repos_new: number;
  status: string;
  started_at: string;
  completed_at: string | null;
}
