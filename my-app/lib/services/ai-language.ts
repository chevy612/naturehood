export type AiLanguage = 'en' | 'zh-HK' | 'zh-TW' | 'zh-CN'

const LANGUAGE_INSTRUCTIONS: Record<AiLanguage, string> = {
  en: 'Return all user-facing natural-language strings in English.',
  'zh-HK': 'Return all user-facing natural-language strings in Traditional Chinese using Hong Kong wording where appropriate.',
  'zh-TW': 'Return all user-facing natural-language strings in Traditional Chinese using Taiwan wording where appropriate.',
  'zh-CN': 'Return all user-facing natural-language strings in Simplified Chinese.',
}

export function normalizeAiLanguage(lang: unknown): AiLanguage {
  if (typeof lang !== 'string') return 'en'

  const normalized = lang.trim().toLowerCase()

  if (normalized === 'zh-cn' || normalized === 'zh-hans') return 'zh-CN'
  if (normalized === 'zh-hk') return 'zh-HK'
  if (normalized === 'zh-tw' || normalized === 'zh-hant' || normalized === 'zh') return 'zh-TW'

  return 'en'
}

export function getLanguageInstruction(lang: AiLanguage): string {
  return LANGUAGE_INSTRUCTIONS[lang]
}
