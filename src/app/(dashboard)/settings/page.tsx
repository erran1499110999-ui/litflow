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

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-2xl font-bold text-zinc-900">设置</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>账号信息</CardTitle>
          <CardDescription>
            你的账号信息由 Supabase Auth 管理
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>邮箱</Label>
            <Input value={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>用户 ID</Label>
            <Input value={user?.id || ""} disabled className="text-xs" />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>关于 LitFlow</CardTitle>
          <CardDescription>
            文献笔记→综述提纲助手
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-600">
          <p>
            LitFlow 帮助研究生把散乱的文献阅读笔记，自动整理成结构化的综述提纲。
          </p>
          <p>
            版本: 0.1.0 (Beta)
          </p>
          <p>
            技术栈: Next.js + Supabase + DeepSeek
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
