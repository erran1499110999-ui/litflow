import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callDeepSeek } from "@/lib/deepseek";
import { buildOutlinePrompt } from "@/prompts/outline-generator";

// 每个用户每天最多生成 3 次提纲
const DAILY_LIMIT = 3;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "缺少项目ID" },
        { status: 400 }
      );
    }

    // 验证项目归属
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: "项目不存在或无权限" },
        { status: 404 }
      );
    }

    // 检查每日限额
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count, error: countError } = await supabase
      .from("outlines")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString());

    if (countError) {
      return NextResponse.json(
        { success: false, error: "检查配额失败" },
        { status: 500 }
      );
    }

    if (count && count >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `每日最多生成 ${DAILY_LIMIT} 次提纲，请明天再试`,
        },
        { status: 429 }
      );
    }

    // 获取项目笔记
    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (notesError) {
      return NextResponse.json(
        { success: false, error: "获取笔记失败" },
        { status: 500 }
      );
    }

    if (!notes || notes.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: `至少需要 10 条笔记才能生成提纲（当前 ${notes?.length || 0} 条）`,
        },
        { status: 400 }
      );
    }

    // 构建 Prompt
    const prompt = buildOutlinePrompt({
      title: project.title,
      field: project.field,
      notes: notes.map((note) => ({
        content: note.content,
        paperTitle: note.paper_title || undefined,
        paperAuthors: note.paper_authors || undefined,
        paperYear: note.paper_year || undefined,
        tags: note.tags || [],
        noteType: note.note_type,
      })),
    });

    // 调用 DeepSeek
    let aiResponse: string;
    try {
      aiResponse = await callDeepSeek(
        [
          {
            role: "system",
            content:
              "你是一个学术写作指导专家，擅长分析文献笔记并生成结构化的综述提纲。请严格按照JSON格式输出。",
          },
          { role: "user", content: prompt },
        ],
        0.3,
        4096
      );
    } catch (aiError) {
      console.error("DeepSeek API 调用失败:", aiError);
      return NextResponse.json(
        {
          success: false,
          error: "AI 生成失败，请稍后重试",
        },
        { status: 502 }
      );
    }

    // 解析 AI 返回的 JSON
    let outlineContent: any;
    try {
      // 尝试提取 JSON（AI 可能会用 ```json 包裹）
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
      outlineContent = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "AI 返回格式异常，请重试",
        },
        { status: 502 }
      );
    }

    // 生成 Markdown 版本
    const rawMarkdown = generateMarkdown(outlineContent, project.title);

    // 保存到数据库
    const { data: outline, error: outlineError } = await supabase
      .from("outlines")
      .insert({
        project_id: projectId,
        user_id: user.id,
        content: outlineContent,
        raw_markdown: rawMarkdown,
        note_ids: notes.map((n) => n.id),
        model_used: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      })
      .select()
      .single();

    if (outlineError) {
      console.error("保存提纲失败:", outlineError);
      return NextResponse.json(
        { success: false, error: "保存提纲失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: outline.id,
        content: outlineContent,
        raw_markdown: rawMarkdown,
        created_at: outline.created_at,
      },
    });
  } catch (error) {
    console.error("生成提纲错误:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

function generateMarkdown(content: any, title: string): string {
  let md = `# ${content.outline?.title || title}\n\n`;
  md += `> ${content.summary || ""}\n\n`;

  md += `---\n\n## 主题分组\n\n`;
  for (const theme of content.themes || []) {
    md += `### ${theme.title}\n\n`;
    md += `${theme.description}\n\n`;
    for (const sub of theme.subTopics || []) {
      md += `#### ${sub.title}\n\n`;
      for (const point of sub.keyPoints || []) {
        md += `- ${point}\n`;
      }
      md += `\n`;
    }
    md += `\n`;
  }

  md += `---\n\n## 综述提纲\n\n`;
  for (const section of content.outline?.sections || []) {
    md += `### ${section.heading}\n\n`;
    md += `**目的**: ${section.purpose}\n\n`;
    for (const arg of section.keyArguments || []) {
      md += `- ${arg}\n`;
    }
    md += `\n**引用**: ${(section.citations || []).join(", ")}\n\n`;
    if (section.transitionToNext) {
      md += `> 过渡: ${section.transitionToNext}\n\n`;
    }
  }

  md += `---\n\n## 论文关系\n\n`;
  for (const rel of content.relationships || []) {
    const typeLabel: Record<string, string> = {
      support: "✅ 支持",
      contradict: "⚠️ 矛盾",
      extend: "🔗 延伸",
      complement: "➕ 补充",
    };
    md += `- ${typeLabel[rel.type] || rel.type}: ${rel.paper1} ↔ ${rel.paper2}\n`;
    md += `  - ${rel.description}\n`;
  }

  md += `\n---\n\n## 研究空白与建议\n\n`;
  for (const gap of content.gaps || []) {
    md += `- **${gap.area}**: ${gap.suggestion}\n`;
    md += `  - 原因: ${gap.reason}\n`;
  }

  return md;
}
