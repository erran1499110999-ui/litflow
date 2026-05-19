"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Undo,
  Redo,
} from "lucide-react";
import { useState, useCallback } from "react";

interface NoteEditorProps {
  content: string;
  onChange: (text: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function NoteEditor({
  content,
  onChange,
  placeholder = "输入你的笔记内容，支持 Markdown 格式...",
  minHeight = "220px",
}: NoteEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-primary-600 underline underline-offset-2 hover:text-primary-700",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getText({ blockSeparator: "\n\n" }));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[var(--min-height)] px-4 py-3 leading-relaxed",
        style: `--min-height: ${minHeight}`,
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    if (linkUrl) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  if (!editor) {
    return (
      <div
        className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]"
        style={{ minHeight }}
      />
    );
  }

  const ToolButton = ({
    onClick,
    active,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg p-1.5 transition-all ${
        active
          ? "bg-primary-100 text-primary-600"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </button>
  );

  const ToolDivider = () => (
    <div className="mx-0.5 h-5 w-px bg-[var(--color-border)]" />
  );

  return (
    <div className="tiptap-editor rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5">
        <ToolButton
          title="加粗"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" strokeWidth={2} />
        </ToolButton>
        <ToolButton
          title="斜体"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" strokeWidth={2} />
        </ToolButton>
        <ToolButton
          title="下划线"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <UnderlineIcon className="h-4 w-4" strokeWidth={2} />
        </ToolButton>
        <ToolButton
          title="删除线"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        >
          <Strikethrough className="h-4 w-4" strokeWidth={2} />
        </ToolButton>

        <ToolDivider />

        <ToolButton
          title="标题 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 className="h-4 w-4" strokeWidth={2} />
        </ToolButton>
        <ToolButton
          title="标题 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" strokeWidth={2} />
        </ToolButton>
        <ToolButton
          title="标题 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="h-4 w-4" strokeWidth={2} />
        </ToolButton>

        <ToolDivider />

        <ToolButton
          title="无序列表"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List className="h-4 w-4" strokeWidth={2} />
        </ToolButton>
        <ToolButton
          title="有序列表"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          <ListOrdered className="h-4 w-4" strokeWidth={2} />
        </ToolButton>
        <ToolButton
          title="引用"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          <Quote className="h-4 w-4" strokeWidth={2} />
        </ToolButton>
        <ToolButton
          title="代码块"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
        >
          <Code className="h-4 w-4" strokeWidth={2} />
        </ToolButton>

        <ToolDivider />

        <div className="relative">
          <ToolButton
            title="插入链接"
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run();
              } else {
                setShowLinkInput(!showLinkInput);
              }
            }}
            active={editor.isActive("link")}
          >
            <LinkIcon className="h-4 w-4" strokeWidth={2} />
          </ToolButton>
          {showLinkInput && (
            <div className="absolute left-0 top-full z-10 mt-1 flex gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-lg animate-fade-in-up">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="输入 URL..."
                className="w-48 rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
                onKeyDown={(e) => e.key === "Enter" && setLink()}
                autoFocus
              />
              <button
                type="button"
                onClick={setLink}
                className="rounded-lg bg-primary-500 px-2 py-1 text-xs text-white"
              >
                确定
              </button>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <ToolButton
            title="撤销"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="h-4 w-4" strokeWidth={2} />
          </ToolButton>
          <ToolButton
            title="重做"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="h-4 w-4" strokeWidth={2} />
          </ToolButton>
        </div>
      </div>

      {/* 编辑器内容区 */}
      <EditorContent editor={editor} />
    </div>
  );
}
