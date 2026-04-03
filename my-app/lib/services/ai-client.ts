import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// ─────────────────────────────────────────────────────────────────────────────
// AI Client Factory
//
// Returns a configured AI client for the chosen provider.
// Anthropic and GLM return an Anthropic SDK client (GLM implements
// Anthropic's protocol at a different base_url).
// Kimi returns an OpenAI SDK client (Kimi implements the OpenAI protocol).
//
// Supported providers:
//   "anthropic" (default) — Claude models via api.anthropic.com
//   "glm"                 — ZhipuAI GLM models via open.bigmodel.cn/api/anthropic
//   "kimi"                — Moonshot Kimi models via api.moonshot.ai/v1
//
// Configuration via environment variables:
//   AI_PROVIDER          = "anthropic" | "glm" | "kimi"  (default: "anthropic")
//   ANTHROPIC_API_KEY    = sk-ant-...                     (used when provider = anthropic)
//   GLM_API_KEY          = your-zhipuai-api-key           (used when provider = glm)
//   GLM_BASE_URL         = https://open.bigmodel.cn/api/anthropic  (optional override)
//   MOONSHOT_API_KEY     = your-moonshot-api-key           (used when provider = kimi)
//   KIMI_BASE_URL        = https://api.moonshot.ai/v1     (optional override)
//
// Default models per provider:
//   anthropic → claude-haiku-4-5-20251001
//   glm       → glm-4v  (vision-capable; use glm-4 / glm-5 for text-only tasks)
//   kimi      → kimi-k2.5
// ─────────────────────────────────────────────────────────────────────────────

export type AIProvider = 'anthropic' | 'glm' | 'kimi';

/** GLM base URL used when provider is "glm" */
const GLM_BASE_URL = process.env.GLM_BASE_URL ?? 'https://open.bigmodel.cn/api/anthropic';

/** Kimi (Moonshot) base URL used when provider is "kimi" */
const KIMI_BASE_URL = process.env.KIMI_BASE_URL ?? 'https://api.moonshot.ai/v1';

/** Default model identifiers per provider */
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-haiku-4-5-20251001',
  glm: 'glm-4v',
  kimi: 'kimi-k2.5',
};

// ── Internal: build a configured Anthropic client ────────────────────────────

function buildAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('[ai-client] ANTHROPIC_API_KEY is not set');
  return new Anthropic({ apiKey });
}

function buildGlmClient(): Anthropic {
  const apiKey = process.env.GLM_API_KEY;
  if (!apiKey) throw new Error('[ai-client] GLM_API_KEY is not set');
  return new Anthropic({ apiKey, baseURL: GLM_BASE_URL });
}

function buildKimiClient(): OpenAI {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) throw new Error('[ai-client] KIMI_API_KEY is not set');
  return new OpenAI({ apiKey, baseURL: KIMI_BASE_URL });
}

// ── Convenience singleton ─────────────────────────────────────────────────────
// Pre-built client using the env-configured provider.
// Import this directly when you don't need per-call provider switching.
//
//   import { aiClient, aiModel } from '@/lib/services/ai-client'

export const claudeClient = buildAnthropicClient();
export const glmClient = buildGlmClient();
export const kimiClient = buildKimiClient();
