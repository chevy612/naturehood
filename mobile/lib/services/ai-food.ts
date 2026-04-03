import type { AiFoodAnalysis } from '../types/meal';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

// ── API call ─────────────────────────────────────────────────────────────────

/**
 * Call the backend AI endpoint to analyse a meal photo.
 *
 * The backend fetches the image from `s3_link` already stored on the
 * `meal_records` row, sends it to Anthropic for vision analysis, writes
 * the result back to the DB, and returns the parsed analysis.
 */
export async function analyzeFoodWithAI(
  mealId: string,
  accessToken: string,
): Promise<{ analysis: AiFoodAnalysis | null; error: string | null }> {
  try {
    const res = await fetch(`${API_BASE}/api/ai/analyze-food`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ meal_id: mealId }),
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { analysis: null, error: body?.error ?? 'AI analysis failed' };
    }

    return { analysis: (body.analysis as AiFoodAnalysis) ?? null, error: null };
  } catch (err) {
    console.error('[ai-food] analyzeFoodWithAI failed:', err);
    return { analysis: null, error: 'Network error — could not reach AI service' };
  }
}
