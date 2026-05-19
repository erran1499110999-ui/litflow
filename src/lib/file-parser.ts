import mammoth from "mammoth";
import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";

export type SupportedFileType = "pdf" | "docx" | "md" | "txt" | "html";

export interface ParsedFileResult {
  filename: string;
  fileType: SupportedFileType;
  extractedText: string;
  fileSize: number;
}

const FILE_EXTENSION_MAP: Record<string, SupportedFileType | null> = {
  pdf: "pdf",
  docx: "docx",
  md: "md",
  markdown: "md",
  txt: "txt",
  html: "html",
  htm: "html",
};

export function detectFileType(filename: string): SupportedFileType | null {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  return FILE_EXTENSION_MAP[ext] || null;
}

export async function parseFile(
  fileBuffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<ParsedFileResult> {
  const fileType = detectFileType(filename);

  if (!fileType) {
    throw new Error("不支持的文件类型，仅支持 PDF / Word / Markdown / TXT / HTML");
  }

  let extractedText = "";

  switch (fileType) {
    case "pdf": {
      const parser = new PDFParse({ data: new Uint8Array(fileBuffer) });
      const result = await parser.getText();
      extractedText = cleanText(result.text || "");
      break;
    }

    case "docx": {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = cleanText(result.value || "");
      break;
    }

    case "md":
    case "txt": {
      extractedText = cleanText(fileBuffer.toString("utf-8"));
      break;
    }

    case "html": {
      const html = fileBuffer.toString("utf-8");
      const $ = cheerio.load(html);

      // 移除脚本和样式
      $("script, style, noscript").remove();

      // 优先提取 article/main/body
      const articleText = $("article").text().trim();
      const mainText = $("main").text().trim();
      const bodyText = $("body").text().trim();

      extractedText = cleanText(articleText || mainText || bodyText);
      break;
    }

    default:
      throw new Error("文件类型解析未实现");
  }

  if (!extractedText.trim()) {
    throw new Error("未能从文件中提取有效文本内容");
  }

  return {
    filename,
    fileType,
    extractedText,
    fileSize: fileBuffer.length,
  };
}

function cleanText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validateFileSize(fileSize: number, maxMB = 20): void {
  const maxBytes = maxMB * 1024 * 1024;
  if (fileSize > maxBytes) {
    throw new Error(`文件过大，单文件最大支持 ${maxMB}MB`);
  }
}

export function validateFileType(filename: string): void {
  const fileType = detectFileType(filename);
  if (!fileType) {
    throw new Error("不支持的文件格式，请上传 PDF / Word / Markdown / TXT / HTML 文件");
  }
}
