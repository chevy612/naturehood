import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import {
  type AIProvider,
  claudeClient,
  // glmClient,
  kimiClient,
  DEFAULT_MODELS,
} from '@/lib/services/ai-client';
import logger from '@/lib/logger';

const AI_PROVIDER = process.env.FOOD_ANALYSIS_PROVIDER ?? 'kimi';

// ── System prompt — Food Analyst & Nutritionist ─────────────────────────────
const SYSTEM_PROMPT = `Act as a Computer Vision Food Analyst and Nutritionist. Analyze the provided image and output a precise nutritional estimation in a strict JSON format.

Analysis Protocol:
1. Visual Segmentation: Identify every distinct food component, including garnishes and dressings.
2. Volumetric Estimation: Use objects in the image (cutlery, plate size, hands) to estimate volume/weight.
3. Hidden Density Check: Account for preparation methods (fried vs steamed, oil, etc.).
4. Human Synthesis: Create a brief, natural-sounding summary for the user's diary.

Output Schema (JSON ONLY, no markdown):
{
  "data": {
    "meal_summary": {
      "detected_items_count": number,
      "total_calories_range": { "min": number, "max": number },
      "total_protein": number,
      "confidence_score": number (0.0-1.0)
    },
    "breakdown": [
      {
        "item": "string",
        "estimated_weight_g": number,
        "calories": number,
        "protein": number,
        "macros": { "p": number, "c": number, "f": number },
        "logic": "brief explanation"
      }
    ],
    "preparation_assumptions": ["string"]
  },
  "description": "A summary string. Format: 'A meal consisting of [Item A] ([X] kcal) ([Y] g protein), [Item B] ([Y] kcal) ([Z] g protein), and [Item C] ([Z] kcal) ([W] g protein).' "
}

Constraints:
- Output ONLY valid JSON.
- If no food is detected, return { "data": {}, "description": "No food was detected in the image." }`;

// ── Types ───────────────────────────────────────────────────────────────────

export type AiFoodAnalysis = {
  data: Record<string, unknown>;
  description: string;
};

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

// ── Provider → client + model mapping ───────────────────────────────────────

const ANTHROPIC_CLIENTS: Record<string, Anthropic> = {
  anthropic: claudeClient,
  // glm: glmClient,
};

function getClientAndModel(provider: AIProvider): {
  anthropicClient?: Anthropic;
  openaiClient?: OpenAI;
  model: string;
} {
  if (provider === 'kimi') {
    return { openaiClient: kimiClient, model: DEFAULT_MODELS.kimi };
  }
  const client = ANTHROPIC_CLIENTS[provider];
  if (!client) {
    throw new Error(`[food-analysis] Unknown provider "${provider}"`);
  }
  return { anthropicClient: client, model: DEFAULT_MODELS[provider] };
}

// ── SDK-specific call adapters ──────────────────────────────────────────────
// Each adapter builds the request in the correct format, sends it,
// and returns the raw text from the response (or null on failure).

async function callAnthropic(
  client: Anthropic,
  model: string,
  base64Image: string,
  mediaType: ImageMediaType,
  userText: string
): Promise<string | null> {
  const message = await client.messages.create({
    model,
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Image,
            },
          },
          { type: 'text', text: userText },
        ],
      },
    ],
  });

  if (message.stop_reason === 'max_tokens') {
    logger.error('[food-analysis] Anthropic response truncated: max_tokens reached.');
    return null;
  }

  const block = message.content[0];
  if (block.type !== 'text') return null;
  return block.text;
}

async function callOpenAI(
  client: OpenAI,
  model: string,
  base64Image: string,
  mediaType: ImageMediaType,
  userText: string
): Promise<string | null> {
  const completion = await client.chat.completions.create({
    model,
    max_tokens: 8192,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mediaType};base64,${base64Image}` },
          },
          { type: 'text', text: userText },
        ],
      },
    ],
  });

  const choice = completion.choices[0];
  if (!choice) return null;

  if (choice.finish_reason === 'length') {
    logger.error('[food-analysis] OpenAI response truncated: max_tokens reached.');
    return null;
  }

  return choice.message.content;
}

// ── Shared helpers ──────────────────────────────────────────────────────────

/** Strip markdown code fences if the model adds them despite instructions. */
function stripCodeFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');
}

// ── Main function ───────────────────────────────────────────────────────────

/**
 * Analyse a food image using the specified AI provider's vision capability.
 *
 * @param base64Image - raw base64-encoded image (no data: prefix)
 * @param mediaType   - MIME type, e.g. "image/jpeg"
 * @param userNotes   - optional extra context from the user (e.g. "homemade, no dressing")
 * @param weight     - optional weight hint in grams
 * @param provider    - which AI provider to use (defaults to "kimi")
 */
export async function analyzeFoodImage(params: {
  base64Image: string;
  mediaType: ImageMediaType;
  userNotes?: string | null;
  weight?: number | null;
  provider?: AIProvider;
}): Promise<AiFoodAnalysis | null> {
  const {
    base64Image,
    mediaType,
    userNotes,
    weight,
    provider = AI_PROVIDER as AIProvider,
  } = params;

  // Build the user-facing text prompt with optional context
  const contextParts: string[] = ['Analyze this meal image.'];
  if (weight) contextParts.push(`Estimated total weight: ${weight}g.`);
  if (userNotes?.trim()) contextParts.push(`User notes: ${userNotes.trim()}`);
  const userText = contextParts.join(' ');

  try {
    const { anthropicClient, openaiClient, model } = getClientAndModel(provider);
    logger.debug(`[food-analysis] Using provider="${provider}", model="${model}"`);

    // Dispatch to the correct SDK adapter
    let rawText: string | null;
    if (anthropicClient) {
      rawText = await callAnthropic(anthropicClient, model, base64Image, mediaType, userText);
    } else if (openaiClient) {
      rawText = await callOpenAI(openaiClient, model, base64Image, mediaType, userText);
    } else {
      throw new Error(`[food-analysis] No client resolved for provider "${provider}"`);
    }

    logger.debug('[food-analysis] Raw AI response:', rawText ?? 'null');

    if (!rawText) return null;

    const jsonText = stripCodeFences(rawText);
    // console.log('[food-analysis] After stripCodeFences (first 300 chars):', jsonText.slice(0, 300));

    let parsed: AiFoodAnalysis;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseErr) {
      logger.error('[food-analysis] JSON.parse failed:', parseErr);
      logger.error('[food-analysis] Unparseable text:', jsonText.slice(0, 1000));
      return null;
    }

    // Minimal validation — must have description
    if (typeof parsed.description !== 'string') {
      logger.error(
        '[food-analysis] Validation failed — "description" missing or not a string. Got:',
        typeof parsed.description
      );
      return null;
    }

    logger.debug('[food-analysis] Parse success — description:', parsed.description.slice(0, 100));
    return parsed;
  } catch (err) {
    logger.error('[food-analysis] analyzeFoodImage failed:', err);
    return null;
  }
}
