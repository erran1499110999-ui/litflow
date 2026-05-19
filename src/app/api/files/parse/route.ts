import { NextRequest, NextResponse } from "next/server";
import {
  parseFile,
  validateFileSize,
  validateFileType,
} from "@/lib/file-parser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "请上传文件" },
        { status: 400 }
      );
    }

    validateFileType(file.name);
    validateFileSize(file.size, 20);

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const result = await parseFile(fileBuffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "文件解析失败，请重试";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
