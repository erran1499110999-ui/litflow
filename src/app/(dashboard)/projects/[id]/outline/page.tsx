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
import {
  ArrowLeft,
  Download,
  Copy,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Check,
  BookOpen,
  Network,
  Lightbulb,
  FileText,
} from "lucide-react";
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
  const [expandedThemes, setExpandedThemes] = useState<Set<number>>(
    new Set([0])
  );
  const [streamText, setStreamText] = useState("");
  const [streamPhase, setStreamPhase] = useState<
    "connecting" | "analyzing" | "organizing" | "generating" | "done"
  >("connecting");
  const [copied, setCopied] = useState(false);

  const generateOutline = async () => {
    setLoading(true);
    setError(null);
    setStreamText("");
    setStreamPhase("connecting");

    const phases = [
      { phase: "connecting" as const, duration: 1000 },
      { phase: "analyzing" as const, duration: 3000 },
      { phase: "organizing" as const, duration: 3000 },
      { phase: "generating" as const, duration: 3000 },
    ];

    // 模拟流式进度动画
    for (const p of phases) {
      setStreamPhase(p.phase);
      await new Promise((r) => setTimeout(r, p.duration));
    }

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
        setStreamPhase("connecting");
        return;
      }

      setOutline(result.data.content);
      setRawMarkdown(result.data.raw_markdown);
      setGenerated(true);
      setStreamPhase("done");
    } catch (err) {
      setError("网络错误，请检查网络连接后重试");
      setStreamPhase("connecting");
    }

    setLoading(false);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      case "support":
        return "✅";
      case "contradict":
        return "⚠️";
      case "extend":
        return "🔗";
      case "complement":
        return "➕";
      default:
        return "•";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "support":
        return "支持";
      case "contradict":
        return "矛盾";
      case "extend":
        return "延伸";
      case "complement":
        return "补充";
      default:
        return type;
    }
  };

  const streamMessages = {
    connecting: {
      icon: Sparkles,
      title: "连接 DeepSeek AI...",
      desc: "正在建立安全连接",
      color: "text-primary-500",
    },
    analyzing: {
      icon: BookOpen,
      title: "分析你的文献笔记...",
      desc: "正在识别研究主题、提取关键论点",
      color: "text-primary-500",
    },
    organizing: {
      icon: Network,
      title: "整理论文关系...",
      desc: "正在分析观点支持/矛盾/补充关系",
      color: "text-spring-500",
    },
    generating: {
      icon: FileText,
      title: "构建综述提纲...",
      desc: "正在生成章节结构和引用建议",
      color: "text-primary-500",
    },
    done: {
      icon: Check,
      title: "生成完成！",
      desc: "提纲已准备就绪",
      color: "text-green-600",
    },
  };

  const currentMsg = streamMessages[streamPhase];
  const StreamIcon = currentMsg.icon;

  return (
    <div className="mx-auto max-w-4xl animate-fade-in-up">
      <Link
        href={`/projects/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        返回项目
      </Link>

      {/* 初始生成界面 */}
      {!generated && !loading && (
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
              <Sparkles className="h-8 w-8 text-primary-500" strokeWidth={1.5} />
            </div>
            <CardTitle
              className="text-2xl text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-noto-serif-sc)" }}
            >
              生成综述提纲
            </CardTitle>
            <CardDescription className="text-base mt-2">
              AI 将分析你所有的文献笔记，自动生成结构化的综述提纲
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">生成失败</p>
                  <p className="mt-0.5 text-xs text-red-500">{error}</p>
                  <p className="mt-1 text-xs text-red-400">
                    请确保已配置 DeepSeek API Key，或检查网络连接
                  </p>
                </div>
              </div>
            )}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-medium">⏱ 预计耗时约 10-30 秒</p>
              <p className="mt-1 text-xs text-amber-600">
                此过程将分析所有笔记的研究主题、论文关系，并构建综述章节结构
              </p>
            </div>
          </CardContent>
          <div className="flex justify-center pb-6">
            <Button
              size="lg"
              className="btn-spring text-base"
              onClick={generateOutline}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              开始生成
            </Button>
          </div>
        </Card>
      )}

      {/* 流式加载动画 */}
      {loading && (
        <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
          <CardContent className="flex flex-col items-center py-16">
            {/* 动态图标 */}
            <div
              className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 ${
                streamPhase === "done"
                  ? "bg-green-50 scale-110"
                  : "bg-primary-50"
              }`}
            >
              <StreamIcon
                className={`h-7 w-7 transition-all duration-300 ${
                  streamPhase === "done"
                    ? "text-green-500"
                    : streamPhase === "organizing"
                    ? currentMsg.color
                    : "text-primary-500"
                } ${streamPhase !== "done" ? "animate-pulse" : ""}`}
                strokeWidth={1.5}
              />
            </div>

            <h3
              className="text-lg font-medium text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-noto-serif-sc)" }}
            >
              {currentMsg.title}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {currentMsg.desc}
            </p>

            {/* 进度条 */}
            <div className="mt-8 w-full max-w-md">
              <div className="flex justify-between mb-2">
                {["连接", "分析", "整理", "生成"].map((label, i) => {
                  const phases = [
                    "connecting",
                    "analyzing",
                    "organizing",
                    "generating",
                  ];
                  const currentIndex = phases.indexOf(streamPhase);
                  const isDone = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  return (
                    <span
                      key={i}
                      className={`text-xs transition-colors ${
                        isDone
                          ? isCurrent
                            ? "text-primary-500 font-medium"
                            : "text-primary-500"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {isDone && i < currentIndex ? "✓ " : ""}
                      {label}
                    </span>
                  );
                })}
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-spring-500 transition-all duration-700"
                  style={{
                    width: `${
                      ((["connecting", "analyzing", "organizing", "generating"].indexOf(streamPhase) +
                        1) /
                        4) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 生成结果展示 */}
      {generated && outline && (
        <div className="space-y-8">
          {/* 页面顶部 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1
                className="text-2xl font-semibold text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-noto-serif-sc)" }}
              >
                {outline.outline?.title || "综述提纲"}
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                可编辑、可导出，AI 生成结果仅供参考
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="rounded-xl border-[var(--color-border)]"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    复制
                  </>
                )}
              </Button>
              <Button
                onClick={downloadMarkdown}
                className="btn-spring text-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                导出 Markdown
              </Button>
            </div>
          </div>

          {/* 总体评估 */}
          <Card className="border-primary-200 bg-primary-50 shadow-sm">
            <CardContent className="py-4">
              <p className="text-sm leading-relaxed text-[var(--color-text)]">
                {outline.summary}
              </p>
            </CardContent>
          </Card>

          {/* 主题分组 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                <BookOpen
                  className="h-4 w-4 text-primary-600"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-lg font-medium text-[var(--color-text)]">
                主题分组
              </h2>
            </div>
            <div className="space-y-3">
              {outline.themes.map((theme, i) => (
                <Card
                  key={i}
                  className="card-spring !p-0 overflow-hidden border-[var(--color-border)]"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <button
                    className="flex w-full items-center justify-between p-5 text-left"
                    onClick={() => toggleTheme(i)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-xs font-medium text-primary-600">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-medium text-[var(--color-text)]">
                          {theme.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                          {theme.description}
                        </p>
                      </div>
                    </div>
                    {expandedThemes.has(i) ? (
                      <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
                    )}
                  </button>
                  {expandedThemes.has(i) && (
                    <CardContent className="space-y-4 border-t border-[var(--color-border)] px-5 py-4">
                      {theme.subTopics.map((sub, j) => (
                        <div key={j}>
                          <h4 className="text-sm font-medium text-[var(--color-text)]">
                            {sub.title}
                          </h4>
                          <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-[var(--color-text-secondary)]">
                            {sub.keyPoints.map((point, k) => (
                              <li key={k}>{point}</li>
                            ))}
                          </ul>
                          {sub.relatedPapers.length > 0 && (
                            <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
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

          {/* 论文关系 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-spring-100">
                <Network
                  className="h-4 w-4 text-spring-600"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-lg font-medium text-[var(--color-text)]">
                论文关系
              </h2>
            </div>
            <Card className="border-[var(--color-border)]">
              <CardContent className="space-y-3 py-5">
                {outline.relationships.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    尚未识别出论文之间的关系
                  </p>
                ) : (
                  outline.relationships.map((rel, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl bg-[var(--color-bg)] p-3"
                    >
                      <span className="text-lg">{getTypeIcon(rel.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text)]">
                          {rel.paper1} ↔ {rel.paper2}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          <span className="font-medium text-primary-500">
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

          {/* 综述提纲 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
                <FileText
                  className="h-4 w-4 text-primary-600"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-lg font-medium text-[var(--color-text)]">
                综述提纲
              </h2>
            </div>
            <div className="space-y-4">
              {outline.outline.sections.map((section, i) => (
                <Card
                  key={i}
                  className="card-spring border-[var(--color-border)]"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100 text-xs font-medium text-primary-600">
                        {i + 1}
                      </span>
                      <div>
                        <CardTitle
                          className="text-base text-[var(--color-text)]"
                          style={{ fontFamily: "var(--font-noto-serif-sc)" }}
                        >
                          {section.heading}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {section.purpose}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                        关键论点
                      </h4>
                      <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-[var(--color-text-secondary)]">
                        {section.keyArguments.map((arg, j) => (
                          <li key={j}>{arg}</li>
                        ))}
                      </ul>
                    </div>
                    {section.citations.length > 0 && (
                      <div className="text-xs text-[var(--color-text-muted)]">
                        <span className="font-medium text-[var(--color-text-secondary)]">
                          引用:{" "}
                        </span>
                        {section.citations.join(", ")}
                      </div>
                    )}
                    {section.transitionToNext && (
                      <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-3 text-sm italic text-[var(--color-text-secondary)]">
                        💡 {section.transitionToNext}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 研究空白 */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <Lightbulb
                  className="h-4 w-4 text-amber-600"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-lg font-medium text-[var(--color-text)]">
                研究空白与建议
              </h2>
            </div>
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardContent className="space-y-4 py-5">
                {outline.gaps.length === 0 ? (
                  <p className="text-sm text-amber-700">
                    笔记覆盖较为全面，暂未发现明显的研究空白
                  </p>
                ) : (
                  outline.gaps.map((gap, i) => (
                    <div key={i} className="rounded-xl bg-white p-4 shadow-sm">
                      <h3 className="font-medium text-[var(--color-text)]">
                        {gap.area}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
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

          {/* 底部操作 */}
          <div className="flex items-center justify-center gap-4 pb-8">
            <Button
              variant="outline"
              className="rounded-xl border-[var(--color-border)]"
              onClick={() => {
                setGenerated(false);
                setOutline(null);
                setRawMarkdown("");
                setError(null);
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              重新生成
            </Button>
            <Button
              className="btn-spring"
              onClick={downloadMarkdown}
            >
              <Download className="mr-2 h-4 w-4" />
              下载 Markdown
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
