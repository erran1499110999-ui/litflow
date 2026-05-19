"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";

interface FileDropZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: Record<string, string[]>;
  hint?: string;
}

export default function FileDropZone({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 20,
  accept = {
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "text/markdown": [".md"],
    "text/plain": [".txt"],
    "text/html": [".html"],
  },
  hint = "支持 PDF / Word / Markdown / TXT / HTML",
}: FileDropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const nextFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      onFilesChange(nextFiles);
    },
    [files, maxFiles, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
    accept,
  });

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragActive
            ? "border-primary-500 bg-primary-50 scale-[0.99]"
            : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
        }`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`mx-auto mb-3 h-8 w-8 ${
            isDragActive
              ? "text-primary-500"
              : "text-[var(--color-text-muted)]"
          }`}
          strokeWidth={1.5}
        />
        <p className="text-sm text-[var(--color-text-secondary)]">
          {isDragActive ? "松开即可上传" : "拖拽文件到此处，或点击上传"}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          单文件 ≤ {maxSizeMB}MB，最多 {maxFiles} 个文件
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 animate-fade-in-up"
            >
              <div className="flex items-center gap-3 text-sm">
                <FileText
                  className="h-4 w-4 text-[var(--color-text-muted)]"
                  strokeWidth={1.5}
                />
                <span className="text-[var(--color-text)]">{file.name}</span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-[var(--color-text-muted)] transition-colors hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
