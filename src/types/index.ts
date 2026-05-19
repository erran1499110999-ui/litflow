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

export interface SuperEgoProfile {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  target_type: "self" | "other";
  source_files: string[];
  result: SuperEgoResult | null;
  raw_text: string | null;
  model_used: string;
  created_at: string;
  updated_at: string;
}

export interface UploadedFileRecord {
  id: string;
  user_id: string;
  project_id: string | null;
  superego_id: string | null;
  filename: string;
  file_type: string;
  file_size: number | null;
  extracted_text: string | null;
  storage_path: string | null;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  language: string;
  default_llm_provider: string;
  llm_configs: Record<string, unknown>;
  theme: string;
  created_at: string;
  updated_at: string;
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

export interface SuperEgoInterest {
  topic: string;
  evidence: string;
  depth: "core" | "secondary" | "emerging";
}

export interface SuperEgoWritingStyle {
  structure_pattern: string;
  paragraph_style: string;
  evidence_preference: string;
  tone: string;
  sentence_features: string[];
}

export interface SuperEgoAcademicStance {
  methodology: string;
  epistemology: string;
  key_positions: string[];
}

export interface SuperEgoExpressions {
  frequent_phrases: string[];
  transition_patterns: string[];
  hedging_style: string;
}

export interface SuperEgoVocabulary {
  domain_terms: string[];
  preferred_verbs: string[];
  avoidance: string[];
}

export interface SuperEgoResult {
  profile_name: string;
  research_interests: SuperEgoInterest[];
  writing_style: SuperEgoWritingStyle;
  academic_stance: SuperEgoAcademicStance;
  expressions: SuperEgoExpressions;
  vocabulary: SuperEgoVocabulary;
  summary: string;
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
