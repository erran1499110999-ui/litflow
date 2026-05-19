"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ArrowLeft,
  Trash2,
  Edit3,
  FileText,
  Sparkles,
  Search,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Layers,
  Clock,
} from "lucide-react";
import type { Project, Note } from "@/types";

const NOTE_TYPE_META = {
  excerpt: {
    icon: BookOpen,
    label: "摘录",
    barClass: "note-type-bar-excerpt",
    color: "text-primary-600",
    bgColor: "bg-primary-50",
  },
  thought: {
    icon: Lightbulb,
    label: "想法",
    barClass: "note-type-bar-thought",
    color: "text-spring-600",
    bgColor: "bg-spring-50",
  },
  question: {
    icon: HelpCircle,
    label: "疑问",
    barClass: "note-type-bar-question",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
};

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "group">("list");
  const router = useRouter();

  const fetchProjectData = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (!projectData) {
      router.push("/projects");
      return;
    }
    setProject(projectData);

    const { data: notesData } = await supabase
      .from("notes")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    setNotes(notesData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const deleteNote = async (noteId: string) => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    if (!error) {
      await supabase
        .from("projects")
        .update({ note_count: notes.length - 1 })
        .eq("id", id);
      setDeleteConfirm(null);
      fetchProjectData();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 筛选和搜索
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      !searchQuery ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.paper_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesType = !filterType || note.note_type === filterType;
    const matchesTag = !filterTag || note.tags?.includes(filterTag);

    return matchesSearch && matchesType && matchesTag;
  });

  // 所有使用的标签
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || []))).sort();

  // 按论文分组
  const groupedByPaper = filteredNotes.reduce<Record<string, Note[]>>(
    (acc, note) => {
      const key = note.paper_title || "未标注来源";
      if (!acc[key]) acc[key] = [];
      acc[key].push(note);
      return acc;
    },
    {}
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-breathe rounded-full bg-primary-500/30" />
      </div>
    );
  }

  if (!project) return null;

  const renderNoteCard = (note: Note) => {
    const meta = NOTE_TYPE_META[note.note_type];
    const Icon = meta.icon;

    return (
      <div
        key={note.id}
        className="card-spring group flex gap-4 !p-0 !rounded-xl overflow-hidden animate-stagger"
        style={{
          animationDelay: `${notes.indexOf(note) * 0.03}s`,
        }}
      >
        {/* 类型色条 */}
        <div className={meta.barClass} />

        <div className="flex-1 p-4 pl-3">
          {/* 顶部：类型标签 + 操作按钮 */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.bgColor} ${meta.color}`}
              >
                <Icon className="h-3 w-3" strokeWidth={1.5} />
                {meta.label}
              </span>

              {/* 来源标签 */}
              {note.paper_title && (
                <span className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs text-[var(--color-text-muted)]">
                  {note.paper_title.length > 20
                    ? note.paper_title.slice(0, 20) + "..."
                    : note.paper_title}
                </span>
              )}
            </div>

            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                onClick={() =>
                  router.push(`/projects/${id}/notes/${note.id}/edit`)
                }
              >
                <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[var(--color-text-muted)] hover:text-red-500"
                onClick={() => setDeleteConfirm(note.id)}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Button>
            </div>
          </div>

          {/* 笔记内容 */}
          <p className="text-sm leading-relaxed text-[var(--color-text)]">
            {note.content}
          </p>

          {/* 底部：标签 + 时间 */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {note.tags?.map((tag) => (
                <span key={tag} className="tag-pill !text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <Clock className="h-3 w-3" strokeWidth={1.5} />
              {formatDate(note.created_at)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in-up">
      {/* 返回 + 标题 */}
      <div className="mb-8">
        <Link
          href="/projects"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回项目列表
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl font-semibold text-[var(--color-text)] lg:text-3xl"
              style={{ fontFamily: "var(--font-noto-serif-sc)" }}
            >
              {project.title}
            </h1>
            {project.description && (
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {project.description}
              </p>
            )}
            {project.field && (
              <span className="mt-1 inline-block rounded-full bg-primary-50 px-3 py-0.5 text-xs font-medium text-primary-600">
                {project.field}
              </span>
            )}
          </div>

          <Button asChild className="btn-spring text-sm">
            <Link href={`/projects/${id}/notes/new`}>
              <Plus className="mr-1.5 h-4 w-4" />
              添加笔记
            </Link>
          </Button>
        </div>
      </div>

      {/* AI 生成进度提示 */}
      {notes.length >= 10 ? (
        <Card className="mb-8 border-primary-200 bg-primary-50 shadow-sm">
          <CardContent className="flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-200">
                <Sparkles className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  已积累 {notes.length} 条笔记，可以生成综述提纲了！
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  AI 将分析所有笔记，自动整理主题分组和章节结构
                </p>
              </div>
            </div>
            <Button asChild className="btn-spring text-sm flex-shrink-0">
              <Link href={`/projects/${id}/outline`}>
                <FileText className="mr-1.5 h-4 w-4" />
                生成综述提纲
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <CardContent className="py-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-[var(--color-text-secondary)]">
                还需 {10 - notes.length} 条笔记即可生成综述提纲
              </p>
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                {notes.length}/10
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-500"
                style={{ width: `${(notes.length / 10) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 搜索和筛选工具条 */}
      {notes.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
                strokeWidth={1.5}
              />
              <Input
                placeholder="搜索笔记内容、论文标题、标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border-[var(--color-border)] bg-[var(--color-surface)] pl-9 text-sm"
              />
            </div>

            <div className="flex gap-2">
              {["all", "excerpt", "thought", "question"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type === "all" ? null : type)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                    (type === "all" && !filterType) || filterType === type
                      ? "bg-primary-500 text-white"
                      : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)]"
                  }`}
                >
                  {type === "all"
                    ? "全部"
                    : NOTE_TYPE_META[type as keyof typeof NOTE_TYPE_META].label}
                </button>
              ))}
            </div>
          </div>

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterTag(null)}
                className={`rounded-full px-2.5 py-1 text-xs transition-all ${
                  !filterTag
                    ? "bg-primary-500 text-white"
                    : "border border-[var(--color-border)] text-[var(--color-text-muted)]"
                }`}
              >
                全部标签
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-all ${
                    filterTag === tag
                      ? "bg-primary-500 text-white"
                      : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-primary-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* 视图切换 */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-[var(--color-border)] p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                <Layers className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.5} />
                列表视图
              </button>
              <button
                onClick={() => setViewMode("group")}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "group"
                    ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                <FileText className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.5} />
                按论文分组
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 笔记列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-[var(--color-text)]">
            {filteredNotes.length === notes.length
              ? `文献笔记 (${notes.length})`
              : `筛选结果 (${filteredNotes.length}/${notes.length})`}
          </h2>
        </div>

        {notes.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] py-20 text-center">
            <div className="empty-state-graphic mb-6" />
            <h3 className="text-base font-medium text-[var(--color-text-secondary)]">
              还没有笔记
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              添加你的第一篇文献笔记
            </p>
            <Button asChild className="btn-spring mt-6 text-sm">
              <Link href={`/projects/${id}/notes/new`}>
                <Plus className="mr-1.5 h-4 w-4" />
                添加笔记
              </Link>
            </Button>
          </div>
        ) : filteredNotes.length === 0 ? (
          /* 无搜索结果 */
          <div className="flex flex-col items-center py-16 text-center">
            <Search className="mb-4 h-10 w-10 text-[var(--color-text-muted)]" strokeWidth={1.5} />
            <p className="text-sm text-[var(--color-text-secondary)]">
              没有找到匹配的笔记
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterType(null);
                setFilterTag(null);
              }}
              className="mt-2 text-xs text-primary-500 hover:underline"
            >
              清除所有筛选条件
            </button>
          </div>
        ) : viewMode === "list" ? (
          /* 列表视图 */
          <div className="space-y-3">
            {filteredNotes.map((note) => renderNoteCard(note))}
          </div>
        ) : (
          /* 按论文分组视图 */
          <div className="space-y-6">
            {Object.entries(groupedByPaper).map(([paper, paperNotes]) => (
              <div key={paper}>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-[var(--color-text)]">
                  <FileText className="h-4 w-4 text-primary-500" strokeWidth={1.5} />
                  {paper}
                  <span className="text-xs text-[var(--color-text-muted)]">
                    ({paperNotes.length} 条笔记)
                  </span>
                </h3>
                <div className="space-y-3">
                  {paperNotes.map((note) => renderNoteCard(note))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="rounded-2xl border-[var(--color-border)] bg-[var(--color-surface)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--color-text)]">
              确认删除笔记
            </DialogTitle>
            <DialogDescription>
              此操作不可撤销，该笔记将被永久删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="rounded-xl"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteNote(deleteConfirm)}
              className="rounded-xl"
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
