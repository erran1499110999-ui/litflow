"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import FileDropZone from "@/components/FileDropZone";
import { ArrowLeft, Brain, Copy, Download, Sparkles } from "lucide-react";
import type { SuperEgoResult } from "@/types";

export default function SuperEgoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [targetType, setTargetType] = useState<"self" | "other">("self");
  const [targetName, setTargetName] = useState("我自己");
  const [files, setFiles] = useState<File[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [manualText, setManualText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuperEgoResult | null>(null);
  const [rawSummary, setRawSummary] = useState("");

  const handleDistill = async () => {
    setError(null);

    const validTexts = [...texts, manualText.trim()].filter(Boolean);
    if (validTexts.length === 0) {
      setError("请至少提供一份文本素材（上传文件或粘贴文本）");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/ai/distill-superego", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          targetName,
          targetType,
          texts: validTexts,
        }),
      });

      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || "蒸馏失败");
      }

      setResult(json.data.result);
      setRawSummary(json.data.result?.summary || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "蒸馏失败");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
  };

  const exportMarkdown = () => {
    if (!result) return;
    const md = `# ${result.profile_name}\n\n## 核心研究兴趣\n${result.research_interests
      .map((i) => `- **${i.topic}**（${i.depth}）\n  - 证据：${i.evidence}`)
      .join("\n")}\n\n## 写作风格特征\n- 结构模式：${result.writing_style.structure_pattern}\n- 段落风格：${result.writing_style.paragraph_style}\n- 论证偏好：${result.writing_style.evidence_preference}\n- 学术语气：${result.writing_style.tone}\n- 句式特征：${result.writing_style.sentence_features.join("、")}\n\n## 学术立场\n- 方法论：${result.academic_stance.methodology}\n- 认识论：${result.academic_stance.epistemology}\n- 核心立场：${result.academic_stance.key_positions.join("、")}\n\n## 常用表达\n- 高频表达：${result.expressions.frequent_phrases.join("、")}\n- 过渡模式：${result.expressions.transition_patterns.join("、")}\n- 模糊限制语：${result.expressions.hedging_style}\n\n## 词汇偏好\n- 领域术语：${result.vocabulary.domain_terms.join("、")}\n- 偏好动词：${result.vocabulary.preferred_verbs.join("、")}\n- 回避表达：${result.vocabulary.avoidance.join("、")}\n\n## 总结\n${result.summary}\n`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${targetName}-文本超我.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in-up">
      <Link
        href={`/projects/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        返回项目
      </Link>

      <div className="mb-8">
        <span className="inline-block rounded-full bg-spring-50 px-4 py-1.5 text-xs font-medium text-spring-600">
          学术人格蒸馏
        </span>
        <h1
          className="mt-3 text-2xl font-semibold text-[var(--color-text)] lg:text-3xl"
          style={{ fontFamily: "var(--font-noto-serif-sc)" }}
        >
          文本超我
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          上传某位学者的论文（或自己的写作），蒸馏出研究兴趣、写作风格、学术立场与常用表达。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-[var(--color-text)]">蒸馏输入</CardTitle>
            <CardDescription>支持上传文本素材，或直接粘贴文本进行分析。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>蒸馏目标</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType("self");
                      setTargetName("我自己");
                    }}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      targetType === "self"
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    蒸馏自我
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType("other");
                      if (targetName === "我自己") setTargetName("");
                    }}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      targetType === "other"
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    蒸馏他人
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetName">对象名称</Label>
                <Input
                  id="targetName"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  placeholder="如：王教授 / 我自己"
                  className="rounded-xl border-[var(--color-border)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>上传文本素材</Label>
              <FileDropZone files={files} onFilesChange={setFiles} hint="建议上传 3-10 篇同一作者的论文（当前阶段先做 UI）" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manualText">或直接粘贴文本</Label>
              <Textarea
                id="manualText"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="min-h-[240px] rounded-xl border-[var(--color-border)] bg-[var(--color-bg)]"
                placeholder="可以直接粘贴论文摘要、正文片段、你的写作样本..."
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button className="btn-spring" onClick={handleDistill} disabled={loading}>
              <Brain className="mr-2 h-4 w-4" />
              {loading ? "蒸馏中..." : "开始蒸馏"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-[var(--color-text)]">蒸馏结果</CardTitle>
            <CardDescription>输出研究兴趣、写作风格、学术立场和表达习惯。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!result ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-spring-50">
                  <Brain className="h-7 w-7 text-spring-600" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">还没有蒸馏结果</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">上传或粘贴文本后点击“开始蒸馏”</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl bg-[var(--color-bg)] p-4">
                  <p className="text-sm font-medium text-[var(--color-text)]">{result.profile_name}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">{result.summary}</p>
                </div>

                <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
                  <div>
                    <h3 className="font-medium text-[var(--color-text)]">核心研究兴趣</h3>
                    <ul className="mt-1 list-inside list-disc space-y-1">
                      {result.research_interests.map((item, idx) => (
                        <li key={idx}>{item.topic}（{item.depth}）</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--color-text)]">写作风格特征</h3>
                    <p className="mt-1">{result.writing_style.structure_pattern}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--color-text)]">学术立场</h3>
                    <p className="mt-1">{result.academic_stance.methodology}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-xl border-[var(--color-border)]" onClick={copyResult}>
                    <Copy className="mr-2 h-4 w-4" />复制结果
                  </Button>
                  <Button className="btn-spring" onClick={exportMarkdown}>
                    <Download className="mr-2 h-4 w-4" />导出 Markdown
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
