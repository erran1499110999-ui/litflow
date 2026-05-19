// ===== 数据库模型 =====

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  field: string | null;
  note_count: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  paper_title: string | null;
  paper_authors: string | null;
  paper_year: number | null;
  tags: string[];
  note_type: 'excerpt' | 'thought' | 'question';
  created_at: string;
  updated_at: string;
}

export type NoteType = 'excerpt' | 'thought' | 'question';

export interface Outline {
  id: string;
  project_id: string;
  user_id: string;
  content: OutlineContent;
  raw_markdown: string | null;
  note_ids: string[];
  model_used: string;
  created_at: string;
}

// ===== AI 生成的结构 =====

export interface OutlineContent {
  themes: Theme[];
  relationships: Relationship[];
  outline: OutlineStructure;
  gaps: Gap[];
  summary: string;
}

export interface Theme {
  title: string;
  description: string;
  noteIndices: number[];
  subTopics: SubTopic[];
}

export interface SubTopic {
  title: string;
  keyPoints: string[];
  relatedPapers: string[];
}

export interface Relationship {
  type: 'support' | 'contradict' | 'extend' | 'complement';
  paper1: string;
  paper2: string;
  description: string;
}

export interface OutlineStructure {
  title: string;
  sections: OutlineSection[];
}

export interface OutlineSection {
  heading: string;
  purpose: string;
  keyArguments: string[];
  citations: string[];
  transitionToNext: string;
}

export interface Gap {
  area: string;
  suggestion: string;
  reason: string;
}

// ===== API 响应格式 =====

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ===== 用于 Prompt 的笔记格式 =====

export interface NoteForPrompt {
  content: string;
  paperTitle?: string;
  paperAuthors?: string;
  paperYear?: number;
  tags?: string[];
  noteType: string;
}
