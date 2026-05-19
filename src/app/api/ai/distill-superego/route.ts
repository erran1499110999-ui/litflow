import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callLLM } from "@/lib/llm";
import { buildSuperEgoPrompt } from "@/prompts/superego-distill";

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
    const {
      projectId,
      targetName,
      targetType,
      texts,
    }: {
      projectId: string;
      targetName: string;
      targetType: "self" | "other";
      texts: string[];
    } = body;

    if (!projectId || !targetName || !texts?.length) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数" },
        { status: 400 }
      );
    }

    if (texts.length < 1) {
      return NextResponse.json(
        { success: false, error: "至少需要 1 篇文本素材" },
        { status: 400 }
      );
    }

    const { data: settings } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const llmConfigs = (settings?.llm_configs as Record<string, any>) || {};
    const defaultProvider = (settings?.default_llm_provider as string) || "deepseek";
    const providerConfig = llmConfigs[defaultProvider] || { provider: "deepseek" };

    const prompt = buildSuperEgoPrompt({
      targetName,
      targetType,
      texts,
    });

    let aiResponse = "";
    try {
      aiResponse = await callLLM(
        providerConfig,
        [
          {
            role: "system",
            content:
              "你是一位学术写作分析专家，擅长提炼作者的学术人格特征。请严格输出 JSON，不要额外解释。",
          },
          { role: "user", content: prompt },
        ],
        0.4,
        4096
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "AI 蒸馏失败，请稍后重试" },
        { status: 502 }
      );
    }

    let parsed: any;
    try {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { success: false, error: "AI 返回格式异常，请重试" },
        { status: 502 }
      );
    }

    const { data: saved, error: saveError } = await supabase
      .from("superego_profiles")
      .insert({
        project_id: projectId,
        user_id: user.id,
        name: targetName,
        target_type: targetType,
        source_files: [],
        result: parsed,
        raw_text: parsed?.summary || "",
        model_used: providerConfig?.model || process.env.DEEPSEEK_MODEL || "deepseek-chat",
      })
      .select()
      .single();

    if (saveError) {
      return NextResponse.json(
        { success: false, error: "保存蒸馏结果失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: saved.id,
        result: parsed,
        created_at: saved.created_at,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
