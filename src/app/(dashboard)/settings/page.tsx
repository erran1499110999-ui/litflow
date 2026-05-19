"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Key,
  Info,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-breathe rounded-full bg-primary-500/30" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up">
      <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-600">
        账号
      </span>
      <h1
        className="mt-3 text-2xl font-semibold text-[var(--color-text)] lg:text-3xl"
        style={{ fontFamily: "var(--font-noto-serif-sc)" }}
      >
        设置
      </h1>
      <div className="gradient-divider mt-6 mb-8" />

      {/* 账号信息卡片 */}
      <Card className="mb-6 border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <User className="h-5 w-5 text-primary-600" strokeWidth={1.5} />
            </div>
            <div>
              <CardTitle
                className="text-base text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-noto-serif-sc)" }}
              >
                账号信息
              </CardTitle>
              <CardDescription className="text-xs">
                你的账号信息由 Supabase Auth 管理
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
              邮箱
            </Label>
            <Input
              value={user?.email || ""}
              disabled
              className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Key className="h-3.5 w-3.5" strokeWidth={1.5} />
              用户 ID
            </Label>
            <Input
              value={user?.id || ""}
              disabled
              className="rounded-xl border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text-muted)]"
            />
          </div>
        </CardContent>
      </Card>

      {/* 关于 LitFlow */}
      <Card className="mb-6 border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-spring-100">
              <Info className="h-5 w-5 text-spring-600" strokeWidth={1.5} />
            </div>
            <div>
              <CardTitle
                className="text-base text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-noto-serif-sc)" }}
              >
                关于 LitFlow
              </CardTitle>
              <CardDescription className="text-xs">
                文献笔记 → 综述提纲助手
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--color-text-secondary)]">
          <p className="leading-relaxed">
            LitFlow 帮助研究生把散乱的文献阅读笔记，自动整理成结构化的综述提纲。
          </p>
          <div className="grid grid-cols-2 gap-px rounded-xl bg-[var(--color-border)] overflow-hidden">
            <div className="bg-[var(--color-bg)] p-3">
              <span className="text-[var(--color-text-muted)] text-xs">版本</span>
              <p className="text-[var(--color-text)] font-medium">2.4.0</p>
            </div>
            <div className="bg-[var(--color-bg)] p-3">
              <span className="text-[var(--color-text-muted)] text-xs">状态</span>
              <p className="text-spring-600 font-medium">Beta</p>
            </div>
            <div className="bg-[var(--color-bg)] p-3">
              <span className="text-[var(--color-text-muted)] text-xs">前端</span>
              <p className="text-[var(--color-text)] font-medium">Next.js</p>
            </div>
            <div className="bg-[var(--color-bg)] p-3">
              <span className="text-[var(--color-text-muted)] text-xs">后端</span>
              <p className="text-[var(--color-text)] font-medium">Supabase + DeepSeek</p>
            </div>
          </div>
          <a
            href="/changelog"
            className="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition-colors"
          >
            查看更新日志
            <ChevronRight className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>

      {/* 统计数据 */}
      <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <svg className="h-5 w-5 text-amber-600" strokeWidth={1.5} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 16l4-8 4 4 4-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <CardTitle
                className="text-base text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-noto-serif-sc)" }}
              >
                使用统计
              </CardTitle>
              <CardDescription className="text-xs">
                AI 生成限额与使用情况
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-[var(--color-bg)] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-text-secondary)]">
                今日 AI 生成次数
              </span>
              <span className="text-sm font-medium text-[var(--color-text)]">
                0 / 3
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div className="h-full w-0 rounded-full bg-spring-500" />
            </div>
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              每日最多生成 3 次提纲，防止 API 滥用
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
