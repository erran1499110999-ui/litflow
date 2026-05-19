"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const PRESET_TAGS = ["方法", "结论", "背景", "局限", "创新点", "数据", "理论"];

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
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/projects/${id}`}
        className="mb-6 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回项目
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">添加文献笔记</CardTitle>
          <CardDescription>
            记录你在阅读论文时的摘录、想法或疑问
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>笔记类型</Label>
            <div className="flex gap-3">
              {[
                { value: "excerpt" as const, label: "📝 文献摘录", desc: "论文原文或重点摘抄" },
                { value: "thought" as const, label: "💡 个人想法", desc: "你的思考和见解" },
                { value: "question" as const, label: "❓ 疑问", desc: "阅读中产生的问题" },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`flex-1 rounded-lg border-2 p-3 text-left transition-colors ${
                    noteType === type.value
                      ? "border-[#1e3a5f] bg-blue-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                  onClick={() => setNoteType(type.value)}
                >
                  <div className="font-medium text-sm">{type.label}</div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    {type.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">笔记内容 *</Label>
            <Textarea
              id="content"
              placeholder="输入你的笔记内容，支持 Markdown 格式..."
              className="min-h-[200px] resize-y"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-800"
              onClick={() => setShowPaperInfo(!showPaperInfo)}
            >
              <span>{showPaperInfo ? "▼" : "▶"}</span>
              来源论文信息（选填）
            </button>

            {showPaperInfo && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="space-y-2">
                  <Label htmlFor="paperTitle">论文标题</Label>
                  <Input
                    id="paperTitle"
                    placeholder="论文标题"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paperAuthors">作者</Label>
                    <Input
                      id="paperAuthors"
                      placeholder="作者姓名"
                      value={paperAuthors}
                      onChange={(e) => setPaperAuthors(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paperYear">年份</Label>
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
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>标签（选填）</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
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
                onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                className="max-w-[200px]"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomTag}
              >
                添加
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href={`/projects/${id}`}>取消</Link>
          </Button>
          <Button
            className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            disabled={!content.trim() || saving}
            onClick={handleSave}
          >
            {saving ? "保存中..." : "保存笔记"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
