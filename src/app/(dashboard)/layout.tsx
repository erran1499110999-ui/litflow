"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  GitCommit,
  Network,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/projects", label: "我的项目", icon: BookOpen },
  { href: "/knowledge-graph", label: "知识图谱", icon: Network },
  { href: "/changelog", label: "更新日志", icon: GitCommit },
  { href: "/settings", label: "设置", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const init = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-breathe rounded-full bg-primary-500/30" />
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === "/projects") {
      return pathname === "/projects" || pathname.startsWith("/projects/");
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* 手机端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== 侧边栏 ===== */}
      <aside
        className={`sidebar-glass fixed inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/projects"
            className="text-xl font-bold tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            LitFlow
          </Link>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>

        <div className="gradient-divider mx-4" />

        {/* 导航 */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary-50 text-primary-600"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="gradient-divider mx-4" />

        {/* 用户信息 */}
        <div className="p-4">
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-sm font-medium text-primary-600">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 truncate text-sm text-[var(--color-text-secondary)]">
              {user?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            退出登录
          </button>
        </div>
      </aside>

      {/* ===== 主内容区 ===== */}
      <div className="flex flex-1 flex-col">
        {/* 顶部导航（手机端） */}
        <header className="nav-glass flex h-16 items-center gap-4 px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-[var(--color-text)]" />
          </button>
          <span
            className="text-lg font-bold tracking-tight text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            LitFlow
          </span>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
