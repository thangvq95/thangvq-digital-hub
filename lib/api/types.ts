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
    notes: string | null;
    first_seen_at: string;
    last_ranked_at: string | null;
    updated_at: string;
}
