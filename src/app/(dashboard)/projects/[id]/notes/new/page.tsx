"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NoteEditor from "@/components/NoteEditor";
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
  Upload,
} from "lucide-react";

const PRESET_TAGS = ["方法", "结论", "背景", "局限", "创新点", "数据", "理论"];

const NOTE_TYPE_OPTIONS = [
  {
    value: "excerpt" as const,
    icon: BookOpen,
    label: "文献摘录",
    desc: "论文原文或重点摘抄",
    barColor: "bg-primary-500",
    bgColor: "bg-primary-50",
    textColor: "text-primary-600",
  },
  {
    value: "thought" as const,
    icon: Lightbulb,
    label: "个人想法",
    desc: "你的思考和见解",
    barColor: "bg-spring-500",
    bgColor: "bg-spring-50",
    textColor: "text-spring-600",
  },
  {
    value: "question" as const,
    icon: HelpCircle,
    label: "疑问",
    desc: "阅读中产生的问题",
    barColor: "bg-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-600",
  },
];

export default function NewNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

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
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [charCount, setCharCount] = useState(0);

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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setCharCount(e.target.value.length);
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

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("用户未登录");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("notes").insert({
      project_id: id,
      user_id: userData.user.id,
      content: content.trim(),
      paper_title: paperTitle.trim() || null,
      paper_authors: paperAuthors.trim() || null,
      paper_year: paperYear || null,
      tags: selectedTags,
      note_type: noteType,
    });

    if (insertError) {
      setError("保存失败，请重试");
      setSaving(false);
      return;
    }

    const { data: currentProject } = await supabase
      .from("projects")
      .select("note_count")
      .eq("id", id)
      .single();

    await supabase
      .from("projects")
      .update({ note_count: (currentProject?.note_count || 0) + 1 })
      .eq("id", id);

    router.push(`/projects/${id}`);
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in-up">
      {/* 返回链接 */}
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
            添加文献笔记
          </CardTitle>
          <CardDescription>
            记录你在阅读论文时的摘录、想法或疑问
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 错误提示 */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 笔记类型选择 */}
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
                        active ? type.textColor : "text-[var(--color-text-muted)]"
                      }`}
                      strokeWidth={1.5}
                    />
                    <div
                      className={`text-sm font-medium ${
                        active ? type.textColor : "text-[var(--color-text)]"
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
              content=""
              onChange={(html) => setContent(html)}
              placeholder="输入你的笔记内容..."
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
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
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
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600"
                  >
                    {tag}
                    <button onClick={() => toggleTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 文件拖拽上传 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[var(--color-text)]">
              附件（选填）
            </Label>
            <div
              className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                dragOver
                  ? "border-primary-500 bg-primary-50"
                  : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
              }`}
              onDragOver={(e) => (e.preventDefault(), setDragOver(true))}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
            >
              <Upload
                className={`mx-auto mb-3 h-8 w-8 ${
                  dragOver
                    ? "text-primary-500"
                    : "text-[var(--color-text-muted)]"
                }`}
                strokeWidth={1.5}
              />
              <p className="text-sm text-[var(--color-text-secondary)]">
                拖拽文件到此处，或点击上传
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                支持 PDF / Word / Markdown
              </p>
              <input
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                accept=".pdf,.docx,.md,.txt,.html"
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);
                  setFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
                }}
              />
            </div>
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 animate-fade-in-up"
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-[var(--color-text)]">
                        {file.name}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-[var(--color-text-muted)] hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            {saving ? "保存中..." : "💾 保存笔记"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
