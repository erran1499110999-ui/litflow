"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import type { Outline, Relationship } from "@/types";
import { Network, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function KnowledgeGraphPage() {
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [selectedOutline, setSelectedOutline] = useState<string | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { data, error } = await supabase
      .from("outlines")
      .select("*, projects:project_id(title)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOutlines(data as any);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedOutline) {
      const outline = outlines.find((o) => o.id === selectedOutline);
      if (outline?.content?.relationships) {
        setRelationships(outline.content.relationships);
      }
    } else {
      setRelationships([]);
    }
  }, [selectedOutline, outlines]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-breathe rounded-full bg-primary-500/30" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in-up">
      <span className="inline-block rounded-full bg-spring-50 px-4 py-1.5 text-xs font-medium text-spring-600">
        可视化
      </span>
      <h1
        className="mt-3 text-2xl font-semibold text-[var(--color-text)] lg:text-3xl"
        style={{ fontFamily: "var(--font-noto-serif-sc)" }}
      >
        知识图谱
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        直观查看论文之间的支持、矛盾、延伸和补充关系
      </p>
      <div className="gradient-divider mt-6 mb-8" />

      {outlines.length === 0 ? (
        /* 空状态 */
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] py-24 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bg)]">
            <Network className="h-8 w-8 text-[var(--color-text-muted)]" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-medium text-[var(--color-text-secondary)]">
            还没有知识图谱数据
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            先生成综述提纲后，论文关系会自动出现在这里
          </p>
          <Button asChild className="btn-spring mt-6 text-sm">
            <Link href="/projects">
              <Sparkles className="mr-1.5 h-4 w-4" />
              去我的项目
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 提纲选择 */}
          <div className="flex flex-wrap gap-3">
            {outlines.map((outline) => {
              const active = selectedOutline === outline.id;
              const hasRelations =
                (outline.content?.relationships?.length || 0) > 0;
              return (
                <button
                  key={outline.id}
                  onClick={() => setSelectedOutline(outline.id)}
                  className={`rounded-xl border-2 px-4 py-2.5 text-left transition-all ${
                    active
                      ? "border-spring-500 bg-spring-50"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-hover)]"
                  } ${!hasRelations && !active ? "opacity-40" : ""}`}
                >
                  <div className="text-sm font-medium text-[var(--color-text)]">
                    {(outline as any).projects?.title || "综述提纲"}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <span>{formatDate(outline.created_at)}</span>
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        hasRelations ? "bg-spring-500" : "bg-[var(--color-text-muted)]"
                      }`}
                    />
                    <span>
                      {outline.content?.relationships?.length || 0} 条关系
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 默认选中最新有关系的提纲 */}
          {!selectedOutline && outlines.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              <p className="font-medium">💡 请选择一个提纲查看知识图谱</p>
              <p className="mt-1 text-xs text-amber-600">
                不同的提纲包含不同的论文关系数据
              </p>
            </div>
          )}

          {/* 知识图谱 */}
          {selectedOutline && (
            <KnowledgeGraph relationships={relationships} />
          )}
        </div>
      )}
    </div>
  );
}
