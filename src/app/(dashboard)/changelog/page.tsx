import fs from "fs";
import path from "path";

export default function ChangelogPage() {
  // 在服务端读取 CHANGELOG.md
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
  let content = "";

  try {
    content = fs.readFileSync(changelogPath, "utf-8");
  } catch {
    content = "# 更新日志\n\n暂无更新记录。";
  }

  // 将 Markdown 简单渲染为 HTML（纯文本版本，保持风格一致）
  const lines = content.split("\n");
  const renderedLines = lines.map((line) => {
    if (line.startsWith("# ")) {
      return {
        type: "h1" as const,
        text: line.replace("# ", ""),
      };
    }
    if (line.startsWith("## ")) {
      const versionMatch = line.match(/\[v([\d.]+)\]/);
      const dateMatch = line.match(/- (\d{4}-\d{2}-\d{2})/);
      return {
        type: "h2" as const,
        text: line.replace("## ", ""),
        version: versionMatch?.[1],
        date: dateMatch?.[1],
      };
    }
    if (line.startsWith("### ")) {
      return {
        type: "h3" as const,
        text: line.replace("### ", ""),
      };
    }
    if (line.startsWith("- ")) {
      return {
        type: "li" as const,
        text: line.replace("- ", ""),
      };
    }
    if (line.startsWith("---")) {
      return { type: "hr" as const, text: "" };
    }
    if (line.trim() === "") {
      return { type: "empty" as const, text: "" };
    }
    return { type: "text" as const, text: line };
  });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 animate-fade-in-up">
        <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-600">
          更新记录
        </span>
        <h1
          className="mt-3 text-3xl font-semibold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-noto-serif-sc)" }}
        >
          更新日志
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          LitFlow 的每一次改进，都为了让你的文献综述更顺畅。
        </p>
        <div className="gradient-divider mt-6" />
      </div>

      <div className="space-y-8">
        {(() => {
          const sections: {
            version?: string;
            date?: string;
            items: { type: string; text: string }[];
          }[] = [];
          let currentSection: (typeof sections)[0] | null = null;

          renderedLines.forEach((line) => {
            if (line.type === "h2") {
              if (currentSection) sections.push(currentSection);
              currentSection = {
                version: line.version,
                date: line.date,
                items: [],
              };
            } else if (line.type === "hr") {
              if (currentSection) sections.push(currentSection);
              currentSection = null;
            } else if (currentSection) {
              currentSection.items.push(line);
            }
          });
          if (currentSection) sections.push(currentSection);

          return sections.map((section, i) => (
            <div
              key={i}
              className="card-spring stagger-delay-1 animate-stagger"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* 版本号 + 日期 */}
              <div className="mb-4 flex items-baseline justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="text-lg font-semibold text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    v{section.version}
                  </span>
                  {section.date && (
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {section.date}
                    </span>
                  )}
                </div>
              </div>

              {/* 内容 */}
              <div className="space-y-3">
                {(() => {
                  let currentCategory = "";
                  const blocks: { category: string; items: string[] }[] = [];

                  section.items.forEach((item) => {
                    if (item.type === "h3") {
                      currentCategory = item.text;
                      blocks.push({ category: currentCategory, items: [] });
                    } else if (item.type === "li" && blocks.length > 0) {
                      blocks[blocks.length - 1].items.push(item.text);
                    }
                  });

                  return blocks.map((block, j) => (
                    <div key={j}>
                      <h4 className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                        {block.category}
                      </h4>
                      <ul className="space-y-1.5">
                        {block.items.map((item, k) => (
                          <li
                            key={k}
                            className="flex items-start gap-2 text-sm leading-relaxed text-[var(--color-text)]"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500/60" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ));
                })()}
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
