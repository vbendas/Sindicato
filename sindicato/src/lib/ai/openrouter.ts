const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function callOpenRouter(opts: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
        "X-Title": "Sindicato",
      },
      body: JSON.stringify({
        model: opts.model,
        messages: [
          { role: "system", content: opts.systemPrompt },
          { role: "user", content: opts.userPrompt },
        ],
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.7,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`OpenRouter error ${response.status}: ${errBody}`);
      throw new Error(`OpenRouter request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } finally {
    clearTimeout(timeout);
  }
}

export function getWritingModel() {
  return process.env.WRITING_MODEL ?? "moonshot/kimi-k2-instant";
}

export function getTranslationModel() {
  return process.env.TRANSLATION_MODEL ?? "moonshot/kimi-k2-instant";
}

export function getReportModel() {
  return process.env.REPORT_MODEL ?? "deepseek/deepseek-v3";
}
