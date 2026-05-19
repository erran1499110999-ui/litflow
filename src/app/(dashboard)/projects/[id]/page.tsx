"use client";

import { useEffect, useState, use } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, ArrowLeft, Trash2, Edit3, FileText, Sparkles } from "lucide-react";
import type { Project, Note } from "@/types";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  const fetchProjectData = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (!projectData) {
      router.push("/projects");
      return;
    }
    setProject(projectData);

    const { data: notesData } = await supabase
      .from("notes")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    setNotes(notesData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const deleteNote = async (noteId: string) => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();

    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    if (!error) {
      await supabase
        .from("projects")
        .update({ note_count: notes.length - 1 })
        .eq("id", id);
      setDeleteConfirm(null);
      fetchProjectData();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case "excerpt":
        return "摘录";
      case "thought":
        return "想法";
      case "question":
        return "疑问";
      default:
        return type;
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case "excerpt":
        return "bg-blue-100 text-blue-700";
      case "thought":
        return "bg-amber-100 text-amber-700";
      case "question":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-zinc-100 text-zinc-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a5f] border-t-transparent" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          href="/projects"
          className="mb-4 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回项目列表
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {project.title}
            </h1>
            {project.description && (
              <p className="mt-1 text-zinc-500">{project.description}</p>
            )}
          </div>
          <Button asChild className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
            <Link href={`/projects/${id}/notes/new`}>
              <Plus className="mr-2 h-4 w-4" />
              添加笔记
            </Link>
          </Button>
        </div>
      </div>

      {notes.length >= 10 ? (
        <Card className="mb-8 border-[#d97706]/20 bg-amber-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#d97706]" />
              <p className="text-sm text-zinc-700">
                已积累 {notes.length} 条笔记，可以生成综述提纲了！
              </p>
            </div>
            <Button asChild className="bg-[#d97706] hover:bg-[#d97706]/90">
              <Link href={`/projects/${id}/outline`}>
                <FileText className="mr-2 h-4 w-4" />
                生成综述提纲
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-zinc-200 bg-zinc-50">
          <CardContent className="py-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-zinc-600">
                还需 {10 - notes.length} 条笔记即可生成综述提纲
              </p>
              <span className="text-xs text-zinc-400">
                {notes.length}/10
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-[#1e3a5f] transition-all"
                style={{ width: `${(notes.length / 10) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-800">
          文献笔记 ({notes.length})
        </h2>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 text-center">
            <FileText className="mb-4 h-10 w-10 text-zinc-300" />
            <h3 className="text-base font-medium text-zinc-600">
              还没有笔记
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              添加你的第一篇文献笔记
            </p>
            <Button
              asChild
              className="mt-4 bg-[#1e3a5f] hover:bg-[#1e3a5f]/90"
            >
              <Link href={`/projects/${id}/notes/new`}>
                <Plus className="mr-2 h-4 w-4" />
                添加笔记
              </Link>
            </Button>
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getNoteTypeColor(note.note_type)}`}
                    >
                      {getNoteTypeLabel(note.note_type)}
                    </span>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {}}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => setDeleteConfirm(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="mt-2 text-base font-normal leading-relaxed">
                  {note.content}
                </CardTitle>
                {(note.paper_title || note.paper_authors) && (
                  <CardDescription className="mt-1">
                    {note.paper_title && (
                      <span className="font-medium">{note.paper_title}</span>
                    )}
                    {note.paper_authors && (
                      <span>
                        {" "}
                        — {note.paper_authors}
                        {note.paper_year && `, ${note.paper_year}`}
                      </span>
                    )}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-zinc-400">
                  {formatDate(note.created_at)}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除笔记</DialogTitle>
            <DialogDescription>
              此操作不可撤销，该笔记将被永久删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteNote(deleteConfirm)}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
