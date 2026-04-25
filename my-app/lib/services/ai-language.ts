export type AiLanguage = 'en' | 'zh-TW' | 'zh-CN'

const LANGUAGE_INSTRUCTIONS: Record<AiLanguage, string> = {
  en: 'Return all user-facing natural-language strings in English.',
  'zh-TW': 'Return all user-facing natural-language strings in Traditional Chinese.',
  'zh-CN': 'Return all user-facing natural-language strings in Simplified Chinese.',
}

export function normalizeAiLanguage(lang: unknown): AiLanguage {
  if (typeof lang !== 'string') return 'en'

  const normalized = lang.trim().toLowerCase()

  if (normalized === 'zh-cn' || normalized === 'zh-hans') return 'zh-CN'
  if (normalized === 'zh-tw' || normalized === 'zh-hant' || normalized === 'zh') return 'zh-TW'

  return 'en'
}

export function getLanguageInstruction(lang: AiLanguage): string {
  return LANGUAGE_INSTRUCTIONS[lang]
}
