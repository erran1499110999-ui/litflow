"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Languages, Save } from "lucide-react";

const LANGUAGES = [
  { code: "zh-CN", label: "中文（简体）" },
  { code: "zh-TW", label: "中文（繁體）" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
] as const;

const STORAGE_KEY = "litflow-language-v1";

export default function LanguageSettingsPage() {
  const [language, setLanguage] = useState<string>("zh-CN");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) setLanguage(raw);
  }, []);

  const saveLanguage = () => {
    window.localStorage.setItem(STORAGE_KEY, language);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-in-up">
      <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-600">
        Language
      </span>
      <h1
        className="mt-3 text-2xl font-semibold text-[var(--color-text)] lg:text-3xl"
        style={{ fontFamily: "var(--font-noto-serif-sc)" }}
      >
        语言设置
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        V2 先实现语言选择持久化，后续逐步替换所有界面文案为国际化词条。
      </p>
      <div className="gradient-divider mt-6 mb-8" />

      <Card className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <Languages className="h-5 w-5 text-primary-600" strokeWidth={1.5} />
            </div>
            <div>
              <CardTitle className="text-base text-[var(--color-text)]">选择界面语言</CardTitle>
              <CardDescription className="text-xs">当前仅持久化选择，完整国际化会在后续阶段逐步接入。</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {LANGUAGES.map((item) => {
            const active = language === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                  active
                    ? "border-primary-500 bg-primary-50"
                    : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{item.label}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{item.code}</p>
                </div>
                {active && <Check className="h-4 w-4 text-primary-600" />}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-end">
        <Button className="btn-spring" onClick={saveLanguage}>
          <Save className="mr-2 h-4 w-4" />
          {saved ? "已保存" : "保存设置"}
        </Button>
      </div>
    </div>
  );
}
