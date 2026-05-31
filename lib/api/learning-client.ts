import type {
  Learning,
  LearningsResponse,
  LearningTopic,
  LearningSubtopic,
} from './learning-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

export async function fetchLearnings(params: {
  tab?: string;
  topic?: string;
  subtopic?: string;
  page?: number;
  limit?: number;
}): Promise<LearningsResponse> {
  const searchParams = new URLSearchParams();
  if (params.tab) searchParams.set('tab', params.tab);
  if (params.topic) searchParams.set('topic', params.topic);
  if (params.subtopic) searchParams.set('subtopic', params.subtopic);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const res = await fetch(`${API_URL}/api/learnings?${searchParams}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch learnings');
  return res.json();
}

export async function fetchLearning(id: string): Promise<Learning> {
  const res = await fetch(`${API_URL}/api/learnings/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch learning');
  return res.json();
}

export async function patchLearning(
  id: string,
  updates: {
    is_learned?: boolean;
    is_favorite?: boolean;
    subtopic_id?: number | null;
  },
): Promise<Learning> {
  const res = await fetch(`${API_URL}/api/learnings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to patch learning');
  return res.json();
}

export async function addLearning(formData: FormData): Promise<Learning> {
  const res = await fetch(`${API_URL}/api/learnings/add`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to add learning');
  return res.json();
}

export async function fetchTopics(): Promise<LearningTopic[]> {
  const res = await fetch(`${API_URL}/api/learnings/topics`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}

export async function fetchSubtopics(): Promise<LearningSubtopic[]> {
  const res = await fetch(`${API_URL}/api/learnings/subtopics`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch subtopics');
  return res.json();
}
