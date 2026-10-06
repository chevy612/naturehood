// Shared helpers for deriving the top-level meal_records nutrition columns
// (calories / protein / carbs / fat) from an AI food-analysis payload.
//
// Single source of truth: used by the analyze-food route and by the
// one-off backfill script so both compute identical values.

type AnalysisLike = { data?: Record<string, unknown> | null };

export function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getMealSummary(analysis: AnalysisLike): Record<string, unknown> | null {
  return analysis.data?.meal_summary && typeof analysis.data.meal_summary === 'object'
    ? (analysis.data.meal_summary as Record<string, unknown>)
    : null;
}

function getBreakdown(analysis: AnalysisLike): unknown[] {
  return Array.isArray(analysis.data?.breakdown) ? (analysis.data!.breakdown as unknown[]) : [];
}

/** Sum a single macro key (c/f) across every breakdown item. */
function sumMacro(analysis: AnalysisLike, key: 'p' | 'c' | 'f'): number | null {
  const total = getBreakdown(analysis).reduce<number>((sum, item) => {
    if (!item || typeof item !== 'object') {
      return sum;
    }

    const row = item as Record<string, unknown>;
    const macros =
      row.macros && typeof row.macros === 'object'
        ? (row.macros as Record<string, unknown>)
        : null;
    return sum + (toFiniteNumber(macros?.[key]) ?? 0);
  }, 0);

  return total > 0 ? Math.round(total) : null;
}

export function extractCalories(analysis: AnalysisLike): number | null {
  const summary = getMealSummary(analysis);
  const range =
    summary?.total_calories_range && typeof summary.total_calories_range === 'object'
      ? (summary.total_calories_range as Record<string, unknown>)
      : null;
  const min = toFiniteNumber(range?.min);
  const max = toFiniteNumber(range?.max);

  return min != null && max != null ? Math.round((min + max) / 2) : null;
}

export function extractProtein(analysis: AnalysisLike): number | null {
  const summary = getMealSummary(analysis);
  const summaryProtein = toFiniteNumber(summary?.total_protein);

  if (summaryProtein != null) {
    return Math.round(summaryProtein);
  }

  const total = getBreakdown(analysis).reduce<number>((sum, item) => {
    if (!item || typeof item !== 'object') {
      return sum;
    }

    const row = item as Record<string, unknown>;
    const macros =
      row.macros && typeof row.macros === 'object'
        ? (row.macros as Record<string, unknown>)
        : null;
    return sum + (toFiniteNumber(row.protein) ?? toFiniteNumber(macros?.p) ?? 0);
  }, 0);

  return total > 0 ? Math.round(total) : null;
}

export function extractCarbs(analysis: AnalysisLike): number | null {
  return sumMacro(analysis, 'c');
}

export function extractFat(analysis: AnalysisLike): number | null {
  return sumMacro(analysis, 'f');
}
