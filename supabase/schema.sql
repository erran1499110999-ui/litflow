-- LitFlow 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行

-- 用户扩展表（Supabase Auth 自动管理，这里只存扩展信息）
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  field TEXT,
  note_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 笔记表
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  paper_title TEXT,
  paper_authors TEXT,
  paper_year INTEGER,
  tags TEXT[] DEFAULT '{}',
  note_type TEXT DEFAULT 'excerpt' CHECK (note_type IN ('excerpt', 'thought', 'question')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 生成的提纲表
CREATE TABLE IF NOT EXISTS outlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  raw_markdown TEXT,
  note_ids UUID[] NOT NULL,
  model_used TEXT DEFAULT 'deepseek-chat',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文本超我（蒸馏结果）表
CREATE TABLE IF NOT EXISTS superego_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_type TEXT DEFAULT 'other',
  source_files TEXT[] DEFAULT '{}',
  result JSONB,
  raw_text TEXT,
  model_used TEXT DEFAULT 'deepseek-chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'zh-CN',
  default_llm_provider TEXT DEFAULT 'deepseek',
  llm_configs JSONB DEFAULT '{}',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文件上传记录表
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  superego_id UUID REFERENCES superego_profiles(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  extracted_text TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_outlines_project ON outlines(project_id);
CREATE INDEX IF NOT EXISTS idx_superego_project ON superego_profiles(project_id);
CREATE INDEX IF NOT EXISTS idx_superego_user ON superego_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_project ON uploaded_files(project_id);

-- 自动更新 updated_at 的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- projects 表的自动更新时间触发器
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- notes 表的自动更新时间触发器
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS（行级安全）
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE superego_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- 删除已有策略（防止重复执行报错）
DROP POLICY IF EXISTS "用户只能查看自己的项目" ON projects;
DROP POLICY IF EXISTS "用户只能查看自己的笔记" ON notes;
DROP POLICY IF EXISTS "用户只能查看自己的提纲" ON outlines;
DROP POLICY IF EXISTS "用户只能访问自己的蒸馏结果" ON superego_profiles;
DROP POLICY IF EXISTS "用户只能访问自己的设置" ON user_settings;
DROP POLICY IF EXISTS "用户只能访问自己的文件" ON uploaded_files;

-- 创建策略
CREATE POLICY "用户只能查看自己的项目" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户只能查看自己的笔记" ON notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户只能查看自己的提纲" ON outlines
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户只能访问自己的蒸馏结果" ON superego_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户只能访问自己的设置" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户只能访问自己的文件" ON uploaded_files
  FOR ALL USING (auth.uid() = user_id);

-- 注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
