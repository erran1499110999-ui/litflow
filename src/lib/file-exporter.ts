import React from "react";
import {
  Document as DocxDocument,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import {
  Document as PdfDocument,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

export type ExportFormat = "markdown" | "html" | "docx" | "pdf";

type MarkdownBlock =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "bullet"; text: string }
  | { type: "quote"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "empty" };

export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  return markdown.split("\n").map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return { type: "empty" } as const;
    if (trimmed.startsWith("### ")) return { type: "h3", text: trimmed.slice(4) } as const;
    if (trimmed.startsWith("## ")) return { type: "h2", text: trimmed.slice(3) } as const;
    if (trimmed.startsWith("# ")) return { type: "h1", text: trimmed.slice(2) } as const;
    if (trimmed.startsWith("- ")) return { type: "bullet", text: trimmed.slice(2) } as const;
    if (trimmed.startsWith("> ")) return { type: "quote", text: trimmed.slice(2) } as const;
    return { type: "paragraph", text: trimmed } as const;
  });
}

export function markdownToHtml(title: string, markdown: string): string {
  const blocks = parseMarkdownBlocks(markdown);

  const body = blocks
    .map((block) => {
      switch (block.type) {
        case "h1":
          return `<h1>${escapeHtml(block.text)}</h1>`;
        case "h2":
          return `<h2>${escapeHtml(block.text)}</h2>`;
        case "h3":
          return `<h3>${escapeHtml(block.text)}</h3>`;
        case "bullet":
          return `<li>${escapeHtml(block.text)}</li>`;
        case "quote":
          return `<blockquote>${escapeHtml(block.text)}</blockquote>`;
        case "paragraph":
          return `<p>${escapeHtml(block.text)}</p>`;
        default:
          return "";
      }
    })
    .join("\n")
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; line-height: 1.8; color: #1f1a14; max-width: 820px; margin: 40px auto; padding: 0 24px; }
    h1, h2, h3 { color: #3d3228; }
    h1 { font-size: 2rem; margin-top: 2rem; }
    h2 { font-size: 1.5rem; margin-top: 1.75rem; }
    h3 { font-size: 1.2rem; margin-top: 1.25rem; }
    p { margin: 0.5rem 0; }
    ul { padding-left: 1.25rem; }
    blockquote { border-left: 3px solid #f97316; padding-left: 1rem; color: #5c4d3c; margin: 1rem 0; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

export async function markdownToDocx(title: string, markdown: string): Promise<Buffer> {
  const blocks = parseMarkdownBlocks(markdown);

  const children = blocks.flatMap((block) => {
    switch (block.type) {
      case "h1":
        return [new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_1 })];
      case "h2":
        return [new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_2 })];
      case "h3":
        return [new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_3 })];
      case "bullet":
        return [
          new Paragraph({
            text: block.text,
            bullet: { level: 0 },
          }),
        ];
      case "quote":
        return [
          new Paragraph({
            children: [new TextRun({ text: `“${block.text}”`, italics: true })],
            indent: { left: 720 },
          }),
        ];
      case "paragraph":
        return [new Paragraph({ text: block.text })];
      default:
        return [new Paragraph({ text: "" })];
    }
  });

  const doc = new DocxDocument({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const arrayBuffer = await Packer.toArrayBuffer(doc);
  return Buffer.from(arrayBuffer);
}

export async function markdownToPdf(title: string, markdown: string): Promise<Buffer> {
  const blocks = parseMarkdownBlocks(markdown);

  const styles = StyleSheet.create({
    page: {
      padding: 32,
      fontSize: 11,
      lineHeight: 1.7,
      color: "#1f1a14",
      fontFamily: "Helvetica",
    },
    h1: { fontSize: 22, marginBottom: 12, marginTop: 20 },
    h2: { fontSize: 18, marginBottom: 10, marginTop: 16 },
    h3: { fontSize: 14, marginBottom: 8, marginTop: 12 },
    p: { marginBottom: 8 },
    bulletRow: { flexDirection: "row", marginBottom: 4 },
    bulletDot: { width: 12 },
    quote: {
      marginVertical: 8,
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: "#f97316",
      color: "#5c4d3c",
    },
  });

  const children = blocks.map((block, index) => {
    switch (block.type) {
      case "h1":
        return React.createElement(Text, { key: index, style: styles.h1 }, block.text);
      case "h2":
        return React.createElement(Text, { key: index, style: styles.h2 }, block.text);
      case "h3":
        return React.createElement(Text, { key: index, style: styles.h3 }, block.text);
      case "bullet":
        return React.createElement(
          View,
          { key: index, style: styles.bulletRow },
          React.createElement(Text, { style: styles.bulletDot }, "•"),
          React.createElement(Text, null, block.text)
        );
      case "quote":
        return React.createElement(Text, { key: index, style: styles.quote }, block.text);
      case "paragraph":
        return React.createElement(Text, { key: index, style: styles.p }, block.text);
      default:
        return React.createElement(Text, { key: index, style: styles.p }, " ");
    }
  });

  const doc = React.createElement(
    PdfDocument,
    null,
    React.createElement(Page, { size: "A4", style: styles.page }, children)
  );

  return renderToBuffer(doc as any);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
