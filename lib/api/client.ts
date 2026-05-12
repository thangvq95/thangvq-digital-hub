const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const api = {
  repos: {
    list: (tab = 'all', page = 1, limit = 20) =>
      apiFetch<{
        data: import('./types').Repository[];
        meta: { total: number; page: number; limit: number; tab: string };
      }>(`/api/repos?tab=${tab}&page=${page}&limit=${limit}`),

    detail: (fullName: string) =>
      apiFetch<import('./types').Repository>(
        `/api/repos/${encodeURIComponent(fullName)}`,
      ),

    patch: (fullName: string, body: Record<string, unknown>) =>
      apiFetch<import('./types').Repository>(
        `/api/repos/${encodeURIComponent(fullName)}`,
        { method: 'PATCH', body: JSON.stringify(body) },
      ),

    add: (url: string) =>
      apiFetch<import('./types').Repository>('/api/repos/add', {
        method: 'POST',
        body: JSON.stringify({ url }),
      }),

    /** Triggers async analysis — returns repo with analyze_status='analyzing' */
    analyze: (fullName: string) =>
      apiFetch<import('./types').Repository>(
        `/api/repos/${encodeURIComponent(fullName)}/analyze`,
        { method: 'POST' },
      ),
  },

  sync: {
    latest: () => apiFetch<import('./types').SyncLog | null>('/api/sync'),
  },
};
