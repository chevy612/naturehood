import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import {
  type AIProvider,
  claudeClient,
  glmClient,
  kimiClient,
  DEFAULT_MODELS,
} from '@/lib/services/ai-client';

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
  glm: glmClient,
};

function getClientAndModel(provider: AIProvider): {
  sdk: 'anthropic' | 'openai';
  anthropicClient?: Anthropic;
  openaiClient?: OpenAI;
  model: string;
} {
  if (provider === 'kimi') {
    return { sdk: 'openai', openaiClient: kimiClient, model: DEFAULT_MODELS.kimi };
  }
  const client = ANTHROPIC_CLIENTS[provider];
  if (!client) {
    throw new Error(`[ai-food] Unknown provider "${provider}"`);
  }
  return { sdk: 'anthropic', anthropicClient: client, model: DEFAULT_MODELS[provider] };
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
    console.error('[ai-food] Anthropic response truncated: max_tokens reached.');
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
    console.error('[ai-food] OpenAI response truncated: max_tokens reached.');
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
 * @param weightG     - optional weight hint in grams
 * @param provider    - which AI provider to use (defaults to "kimi")
 */
export async function analyzeFoodImage(params: {
  base64Image: string;
  mediaType: ImageMediaType;
  userNotes?: string | null;
  weightG?: number | null;
  provider?: AIProvider;
}): Promise<AiFoodAnalysis | null> {
  const { base64Image, mediaType, userNotes, weightG, provider = 'kimi' } = params;

  // Build the user-facing text prompt with optional context
  const contextParts: string[] = ['Analyze this meal image.'];
  if (weightG) contextParts.push(`Estimated total weight: ${weightG}g.`);
  if (userNotes?.trim()) contextParts.push(`User notes: ${userNotes.trim()}`);
  const userText = contextParts.join(' ');

  try {
    const { sdk, anthropicClient, openaiClient, model } = getClientAndModel(provider);

    // Dispatch to the correct SDK adapter
    let rawText: string | null;
    if (sdk === 'anthropic' && anthropicClient) {
      rawText = await callAnthropic(anthropicClient, model, base64Image, mediaType, userText);
    } else if (sdk === 'openai' && openaiClient) {
      rawText = await callOpenAI(openaiClient, model, base64Image, mediaType, userText);
    } else {
      throw new Error(`[ai-food] No client resolved for provider "${provider}"`);
    }

    if (!rawText) return null;

    const jsonText = stripCodeFences(rawText);
    const parsed: AiFoodAnalysis = JSON.parse(jsonText);

    // Minimal validation — must have description
    if (typeof parsed.description !== 'string') return null;

    return parsed;
  } catch (err) {
    console.error('[ai-food] analyzeFoodImage failed:', err);
    return null;
  }
}
