import { NextRequest, NextResponse } from "next/server";
import {
  markdownToDocx,
  markdownToHtml,
  markdownToPdf,
  type ExportFormat,
} from "@/lib/file-exporter";

const MIME_TYPES: Record<ExportFormat, string> = {
  markdown: "text/markdown; charset=utf-8",
  html: "text/html; charset=utf-8",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
};

const EXTENSIONS: Record<ExportFormat, string> = {
  markdown: "md",
  html: "html",
  docx: "docx",
  pdf: "pdf",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const format = body?.format as ExportFormat | undefined;
    const title = (body?.title as string | undefined)?.trim() || "综述提纲";
    const markdown = (body?.markdown as string | undefined)?.trim() || "";

    if (!format || !["markdown", "html", "docx", "pdf"].includes(format)) {
      return NextResponse.json(
        { success: false, error: "不支持的导出格式" },
        { status: 400 }
      );
    }

    if (!markdown) {
      return NextResponse.json(
        { success: false, error: "缺少可导出的 Markdown 内容" },
        { status: 400 }
      );
    }

    let payload: Buffer | string;

    switch (format) {
      case "markdown":
        payload = markdown;
        break;
      case "html":
        payload = markdownToHtml(title, markdown);
        break;
      case "docx":
        payload = await markdownToDocx(title, markdown);
        break;
      case "pdf":
        payload = await markdownToPdf(title, markdown);
        break;
      default:
        return NextResponse.json(
          { success: false, error: "不支持的导出格式" },
          { status: 400 }
        );
    }

    const filename = `${sanitizeFilename(title)}.${EXTENSIONS[format]}`;

    const bodyPayload = typeof payload === "string" ? payload : new Uint8Array(payload);

    return new NextResponse(bodyPayload, {
      status: 200,
      headers: {
        "Content-Type": MIME_TYPES[format],
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "导出失败，请稍后重试";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

function sanitizeFilename(input: string) {
  return input.replace(/[\\/:*?"<>|]/g, "-").slice(0, 80) || "litflow-export";
}
