"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FileText, BookOpen, Trash2, Sparkles, FolderOpen } from "lucide-react";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newField, setNewField] = useState("");
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const fetchProjects = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("获取项目列表失败:", error);
      return;
    }
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.error("用户未登录");
      setCreating(false);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userData.user.id,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        field: newField.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error("创建项目失败:", error);
      setCreating(false);
      return;
    }

    setNewTitle("");
    setNewDescription("");
    setNewField("");
    setDialogOpen(false);
    setCreating(false);
    router.push(`/projects/${data.id}`);
  };

  const deleteProject = async (id: string) => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      console.error("删除项目失败:", error);
      return;
    }
    setDeleteConfirm(null);
    fetchProjects();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
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
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-600">
            研究课题
          </span>
          <h1
            className="mt-3 text-2xl font-semibold text-[var(--color-text)] lg:text-3xl"
            style={{ fontFamily: "var(--font-noto-serif-sc)" }}
          >
            我的项目
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            管理你的研究课题和文献笔记
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-spring text-sm">
              <Plus className="mr-1.5 h-4 w-4" />
              新建项目
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border-[var(--color-border)] bg-[var(--color-surface)]">
            <DialogHeader>
              <DialogTitle
                className="text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-noto-serif-sc)" }}
              >
                创建新项目
              </DialogTitle>
              <DialogDescription>
                创建一个研究课题，开始整理你的文献笔记
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm">
                  项目名称 *
                </Label>
                <Input
                  id="title"
                  placeholder="如：大语言模型在教育中的应用"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="rounded-xl border-[var(--color-border)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">
                  项目描述
                </Label>
                <Input
                  id="description"
                  placeholder="简单描述你的研究课题"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="rounded-xl border-[var(--color-border)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field" className="text-sm">
                  研究领域
                </Label>
                <Input
                  id="field"
                  placeholder="如：计算机科学/教育技术"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                  className="rounded-xl border-[var(--color-border)]"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl border-[var(--color-border)]"
              >
                取消
              </Button>
              <Button
                className="btn-spring"
                disabled={!newTitle.trim() || creating}
                onClick={createProject}
              >
                {creating ? "创建中..." : "创建项目"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        // 空状态
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] py-24 text-center">
          <div className="empty-state-graphic mb-6" />
          <h3 className="text-base font-medium text-[var(--color-text-secondary)]">
            还没有项目
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            创建第一个项目，开始整理你的文献笔记。AI 将帮你生成综述提纲。
          </p>
          <Button
            className="btn-spring mt-6 text-sm"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            创建项目
          </Button>
        </div>
      ) : (
        // 项目卡片网格
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <div
              key={project.id}
              className="group relative animate-stagger"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <Link href={`/projects/${project.id}`}>
                <Card className="card-spring h-full border-[var(--color-border)] bg-[var(--color-surface)]">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                        <BookOpen
                          className="h-5 w-5 text-primary-600"
                          strokeWidth={1.5}
                        />
                      </div>
                      <button
                        className="rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteConfirm(project.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-[var(--color-text-muted)] hover:text-red-500" />
                      </button>
                    </div>
                    <CardTitle
                      className="mt-3 text-lg text-[var(--color-text)]"
                      style={{ fontFamily: "var(--font-noto-serif-sc)" }}
                    >
                      {project.title}
                    </CardTitle>
                    {project.description && (
                      <CardDescription className="line-clamp-2 text-sm">
                        {project.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                        <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                        {project.note_count} 条笔记
                      </span>
                      {project.field && (
                        <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs text-primary-600">
                          {project.field}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      更新于 {formatDate(project.updated_at)}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 删除确认弹窗 */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="rounded-2xl border-[var(--color-border)] bg-[var(--color-surface)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--color-text)]">
              确认删除项目
            </DialogTitle>
            <DialogDescription>
              此操作不可撤销，项目及其所有笔记将被永久删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="rounded-xl border-[var(--color-border)]"
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteProject(deleteConfirm)}
              className="rounded-xl"
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
