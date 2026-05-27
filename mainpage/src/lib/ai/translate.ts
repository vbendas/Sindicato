import { callOpenRouter, getTranslationModel } from "./openrouter";

const TRANSLATION_SYSTEM = `You are a professional translator specializing in worker testimonies and labor rights documentation. Your task is to translate text accurately while preserving the original tone, emotion, and factual details.

Rules:
- Preserve the worker's authentic voice and emotional tone
- Do NOT add, remove, or fabricate any details
- Keep proper nouns, company names, and technical terms as-is
- Maintain paragraph structure and line breaks
- Return ONLY the translated text, nothing else
- If the source text is already in the target language, return it unchanged`;

const LANG_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  pt: "Portuguese",
  fr: "French",
  it: "Italian",
  de: "German",
  hi: "Hindi",
  fil: "Filipino",
  vi: "Vietnamese",
  sw: "Swahili",
  ne: "Nepali",
  am: "Amharic",
  ar: "Arabic",
  eng: "English",
  spa: "Spanish",
  por: "Portuguese",
  fra: "French",
  ita: "Italian",
  deu: "German",
  hin: "Hindi",
  vie: "Vietnamese",
  swa: "Swahili",
  nep: "Nepali",
  amh: "Amharic",
  ara: "Arabic",
};

export async function translateStory(
  story: string,
  fromLang: string,
  toLang: string
): Promise<string> {
  const fromName = LANG_NAMES[fromLang] || fromLang;
  const toName = LANG_NAMES[toLang] || toLang;

  if (fromLang === toLang || fromName === toName) {
    return story;
  }

  const userPrompt = `Translate the following worker testimony from ${fromName} to ${toName}. Preserve the original tone, emotion, and all factual details. Return ONLY the translated text.

--- BEGIN TEXT ---
${story}
--- END TEXT ---`;

  try {
    const translated = await callOpenRouter({
      model: getTranslationModel(),
      systemPrompt: TRANSLATION_SYSTEM,
      userPrompt,
      maxTokens: 2048,
      temperature: 0.3,
    });

    return translated.trim();
  } catch (err) {
    console.error("Translation failed:", err);
    return story;
  }
}

export async function translateToEnglish(story: string, fromLang: string): Promise<string> {
  return translateStory(story, fromLang, "en");
}
