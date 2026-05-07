const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const api = {
  repos: {
    list: (params?: URLSearchParams) =>
      apiFetch<{ data: import('./types').Repository[]; meta: { total: number; period: string } }>(
        `/api/repos${params ? `?${params}` : ''}`
      ),
    detail: (fullName: string) =>
      apiFetch<import('./types').Repository>(`/api/repos/${encodeURIComponent(fullName)}`),
    patch: (fullName: string, body: Record<string, unknown>) =>
      apiFetch<import('./types').Repository>(`/api/repos/${encodeURIComponent(fullName)}`, {
        method: 'PATCH', body: JSON.stringify(body),
      }),
  },
  releases: {
    list: (page = 1, limit = 20) =>
      apiFetch<{ data: import('./types').RepoRelease[]; meta: { total: number } }>(
        `/api/releases?page=${page}&limit=${limit}`
      ),
  },
  sync: {
    latest: () => apiFetch<import('./types').SyncLog | null>('/api/sync'),
  },
};
