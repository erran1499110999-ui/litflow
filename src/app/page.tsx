import Link from "next/link";
import {
  BookOpen,
  Brain,
  FileText,
  Download,
  Sparkles,
  ChevronRight,
  Quote,
  Layout,
  Network,
  Lightbulb,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ===== 导航栏 ===== */}
      <header className="nav-glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              LitFlow
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]"
            >
              登录
            </Link>
            <Link href="/register" className="btn-spring text-sm">
              免费开始
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== Hero 区域 ===== */}
      <section className="relative min-h-[90vh] overflow-hidden">
        {/* 装饰圆 */}
        <div className="deco-circle-top" />
        <div className="deco-circle-bottom" />

        <div className="relative mx-auto flex min-h-[90vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
          {/* 徽章 */}
          <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-2 text-sm text-[var(--color-text-secondary)] shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary-500" />
            AI 驱动的学术文献综述助手
          </div>

          {/* 主标题 */}
          <h1
            className="animate-fade-in-up max-w-4xl text-4xl font-semibold leading-[1.15] tracking-tight text-[var(--color-text)] lg:text-6xl"
            style={{ fontFamily: "var(--font-noto-serif-sc)" }}
          >
            把散乱的文献笔记
            <br />
            <span className="text-primary-500">变成结构化的综述提纲</span>
          </h1>

          {/* 副标题 */}
          <p className="animate-fade-in-up mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
            专为研究生设计。在读论文时随手记录摘录与想法，
            <br className="hidden sm:block" />
            AI 自动分析归类、识别研究空白、生成综述提纲。
          </p>

          {/* CTA 按钮 */}
          <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/register" className="btn-spring text-base">
              免费开始使用
              <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-border-hover)] hover:text-[var(--color-text)]"
            >
              已有账号？登录
            </Link>
          </div>

          {/* 数据统计 */}
          <div className="animate-fade-in-up mt-16 grid grid-cols-3 gap-8 border-t border-[var(--color-border)] pt-8 text-center">
            {[
              { label: "秒级生成", value: "< 30s" },
              { label: "笔记积累", value: "≥ 10 条" },
              { label: "免费使用", value: "¥0" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-2xl font-semibold text-primary-500"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 三步流程 ===== */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-spring-50 px-4 py-1.5 text-xs font-medium text-spring-600">
              三步完成
            </span>
            <h2
              className="mt-4 text-3xl font-semibold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-noto-serif-sc)" }}
            >
              从笔记到提纲，只需三个步骤
            </h2>
            <div className="gradient-divider mx-auto max-w-xs" />
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: BookOpen,
                title: "记录笔记",
                desc: "在读论文时随手记录摘录、想法和疑问。标注来源和标签，让每一条笔记都有价值。",
                color: "text-primary-500",
                bgColor: "bg-primary-50",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI 分析",
                desc: "积累 10 条以上笔记后，AI 自动分析内容，识别研究主题、论文关系和研究空白。",
                color: "text-spring-500",
                bgColor: "bg-spring-50",
              },
              {
                step: "03",
                icon: FileText,
                title: "生成提纲",
                desc: "获取结构化的综述提纲，包含主题分组、论文关系图和章节要点。可编辑、可导出。",
                color: "text-primary-500",
                bgColor: "bg-primary-50",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card-spring stagger-delay-1 animate-stagger group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span
                  className="mb-6 inline-block text-5xl font-bold"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    color: "var(--color-text-muted)",
                    opacity: 0.3,
                  }}
                >
                  {item.step}
                </span>
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${item.bgColor} ${item.color}`}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-[var(--color-text)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI 能力展示 ===== */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-600">
              AI 能力
            </span>
            <h2
              className="mt-4 text-3xl font-semibold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-noto-serif-sc)" }}
            >
              AI 生成的提纲包含什么？
            </h2>
            <div className="gradient-divider mx-auto max-w-xs" />
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Layout,
                title: "主题分组",
                desc: "笔记自动归入不同研究主题，每个主题含关键论点与相关论文",
                color: "text-primary-500",
              },
              {
                icon: Network,
                title: "论文关系",
                desc: "识别哪些论文观点一致、哪些存在矛盾、哪些相互补充",
                color: "text-spring-500",
              },
              {
                icon: Quote,
                title: "综述提纲",
                desc: "包含章节结构、每节目的、关键论点和引用建议",
                color: "text-primary-500",
              },
              {
                icon: Lightbulb,
                title: "研究空白",
                desc: "分析哪些方向笔记不足，建议补充哪些文献",
                color: "text-spring-500",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="card-spring stagger-delay-1 animate-stagger"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <item.icon
                  className={`mb-4 h-8 w-8 ${item.color}`}
                  strokeWidth={1.5}
                />
                <h3 className="mb-2 font-medium text-[var(--color-text)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <span className="inline-block rounded-full bg-spring-50 px-4 py-1.5 text-xs font-medium text-spring-600">
              FAQ
            </span>
            <h2
              className="mt-4 text-3xl font-semibold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-noto-serif-sc)" }}
            >
              常见问题
            </h2>
            <div className="gradient-divider mx-auto max-w-xs" />
          </div>

          <div className="mt-14 space-y-4">
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
              <details
                key={i}
                className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] transition-all hover:border-primary-200"
              >
                <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-medium text-[var(--color-text)]">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="border-t border-[var(--color-border)] px-6 py-4">
                  <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden py-20">
        <div className="deco-circle-top opacity-50" />
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2
            className="text-3xl font-semibold text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-noto-serif-sc)" }}
          >
            开始你的文献综述之旅
          </h2>
          <p className="mt-4 text-[var(--color-text-secondary)]">
            免费使用，无需信用卡。今天就开始记录笔记吧。
          </p>
          <div className="gradient-divider mx-auto max-w-xs" />
          <Link href="/register" className="btn-spring mt-4 inline-flex text-base">
            免费开始使用
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              LitFlow
            </span>
          </Link>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            文献笔记 → 综述提纲助手 &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
