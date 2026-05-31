export interface LearningTopic {
  id: number;
  name: string;
  display_name: string;
  color: string;
}

export interface LearningSubtopic {
  id: number;
  name: string;
  display_name: string;
}

export interface Learning {
  id: string;
  title: string;
  summary: string | null;
  source_url: string | null;
  source_type: string;
  image_path: string | null;
  topic: LearningTopic;
  subtopic: LearningSubtopic | null;
  is_learned: boolean;
  is_favorite: boolean;
  content_hash: string | null;
  analyze_status: "idle" | "analyzing" | "done" | "failed";
  created_at: string;
  updated_at: string;
}

export interface LearningsResponse {
  data: Learning[];
  meta: {
    total: number;
    page: number;
    limit: number;
    tab: string;
  };
}
