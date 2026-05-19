"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "邮箱或密码错误"
          : error.message === "Email not confirmed"
            ? "邮箱尚未验证，请查收验证邮件"
            : error.message
      );
      setLoading(false);
      return;
    }

    const redirect = searchParams.get("redirect") || "/projects";
    router.push(redirect);
    router.refresh();
  };

  return (
    <form onSubmit={handleLogin}>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "登录中..." : "登录"}
        </Button>
        <p className="text-sm text-zinc-500">
          还没有账号？{" "}
          <Link href="/register" className="text-[#1e3a5f] hover:underline">
            注册
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mb-4 inline-block">
            <h1 className="text-3xl font-bold text-[#1e3a5f]">LitFlow</h1>
          </Link>
          <CardTitle className="text-2xl">登录</CardTitle>
          <CardDescription>欢迎回来，继续你的文献综述</CardDescription>
        </CardHeader>
        <Suspense fallback={<div className="p-6 text-center text-zinc-500">加载中...</div>}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
