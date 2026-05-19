import type { Metadata } from "next";
import { Playfair_Display, Inter, Noto_Serif_SC } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// 英文标题：Playfair Display（优雅衬线，学术感）
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
});

// 英文正文：Inter（清晰无衬线）
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// 中文标题：Noto Serif SC（宋体风格，学术品位）
const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif-sc",
});

export const metadata: Metadata = {
  title: "LitFlow - 文献笔记 → 综述提纲助手",
  description:
    "帮助研究生把散乱的文献阅读笔记，自动整理成结构化的综述提纲。支持AI分析、主题归类、研究空白识别。",
  keywords: ["文献综述", "论文写作", "AI助手", "文献管理", "研究生工具"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${inter.variable} ${notoSerifSC.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
