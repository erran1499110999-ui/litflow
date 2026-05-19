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
import { Plus, FileText } from "lucide-react";
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a5f] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">我的项目</h1>
          <p className="mt-1 text-zinc-500">
            管理你的研究课题和文献笔记
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
              <Plus className="mr-2 h-4 w-4" />
              新建项目
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新项目</DialogTitle>
              <DialogDescription>
                创建一个研究课题，开始整理你的文献笔记
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">项目名称 *</Label>
                <Input
                  id="title"
                  placeholder="如：大语言模型在教育中的应用"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">项目描述</Label>
                <Input
                  id="description"
                  placeholder="简单描述你的研究课题"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field">研究领域</Label>
                <Input
                  id="field"
                  placeholder="如：计算机科学/教育技术"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
                disabled={!newTitle.trim() || creating}
                onClick={createProject}
              >
                {creating ? "创建中..." : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-20 text-center">
          <FileText className="mb-4 h-12 w-12 text-zinc-300" />
          <h3 className="text-lg font-medium text-zinc-600">还没有项目</h3>
          <p className="mt-1 text-sm text-zinc-400">
            创建第一个项目，开始整理你的文献笔记
          </p>
          <Button
            className="mt-6 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            创建项目
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span>{project.note_count} 条笔记</span>
                    {project.field && (
                      <>
                        <span>·</span>
                        <span>{project.field}</span>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-zinc-400">
                  更新于 {formatDate(project.updated_at)}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              此操作不可撤销，项目及其所有笔记将被永久删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteProject(deleteConfirm)}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
