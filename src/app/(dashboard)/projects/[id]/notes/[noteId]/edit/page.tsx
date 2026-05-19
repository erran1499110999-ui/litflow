"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NoteEditor from "@/components/NoteEditor";
import FileDropZone from "@/components/FileDropZone";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  Lightbulb,
  HelpCircle,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Note } from "@/types";

const PRESET_TAGS = ["方法", "结论", "背景", "局限", "创新点", "数据", "理论"];

const NOTE_TYPE_OPTIONS = [
  {
    value: "excerpt" as const,
    icon: BookOpen,
    label: "文献摘录",
    desc: "论文原文或重点摘抄",
    barColor: "bg-primary-500",
    color: "text-primary-600",
  },
  {
    value: "thought" as const,
    icon: Lightbulb,
    label: "个人想法",
    desc: "你的思考和见解",
    barColor: "bg-spring-500",
    color: "text-spring-600",
  },
  {
    value: "question" as const,
    icon: HelpCircle,
    label: "疑问",
    desc: "阅读中产生的问题",
    barColor: "bg-amber-500",
    color: "text-amber-600",
  },
];

export default function EditNotePage({
  params,
}: {
  params: Promise<{ id: string; noteId: string }>;
}) {
  const { id, noteId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [paperTitle, setPaperTitle] = useState("");
  const [paperAuthors, setPaperAuthors] = useState("");
  const [paperYear, setPaperYear] = useState<number | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [noteType, setNoteType] = useState<"excerpt" | "thought" | "question">(
    "excerpt"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaperInfo, setShowPaperInfo] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchNote = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();
      if (data) {
        setContent(data.content || "");
        setPaperTitle(data.paper_title || "");
        setPaperAuthors(data.paper_authors || "");
        setPaperYear(data.paper_year || "");
        setSelectedTags(data.tags || []);
        setNoteType(data.note_type || "excerpt");
        setCharCount(data.content?.length || 0);
        if (data.paper_title) setShowPaperInfo(true);
      }
      setLoading(false);
    };
    fetchNote();
  }, [noteId]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((prev) => [...prev, customTag.trim()]);
      setCustomTag("");
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      setError("请输入笔记内容");
      return;
    }
    setSaving(true);
    setError(null);

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("notes")
      .update({
        content: content.trim(),
        paper_title: paperTitle.trim() || null,
        paper_authors: paperAuthors.trim() || null,
        paper_year: paperYear || null,
        tags: selectedTags,
        note_type: noteType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    if (updateError) {
      setError("保存失败，请重试");
      setSaving(false);
      return;
    }

    router.push(`/projects/${id}`);
    router.refresh();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <div className="h-8 w-8 animate-breathe rounded-full bg-primary-500/30 mx-auto" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in-up">
      <Link
        href={`/projects/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        返回项目
      </Link>

      <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <CardHeader>
          <CardTitle
            className="text-xl text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-noto-serif-sc)" }}
          >
            编辑笔记
          </CardTitle>
          <CardDescription>修改你的文献笔记内容</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 笔记类型 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[var(--color-text)]">
              笔记类型
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {NOTE_TYPE_OPTIONS.map((type) => {
                const Icon = type.icon;
                const active = noteType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                      active
                        ? "border-primary-500 bg-primary-50 shadow-sm"
                        : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-border-hover)]"
                    }`}
                    onClick={() => setNoteType(type.value)}
                  >
                    {active && (
                      <div
                        className={`absolute left-0 top-0 h-full w-1 ${type.barColor}`}
                      />
                    )}
                    <Icon
                      className={`mb-2 h-5 w-5 ${
                        active ? type.color : "text-[var(--color-text-muted)]"
                      }`}
                      strokeWidth={1.5}
                    />
                    <div
                      className={`text-sm font-medium ${
                        active ? type.color : "text-[var(--color-text)]"
                      }`}
                    >
                      {type.label}
                    </div>
                    <div className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {type.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 笔记内容 */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between text-sm font-medium text-[var(--color-text)]">
              <span>笔记内容 *</span>
              <span className="text-xs text-[var(--color-text-muted)]">
                支持 Markdown 和富文本编辑
              </span>
            </Label>
            <NoteEditor
              content={content}
              onChange={(text) => {
                setContent(text);
                setCharCount(text.length);
              }}
              placeholder="编辑笔记内容..."
              minHeight="280px"
            />
          </div>

          {/* 来源论文信息 */}
          <div className="space-y-2">
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
              onClick={() => setShowPaperInfo(!showPaperInfo)}
            >
              {showPaperInfo ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              来源论文信息（选填）
            </button>

            {showPaperInfo && (
              <div className="animate-fade-in-up space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
                <div className="space-y-2">
                  <Label htmlFor="paperTitle" className="text-sm">
                    论文标题
                  </Label>
                  <Input
                    id="paperTitle"
                    placeholder="论文标题"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    className="rounded-xl border-[var(--color-border)] bg-[var(--color-surface)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paperAuthors" className="text-sm">
                      作者
                    </Label>
                    <Input
                      id="paperAuthors"
                      placeholder="作者姓名"
                      value={paperAuthors}
                      onChange={(e) => setPaperAuthors(e.target.value)}
                      className="rounded-xl border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paperYear" className="text-sm">
                      年份
                    </Label>
                    <Input
                      id="paperYear"
                      type="number"
                      placeholder="2024"
                      value={paperYear}
                      onChange={(e) =>
                        setPaperYear(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="rounded-xl border-[var(--color-border)] bg-[var(--color-surface)]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[var(--color-text)]">
              标签（选填）
            </Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-pill ${
                    selectedTags.includes(tag)
                      ? "!bg-primary-500 !text-white"
                      : ""
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="自定义标签"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCustomTag())
                }
                className="max-w-[200px] rounded-xl border-[var(--color-border)]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomTag}
                className="rounded-xl"
              >
                添加
              </Button>
            </div>
          </div>

          {/* 文件拖拽上传 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[var(--color-text)]">
              附件（选填）
            </Label>
            <FileDropZone files={files} onFilesChange={setFiles} />
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-[var(--color-border)] px-6 py-4">
          <Button
            variant="outline"
            asChild
            className="rounded-xl border-[var(--color-border)]"
          >
            <Link href={`/projects/${id}`}>取消</Link>
          </Button>
          <Button
            className="btn-spring"
            disabled={!content.trim() || saving}
            onClick={handleSave}
          >
            {saving ? "保存中..." : "💾 保存修改"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
