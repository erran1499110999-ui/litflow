export type LLMProvider = "deepseek" | "openai" | "anthropic";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const PROVIDER_DEFAULTS: Record<LLMProvider, { baseUrl: string; model: string }> = {
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-20250514",
  },
};

export async function callLLM(
  config: Partial<LLMConfig> | null | undefined,
  messages: LLMMessage[],
  temperature = 0.4,
  maxTokens = 4096
): Promise<string> {
  const provider = (config?.provider || "deepseek") as LLMProvider;
  const baseUrl = config?.baseUrl || PROVIDER_DEFAULTS[provider].baseUrl;
  const model = config?.model || PROVIDER_DEFAULTS[provider].model;
  const apiKey =
    config?.apiKey ||
    (provider === "deepseek" ? process.env.DEEPSEEK_API_KEY : undefined) ||
    "";

  if (!apiKey) {
    throw new Error(`${provider} API Key 未配置`);
  }

  if (provider === "anthropic") {
    return callAnthropic({ baseUrl, model, apiKey }, messages, temperature, maxTokens);
  }

  return callOpenAICompatible({ baseUrl, model, apiKey }, messages, temperature, maxTokens);
}

async function callOpenAICompatible(
  config: { baseUrl: string; model: string; apiKey: string },
  messages: LLMMessage[],
  temperature: number,
  maxTokens: number
) {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
}

async function callAnthropic(
  config: { baseUrl: string; model: string; apiKey: string },
  messages: LLMMessage[],
  temperature: number,
  maxTokens: number
) {
  const system = messages.find((m) => m.role === "system")?.content || "";
  const anthropicMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

  const response = await fetch(`${config.baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      system,
      messages: anthropicMessages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data?.content?.[0]?.text || "";
}
