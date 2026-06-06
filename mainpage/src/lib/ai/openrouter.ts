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
    const msg = data.choices[0].message;
    const content = msg.content ?? msg.reasoning ?? "";
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

export async function callOpenRouterStream(opts: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<ReadableStream<Uint8Array>> {
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
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error(`OpenRouter stream error ${response.status}: ${errBody}`);
    throw new Error(`OpenRouter streaming request failed with status ${response.status}`);
  }

  const rawStream = response.body;
  if (!rawStream) throw new Error("No response body in streaming response");

  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      const reader = rawStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const jsonStr = trimmed.slice(6);
            if (jsonStr === "[DONE]") return;

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta;
              const content = delta?.content ?? delta?.reasoning ?? "";
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            } catch {
            }
          }
        }
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });
}

export function getWritingModel() {
  return process.env.WRITING_MODEL ?? "moonshot/kimi-k2-instant";
}

export function getTranslationModel() {
  return process.env.TRANSLATION_MODEL ?? "moonshot/kimi-k2-instant";
}

export function getReportModel() {
  return process.env.REPORT_MODEL ?? "deepseek/deepseek-chat";
}

export function getClerkModel() {
  return process.env.CLERK_MODEL ?? "nvidia/nemotron-3-super-120b-a12b:free";
}

export function getTagModel() {
  return process.env.TAG_MODEL ?? "openai/gpt-oss-120b:free";
}

export function getScraperModel() {
  return process.env.SCRAPER_MODEL ?? "deepseek/deepseek-v3";
}
