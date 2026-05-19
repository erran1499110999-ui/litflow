import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: "获取设置失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: "服务器内部错误" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const payload = {
      user_id: user.id,
      language: body.language || "zh-CN",
      default_llm_provider: body.default_llm_provider || "deepseek",
      llm_configs: body.llm_configs || {},
      theme: body.theme || "light",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("user_settings")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: "保存设置失败" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: "服务器内部错误" }, { status: 500 });
  }
}
