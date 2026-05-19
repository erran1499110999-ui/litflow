import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Sparkles, Share2, ChevronRight, BookOpen, Brain, Download } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <h1 className="text-xl font-bold text-[#1e3a5f]">LitFlow</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-zinc-600 hover:text-zinc-800"
            >
              登录
            </Link>
            <Button asChild className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90">
              <Link href="/register">免费开始</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-zinc-50 py-20 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm text-[#1e3a5f]">
            <Sparkles className="h-4 w-4" />
            AI 驱动的文献综述助手
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-zinc-900 lg:text-5xl">
            把散乱的文献笔记
            <br />
            <span className="text-[#d97706]">变成结构化的综述提纲</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-500">
            专为研究生设计。记录阅读论文时的摘录与想法，AI 自动分析、归类、
            生成综述提纲，让文献综述不再是烦恼。
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-[#1e3a5f] px-8 text-base hover:bg-[#1e3a5f]/90"
            >
              <Link href="/register">
                开始使用
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base">
              <Link href="/login">已有账号？登录</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold text-zinc-900">
            三个步骤，完成文献综述
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-0 bg-zinc-50 shadow-sm">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1e3a5f] text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">1. 记录笔记</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-zinc-500">
                在读论文时随手记录摘录、想法和疑问。标注来源和标签，让每一条笔记都有价值。
              </CardContent>
            </Card>

            <Card className="border-0 bg-zinc-50 shadow-sm">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#d97706] text-white">
                  <Brain className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">2. AI 分析</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-zinc-500">
                积累 10 条以上笔记后，AI 自动分析内容，识别研究主题、论文关系和研究空白。
              </CardContent>
            </Card>

            <Card className="border-0 bg-zinc-50 shadow-sm">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-600 text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">3. 生成提纲</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-zinc-500">
                获取结构化的综述提纲，包含主题分组、论文关系图和章节要点。可编辑、可导出。
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold text-zinc-900">
            AI 生成的提纲包含什么？
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Share2,
                title: "主题分组",
                desc: "笔记自动归入不同研究主题，每个主题含关键论点与相关论文",
              },
              {
                icon: Sparkles,
                title: "论文关系图",
                desc: "识别哪些论文观点一致、哪些存在矛盾、哪些相互补充",
              },
              {
                icon: FileText,
                title: "综述提纲",
                desc: "包含章节结构、每节目的、关键论点和引用建议",
              },
              {
                icon: Download,
                title: "研究空白提示",
                desc: "分析哪些方向笔记不足，建议补充哪些文献",
              },
            ].map((item, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardHeader>
                  <item.icon className="mb-2 h-8 w-8 text-[#1e3a5f]" />
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-zinc-500">
                  {item.desc}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900">
            常见问题
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "需要多少条笔记才能生成提纲？",
                a: "建议至少积累 10 条笔记。笔记越多，AI 分析越准确，生成的提纲也更有深度。",
              },
              {
                q: "LitFlow 适合哪些学科？",
                a: "适合所有需要写文献综述的学科。AI 会根据你笔记的实际内容进行分析，不限定特定领域。",
              },
              {
                q: "AI 生成的提纲可以直接使用吗？",
                a: "AI 生成的是结构化提纲和建议，建议作为起点进行编辑和完善。你可以自由调整结构、补充论点。",
              },
              {
                q: "我的数据安全吗？",
                a: "笔记数据存储在 Supabase（PostgreSQL）中，采用行级安全策略，只有你自己能访问。AI 分析通过 DeepSeek API 进行，不会用于训练模型。",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-lg border p-5">
                <h3 className="font-medium text-zinc-900">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1e3a5f] py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold text-white">
            开始你的文献综述之旅
          </h2>
          <p className="mt-4 text-blue-200">
            免费使用，无需信用卡。今天就开始记录笔记吧。
          </p>
          <Button
            size="lg"
            asChild
            className="mt-8 bg-[#d97706] px-8 text-base hover:bg-[#d97706]/90"
          >
            <Link href="/register">免费开始使用</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-zinc-400">
          <p>LitFlow &copy; {new Date().getFullYear()} · 文献笔记→综述提纲助手</p>
        </div>
      </footer>
    </div>
  );
}
