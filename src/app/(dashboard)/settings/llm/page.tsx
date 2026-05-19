"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Eye, EyeOff, KeyRound, Save, TestTube2 } from "lucide-react";

type ProviderKey = "deepseek" | "openai" | "anthropic";

interface ProviderConfig {
  provider: ProviderKey;
  name: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}

const DEFAULTS: Record<ProviderKey, Omit<ProviderConfig, "apiKey">> = {
  deepseek: {
    provider: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
  },
  openai: {
    provider: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
  anthropic: {
    provider: "anthropic",
    name: "Claude (Anthropic)",
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-20250514",
  },
};

const STORAGE_KEY = "litflow-llm-settings-v1";

export default function LLMSettingsPage() {
  const [configs, setConfigs] = useState<Record<ProviderKey, ProviderConfig>>({
    deepseek: { ...DEFAULTS.deepseek, apiKey: "" },
    openai: { ...DEFAULTS.openai, apiKey: "" },
    anthropic: { ...DEFAULTS.anthropic, apiKey: "" },
  });
  const [defaultProvider, setDefaultProvider] = useState<ProviderKey>("deepseek");
  const [showKeys, setShowKeys] = useState<Record<ProviderKey, boolean>>({
    deepseek: false,
    openai: false,
    anthropic: false,
  });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        configs: Record<ProviderKey, ProviderConfig>;
        defaultProvider: ProviderKey;
      };
      if (parsed.configs) setConfigs(parsed.configs);
      if (parsed.defaultProvider) setDefaultProvider(parsed.defaultProvider);
    } catch {
      // ignore malformed local storage
    }
  }, []);

  const maskedKey = (key: string) => {
    if (!key) return "未配置";
    if (key.length <= 8) return key;
    return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
  };

  const saveSettings = () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ configs, defaultProvider })
    );
    setStatus("已保存到浏览器本地");
    setTimeout(() => setStatus(null), 2000);
  };

  const testConnection = async (provider: ProviderKey) => {
    const current = configs[provider];
    if (!current.apiKey.trim()) {
      setStatus(`${current.name} API Key 未配置`);
      return;
    }
    setStatus(`已记录 ${current.name} 配置，后续 API 调用将使用该配置`);
    setTimeout(() => setStatus(null), 2500);
  };

  const updateConfig = (provider: ProviderKey, patch: Partial<ProviderConfig>) => {
    setConfigs((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        ...patch,
      },
    }));
  };

  const cards = useMemo(() => Object.values(configs), [configs]);

  return (
    <div className="mx-auto max-w-4xl animate-fade-in-up">
      <span className="inline-block rounded-full bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-600">
        AI 模型配置
      </span>
      <h1
        className="mt-3 text-2xl font-semibold text-[var(--color-text)] lg:text-3xl"
        style={{ fontFamily: "var(--font-noto-serif-sc)" }}
      >
        LLM 接口配置
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        配置不同模型提供商的 API Key，优先保存在浏览器本地，不上传到服务器。
      </p>
      <div className="gradient-divider mt-6 mb-8" />

      {status && (
        <div className="mb-6 rounded-xl border border-spring-200 bg-spring-50 p-3 text-sm text-spring-700">
          {status}
        </div>
      )}

      <div className="space-y-6">
        {cards.map((item) => (
          <Card key={item.provider} className="border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base text-[var(--color-text)]">{item.name}</CardTitle>
                  <CardDescription className="text-xs">模型：{item.model}</CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-spring-600" />
                  {item.apiKey ? "已配置" : "未配置"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    type={showKeys[item.provider] ? "text" : "password"}
                    value={item.apiKey}
                    placeholder={`${item.name} API Key`}
                    onChange={(e) => updateConfig(item.provider, { apiKey: e.target.value })}
                    className="rounded-xl border-[var(--color-border)]"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-[var(--color-border)]"
                    onClick={() =>
                      setShowKeys((prev) => ({ ...prev, [item.provider]: !prev[item.provider] }))
                    }
                  >
                    {showKeys[item.provider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {!showKeys[item.provider] && item.apiKey && (
                  <p className="text-xs text-[var(--color-text-muted)]">当前显示：{maskedKey(item.apiKey)}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm">Base URL</Label>
                  <Input
                    value={item.baseUrl}
                    onChange={(e) => updateConfig(item.provider, { baseUrl: e.target.value })}
                    className="rounded-xl border-[var(--color-border)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">模型</Label>
                  <Input
                    value={item.model}
                    onChange={(e) => updateConfig(item.provider, { model: e.target.value })}
                    className="rounded-xl border-[var(--color-border)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[var(--color-bg)] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">设为默认模型</p>
                  <p className="text-xs text-[var(--color-text-muted)]">用于后续提纲生成与文本超我蒸馏</p>
                </div>
                <input
                  type="radio"
                  checked={defaultProvider === item.provider}
                  onChange={() => setDefaultProvider(item.provider)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-[var(--color-border)]"
                  onClick={() => testConnection(item.provider)}
                >
                  <TestTube2 className="mr-2 h-4 w-4" />
                  测试
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button className="btn-spring" onClick={saveSettings}>
          <Save className="mr-2 h-4 w-4" />
          保存设置
        </Button>
      </div>
    </div>
  );
}
