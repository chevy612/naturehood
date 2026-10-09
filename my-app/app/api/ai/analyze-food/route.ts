import { observeApiRoute } from '@/lib/observability/with-api-route'
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { analyzeFoodImage } from '@/lib/services/ai-food-analysis';
import { normalizeAiLanguage } from '@/lib/services/ai-language';
import { extractCalories, extractProtein, extractCarbs, extractFat } from '@/lib/services/meal-macros';
import logger from '@/lib/logger';
import { observeSupabaseAuth } from '@/lib/observability/supabase-auth';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, traceparent, tracestate, X-Request-ID',
  'Access-Control-Expose-Headers': 'X-Request-ID',
};

async function handleOPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

async function handlePOST(req: NextRequest) {
  logger.debug('[ai-food-route] POST /api/ai/analyze-food called');

  // ── Auth — support both cookie auth (web) and Bearer token (mobile) ──────
  const authHeader = req.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  logger.debug(
    '[ai-food-route] Auth header present:',
    !!authHeader,
    '| Bearer token present:',
    !!bearerToken
  );

  const supabase = observeSupabaseAuth(bearerToken
    ? createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${bearerToken}` } } }
      )
    : await createClient());

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  const userId = user?.id;

  logger.debug('[ai-food-route] Auth user present:', Boolean(userId));
  logger.debug('[ai-food-route] Auth error:', authError?.message ?? 'none');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
  }

  // ── Parse request body ───────────────────────────────────────────────────
  const body = await req.json();
  const { meal_id, lang } = body as { meal_id?: string; lang?: string };
  logger.debug('[ai-food-route] meal_id from body:', meal_id ?? 'MISSING');

  if (!meal_id) {
    return NextResponse.json({ error: 'Missing meal_id' }, { status: 400, headers: CORS_HEADERS });
  }

  // ── Fetch the meal record (RLS enforces user_id = auth.uid()) ────────────
  const { data: meal, error: fetchError } = await supabase
    .from('meal_records')
    .select('meal_id, s3_link, user_notes, weight, calories, title')
    .eq('meal_id', meal_id)
    .eq('user_id', userId)
    .single();

  logger.debug(
    '[ai-food-route] Meal fetch — found:',
    !!meal,
    '| error:',
    fetchError?.message ?? 'none'
  );
  logger.debug('[ai-food-route] meal image present:', Boolean(meal?.s3_link));

  if (fetchError || !meal) {
    return NextResponse.json(
      { error: 'Meal record not found' },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  if (!meal.s3_link) {
    return NextResponse.json(
      { error: 'No image linked to this meal record' },
      { status: 422, headers: CORS_HEADERS }
    );
  }

  // ── Download image from Supabase Storage and convert to base64 ───────────
  let base64Image: string;
  let mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' = 'image/jpeg';

  try {
    logger.debug('[ai-food-route] Fetching meal image');
    const imageRes = await fetch(meal.s3_link);
    logger.debug('[ai-food-route] Image fetch status:', imageRes.status, imageRes.statusText);

    if (!imageRes.ok) {
      logger.error('[ai-food-route] Image download failed with status:', imageRes.status);
      return NextResponse.json(
        { error: 'Failed to download meal image' },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    // Determine media type from Content-Type header or URL extension
    const contentType = imageRes.headers.get('content-type') ?? '';
    logger.debug('[ai-food-route] Image Content-Type:', contentType);
    if (contentType.includes('png')) mediaType = 'image/png';
    else if (contentType.includes('webp')) mediaType = 'image/webp';
    else if (contentType.includes('gif')) mediaType = 'image/gif';

    const buffer = await imageRes.arrayBuffer();
    base64Image = Buffer.from(buffer).toString('base64');
    logger.debug('[ai-food-route] Image converted to base64, length:', base64Image.length);
  } catch (err) {
    logger.error('[ai-food-route] Image download failed:', err);
    return NextResponse.json(
      { error: 'Failed to process meal image' },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  // ── Call Anthropic via the food AI service ───────────────────────────────
  logger.debug('[ai-food-route] Calling analyzeFoodImage with mediaType:', mediaType);
  const analysis = await analyzeFoodImage({
    base64Image,
    mediaType,
    userNotes: meal.user_notes ?? null,
    weight: meal.weight ?? null,
    lang: normalizeAiLanguage(lang),
  });

  logger.debug('[ai-food-route] analyzeFoodImage result:', analysis ? 'success' : 'NULL (failed)');

  if (!analysis) {
    return NextResponse.json(
      { error: 'AI analysis failed' },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  // ── Write result back to meal_records ────────────────────────────────────
  const aiCalories = extractCalories(analysis);
  logger.debug('[ai-food-route] Computed aiCalories:', aiCalories);

  const aiProtein = extractProtein(analysis);
  logger.debug('[ai-food-route] Computed aiProtein:', aiProtein);

  const aiCarbs = extractCarbs(analysis);
  logger.debug('[ai-food-route] Computed aiCarbs:', aiCarbs);

  const aiFat = extractFat(analysis);
  logger.debug('[ai-food-route] Computed aiFat:', aiFat);

  const { data: updatedMeal, error: updateError } = await supabase
    .from('meal_records')
    .update({
      ai_analysis: analysis,
      calories: aiCalories,
      protein: aiProtein,
      carbs: aiCarbs,
      fat: aiFat,
      updated_at: new Date().toISOString(),
    })
    .eq('meal_id', meal_id)
    .eq('user_id', userId)
    .select('meal_id, ai_analysis, calories, protein, carbs, fat')
    .single();

  if (updateError || !updatedMeal) {
    logger.error('[ai-food-route] Failed to save AI result:', updateError);
    return NextResponse.json(
      { error: 'Failed to save AI result' },
      { status: 500, headers: CORS_HEADERS }
    );
  }

  logger.debug('[ai-food-route] Success — returning analysis');
  return NextResponse.json(
    {
      analysis: updatedMeal.ai_analysis,
      calories: updatedMeal.calories,
      protein: updatedMeal.protein,
      carbs: updatedMeal.carbs,
      fat: updatedMeal.fat,
    },
    { headers: CORS_HEADERS }
  );
}

export const OPTIONS = observeApiRoute('/api/ai/analyze-food', 'OPTIONS', handleOPTIONS)
export const POST = observeApiRoute('/api/ai/analyze-food', 'POST', handlePOST)
