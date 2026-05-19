"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, FileType2, Globe, Printer, RefreshCw } from "lucide-react";
import type { Outline } from "@/types";

const EXPORT_OPTIONS = [
  {
    format: "markdown",
    title: "Markdown",
    desc: "最适合二次编辑与 Git/Obsidian/Typora 使用",
    icon: FileText,
    className: "bg-primary-50 text-primary-600",
  },
  {
    format: "docx",
    title: "Word 文档",
    desc: "适合交给导师或继续在 Word 中修改",
    icon: FileType2,
    className: "bg-spring-50 text-spring-600",
  },
  {
    format: "html",
    title: "HTML 页面",
    desc: "适合浏览器展示与网页归档",
    icon: Globe,
    className: "bg-amber-50 text-amber-600",
  },
  {
    format: "pdf",
    title: "PDF 文档",
    desc: "适合固定版式分享与打印",
    icon: Printer,
    className: "bg-primary-50 text-primary-600",
  },
] as const;

export default function ExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOutlines = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("outlines")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        setError("获取提纲记录失败");
      }

      const result = (data || []) as Outline[];
      setOutlines(result);
      setSelectedId(result[0]?.id || "");
      setLoading(false);
    };

    fetchOutlines();
  }, [id]);

  const selectedOutline = useMemo(
    () => outlines.find((item) => item.id === selectedId) || null,
    [outlines, selectedId]
  );

  const handleExport = async (format: "markdown" | "docx" | "html" | "pdf") => {
    if (!selectedOutline?.raw_markdown) {
      setError("没有可导出的提纲内容");
      return;
    }

    setExporting(format);
    setError(null);

    try {
      const response = await fetch("/api/files/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          title: selectedOutline.content?.outline?.title || "综述提纲",
          markdown: selectedOutline.raw_markdown,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "导出失败");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename\*=UTF-8''([^;]+)/);
      const filename = match ? decodeURIComponent(match[1]) : `outline.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "导出失败");
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-breathe rounded-full bg-primary-500/30" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in-up">
      <Link
        href={`/projects/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
      >
        <ArrowLeft className="h-4 w-4" />
        返回项目
      </Link>

      <div className="mb-8">
        <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-600">
          导出中心
        </span>
        <h1
          className="mt-3 text-2xl font-semibold text-[var(--color-text)] lg:text-3xl"
          style={{ fontFamily: "var(--font-noto-serif-sc)" }}
        >
          多格式导出
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          将生成的综述提纲导出为 Markdown、Word、HTML 或 PDF。
        </p>
      </div>

      <Card className="mb-6 border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-[var(--color-text)]">选择提纲版本</CardTitle>
          <CardDescription>导出前先选择要使用的提纲记录。</CardDescription>
        </CardHeader>
        <CardContent>
          {outlines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-sm text-[var(--color-text-muted)]">
              还没有可导出的提纲，请先在项目中生成综述提纲。
            </div>
          ) : (
            <div className="space-y-2">
              {outlines.map((outline) => {
                const active = outline.id === selectedId;
                return (
                  <button
                    key={outline.id}
                    type="button"
                    onClick={() => setSelectedId(outline.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                      active
                        ? "border-primary-500 bg-primary-50"
                        : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                    }`}
                  >
                    <div className="text-sm font-medium text-[var(--color-text)]">
                      {outline.content?.outline?.title || "综述提纲"}
                    </div>
                    <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                      生成时间：{new Date(outline.created_at).toLocaleString("zh-CN")}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {EXPORT_OPTIONS.map((option) => {
          const Icon = option.icon;
          const disabled = !selectedOutline || exporting !== null;
          return (
            <Card key={option.format} className="card-spring border-[var(--color-border)] bg-[var(--color-surface)]">
              <CardHeader className="pb-3">
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${option.className}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <CardTitle className="text-base text-[var(--color-text)]">{option.title}</CardTitle>
                <CardDescription className="text-sm">{option.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="btn-spring w-full text-sm"
                  disabled={disabled}
                  onClick={() => handleExport(option.format)}
                >
                  {exporting === option.format ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      导出中...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      导出 {option.title}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
