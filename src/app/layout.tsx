import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "LitFlow - 文献笔记→综述提纲助手",
  description:
    "帮助研究生把散乱的文献阅读笔记，自动整理成结构化的综述提纲。支持AI分析、主题归类、研究空白识别。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
