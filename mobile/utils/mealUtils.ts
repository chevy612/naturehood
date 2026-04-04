/**
 * Shared meal utility helpers used across meal tab screens.
 */

import type { MealRecord } from '../lib/types/meal';

// ── Date name arrays ─────────────────────────────────────────────────────────

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// ── Types ────────────────────────────────────────────────────────────────────

export type Section = {
  title: string;
  data: MealRecord[];
};

// ── Formatters ───────────────────────────────────────────────────────────────

/** Format a Date as "April 4 (Sat)" */
export function formatDayHeader(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()} (${DAY_NAMES[date.getDay()]})`;
}

/** Return a YYYY-MM-DD key from a datetime string for grouping purposes. */
export function dateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Grouping ─────────────────────────────────────────────────────────────────

/** Group meals by day, most recent day first. */
export function groupByDay(meals: MealRecord[]): Section[] {
  const map = new Map<string, { date: Date; meals: MealRecord[] }>();

  for (const meal of meals) {
    const key = dateKey(meal.created_at);
    if (!map.has(key)) {
      map.set(key, { date: new Date(meal.created_at), meals: [] });
    }
    map.get(key)!.meals.push(meal);
  }

  // Sort keys descending (most recent first) — meals within each day already sorted by API
  const sorted = Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return sorted.map(([, { date, meals }]) => ({
    title: formatDayHeader(date),
    data: meals,
  }));
}

// ── Numeric parsing ──────────────────────────────────────────────────────────

/**
 * Parse a string to a float, returning null if empty or NaN.
 * Avoids repeating the `parseFloat` + `isNaN` pattern in form screens.
 */
export function parseNullableFloat(value: string): number | null {
  if (!value) return null;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}
