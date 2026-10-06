/**
 * backfill-meal-macros — one-off repair for NAT-28.
 *
 * Older meal_records rows were written with calories + protein but NULL
 * carbs/fat, because the analyze-food route did not yet promote carbs/fat
 * out of ai_analysis.breakdown. This script recomputes carbs/fat from the
 * stored ai_analysis using the SAME extractors the route now uses, so the
 * values match exactly, and fills in only the NULL columns.
 *
 * Deterministic — reads ai_analysis that is already present. No AI calls.
 *
 * Usage (from my-app/):
 *   npm run backfill:meal-macros            # dry run — prints intended updates
 *   npm run backfill:meal-macros -- --apply # actually writes
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * NOTE: point .env.local at the project you intend to repair. Verify the URL
 * printed at startup before using --apply against production.
 */

import fs from 'fs';
import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { extractCarbs, extractFat } from '../lib/services/meal-macros';

// ─── Load .env.local ──────────────────────────────────────────────────────────
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=][^=]*)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
  }
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const PAGE_SIZE = 500;

const supabase: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Row = {
  meal_id: string;
  carbs: number | null;
  fat: number | null;
  ai_analysis: { data?: Record<string, unknown> | null } | null;
};

async function main() {
  console.log('\n🩹  NAT-28 — backfill meal_records carbs/fat');
  console.log('─'.repeat(52));
  console.log(`Target : ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  console.log(`Mode   : ${APPLY ? 'APPLY (writing)' : 'DRY RUN (no writes)'}\n`);

  let from = 0;
  let scanned = 0;
  let updated = 0;
  let skipped = 0;

  for (;;) {
    // Only rows that have analysis but are missing at least one macro column.
    const { data, error } = await supabase
      .from('meal_records')
      .select('meal_id, carbs, fat, ai_analysis')
      .not('ai_analysis', 'is', null)
      .or('carbs.is.null,fat.is.null')
      .order('created_at', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error('❌  Query failed:', error.message);
      process.exit(1);
    }

    const rows = (data as Row[]) ?? [];
    if (rows.length === 0) break;

    for (const row of rows) {
      scanned++;
      const analysis = row.ai_analysis;
      if (!analysis) {
        skipped++;
        continue;
      }

      // Fill only the columns that are currently NULL; never overwrite values
      // a user may have edited by hand.
      const nextCarbs = row.carbs == null ? extractCarbs(analysis) : null;
      const nextFat = row.fat == null ? extractFat(analysis) : null;

      const patch: { carbs?: number; fat?: number } = {};
      if (nextCarbs != null) patch.carbs = nextCarbs;
      if (nextFat != null) patch.fat = nextFat;

      if (Object.keys(patch).length === 0) {
        skipped++;
        continue;
      }

      updated++;
      console.log(
        `  ${row.meal_id}  ${JSON.stringify(patch)}` +
          (row.carbs != null || row.fat != null
            ? `  (was carbs=${row.carbs} fat=${row.fat})`
            : '')
      );

      if (APPLY) {
        const { error: upErr } = await supabase
          .from('meal_records')
          .update(patch)
          .eq('meal_id', row.meal_id);
        if (upErr) {
          console.error(`    ⚠️  update failed for ${row.meal_id}: ${upErr.message}`);
          updated--;
        }
      }
    }

    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  console.log('\n' + '─'.repeat(52));
  console.log(
    `Scanned ${scanned} | ${APPLY ? 'updated' : 'would update'} ${updated} | skipped ${skipped}`
  );
  if (!APPLY && updated > 0) {
    console.log('Re-run with `-- --apply` to write these changes.');
  }
  console.log();
  process.exit(0);
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
