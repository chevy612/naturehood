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
  const url = `${API_BASE}/api/ai/analyze-food`;
  console.log('[ai-food] → POST', url, { meal_id: mealId });
  console.log('[ai-food] API_BASE:', API_BASE || '(empty — check EXPO_PUBLIC_API_BASE_URL)');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ meal_id: mealId }),
    });

    console.log('[ai-food] ← HTTP', res.status, res.statusText);

    const body = await res.json().catch((jsonErr) => {
      console.warn('[ai-food] Failed to parse response JSON:', jsonErr);
      return {};
    });

    console.log('[ai-food] Response body:', JSON.stringify(body).slice(0, 500));

    if (!res.ok) {
      const errMsg = body?.error ?? 'AI analysis failed';
      console.error('[ai-food] Non-OK response — error:', errMsg);
      return { analysis: null, error: errMsg };
    }

    if (!body.analysis) {
      console.error('[ai-food] Response OK but missing "analysis" field:', body);
      return { analysis: null, error: 'Empty analysis returned from server' };
    }

    return { analysis: (body.analysis as AiFoodAnalysis) ?? null, error: null };
  } catch (err) {
    console.error('[ai-food] analyzeFoodWithAI network/fetch error:', err);
    return { analysis: null, error: 'Network error — could not reach AI service' };
  }
}
