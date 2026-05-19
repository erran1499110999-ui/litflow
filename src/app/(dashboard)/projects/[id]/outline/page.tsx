"use client";

import { useState, use } from "react";
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
import { ArrowLeft, Download, Copy, Sparkles, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import type { OutlineContent } from "@/types";

export default function OutlinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [outline, setOutline] = useState<OutlineContent | null>(null);
  const [rawMarkdown, setRawMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [expandedThemes, setExpandedThemes] = useState<Set<number>>(new Set([0]));

  const generateOutline = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "生成失败");
        setLoading(false);
        return;
      }

      setOutline(result.data.content);
      setRawMarkdown(result.data.raw_markdown);
      setGenerated(true);
    } catch (err) {
      setError("网络错误，请检查网络连接后重试");
    }

    setLoading(false);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(rawMarkdown);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([rawMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "综述提纲.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = (index: number) => {
    setExpandedThemes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "support": return "✅";
      case "contradict": return "⚠️";
      case "extend": return "🔗";
      case "complement": return "➕";
      default: return "•";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "support": return "支持";
      case "contradict": return "矛盾";
      case "extend": return "延伸";
      case "complement": return "补充";
      default: return type;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/projects/${id}`}
        className="mb-6 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回项目
      </Link>

      {!generated && !loading && (
        <Card>
          <CardHeader className="text-center">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-[#d97706]" />
            <CardTitle className="text-2xl">生成综述提纲</CardTitle>
            <CardDescription className="text-base">
              AI 将分析你所有的文献笔记，自动生成结构化的综述提纲
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 rounded-md bg-red-50 p-4 text-sm text-red-600">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">生成失败</p>
                  <p>{error}</p>
                  <p className="mt-1 text-xs text-red-500">
                    DeepSeek API 需要配置有效的 API Key 才能使用
                  </p>
                </div>
              </div>
            )}
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <p className="font-medium">预计耗时约 15-30 秒</p>
              <p className="mt-1 text-amber-600">
                请耐心等待，此过程将分析你所有笔记的内容、主题和论文关系
              </p>
            </div>
          </CardContent>
          <div className="flex justify-center pb-6">
            <Button
              size="lg"
              className="bg-[#d97706] hover:bg-[#d97706]/90"
              onClick={generateOutline}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              开始生成
            </Button>
          </div>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-[#1e3a5f] border-t-transparent" />
            <h3 className="text-lg font-medium text-zinc-700">
              AI 正在分析你的笔记...
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              正在识别主题、分析论文关系、构建提纲结构
            </p>
            <div className="mt-8 w-full max-w-md">
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-[#1e3a5f]" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {generated && outline && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900">
              {outline.outline?.title || "综述提纲"}
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyToClipboard}>
                <Copy className="mr-2 h-4 w-4" />
                复制
              </Button>
              <Button
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
                onClick={downloadMarkdown}
              >
                <Download className="mr-2 h-4 w-4" />
                导出 Markdown
              </Button>
            </div>
          </div>

          <Card className="border-[#1e3a5f]/20 bg-blue-50">
            <CardContent className="py-4">
              <p className="text-sm leading-relaxed text-zinc-700">
                {outline.summary}
              </p>
            </CardContent>
          </Card>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-800">
              主题分组
            </h2>
            <div className="space-y-3">
              {outline.themes.map((theme, i) => (
                <Card key={i}>
                  <button
                    className="flex w-full items-center justify-between p-4 text-left"
                    onClick={() => toggleTheme(i)}
                  >
                    <div>
                      <h3 className="font-medium text-zinc-800">
                        {theme.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {theme.description}
                      </p>
                    </div>
                    {expandedThemes.has(i) ? (
                      <ChevronDown className="h-5 w-5 text-zinc-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-zinc-400" />
                    )}
                  </button>
                  {expandedThemes.has(i) && (
                    <CardContent className="space-y-3 border-t pt-4">
                      {theme.subTopics.map((sub, j) => (
                        <div key={j}>
                          <h4 className="text-sm font-medium text-zinc-700">
                            {sub.title}
                          </h4>
                          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-zinc-600">
                            {sub.keyPoints.map((point, k) => (
                              <li key={k}>{point}</li>
                            ))}
                          </ul>
                          {sub.relatedPapers.length > 0 && (
                            <p className="mt-1 text-xs text-zinc-400">
                              相关论文: {sub.relatedPapers.join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-800">
              论文关系
            </h2>
            <Card>
              <CardContent className="space-y-3 py-4">
                {outline.relationships.length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    尚未识别出论文之间的关系
                  </p>
                ) : (
                  outline.relationships.map((rel, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg bg-zinc-50 p-3"
                    >
                      <span className="text-lg">{getTypeIcon(rel.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-zinc-700">
                          {rel.paper1} ↔ {rel.paper2}
                        </p>
                        <p className="text-xs text-zinc-500">
                          <span className="font-medium text-zinc-600">
                            {getTypeLabel(rel.type)}
                          </span>
                          : {rel.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-800">
              综述提纲
            </h2>
            <div className="space-y-4">
              {outline.outline.sections.map((section, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e3a5f] text-xs text-white">
                        {i + 1}
                      </span>
                      <CardTitle className="text-lg">
                        {section.heading}
                      </CardTitle>
                    </div>
                    <CardDescription>{section.purpose}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-zinc-700">
                        关键论点
                      </h4>
                      <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-zinc-600">
                        {section.keyArguments.map((arg, j) => (
                          <li key={j}>{arg}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm text-zinc-500">
                      <span className="font-medium">引用:</span>{" "}
                      {section.citations.join(", ") || "待补充"}
                    </div>
                    {section.transitionToNext && (
                      <div className="rounded-md bg-zinc-50 p-3 text-sm italic text-zinc-500">
                        {section.transitionToNext}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-800">
              研究空白与建议
            </h2>
            <Card className="border-[#d97706]/20 bg-amber-50">
              <CardContent className="space-y-4 py-4">
                {outline.gaps.length === 0 ? (
                  <p className="text-sm text-amber-600">
                    笔记覆盖较为全面，暂未发现明显的研究空白
                  </p>
                ) : (
                  outline.gaps.map((gap, i) => (
                    <div key={i} className="rounded-lg bg-white p-4">
                      <h3 className="font-medium text-zinc-800">
                        {gap.area}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-600">
                        {gap.suggestion}
                      </p>
                      <p className="mt-1 text-xs text-amber-600">
                        {gap.reason}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
