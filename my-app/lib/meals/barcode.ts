// Packaged-food lookup by barcode (EAN-8 / EAN-13 / UPC-A / GTIN-14) via Open Food Facts.
// Pure helpers only, so the API route, the browser and tests share one parser.

export type Nutrition = {
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

export type BarcodeProduct = {
  code: string
  name: string
  brand: string | null
  /** One serving in grams (or ml), when the label states it. */
  servingGrams: number | null
  per100g: Nutrition
}

const KJ_PER_KCAL = 4.184

export function isValidBarcode(code: string): boolean {
  return /^\d{8,14}$/.test(code)
}

function finite(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

/** Maps an Open Food Facts v2 `/product/{code}` response; null when the product is unknown. */
export function parseOpenFoodFactsProduct(code: string, payload: unknown): BarcodeProduct | null {
  if (!payload || typeof payload !== 'object') return null
  const { status, product } = payload as { status?: unknown; product?: Record<string, unknown> }
  if (status !== 1 || !product || typeof product !== 'object') return null

  const n = (product.nutriments ?? {}) as Record<string, unknown>
  const kj = finite(n['energy-kj_100g']) ?? finite(n['energy_100g'])
  const per100g: Nutrition = {
    calories: finite(n['energy-kcal_100g']) ?? (kj != null ? kj / KJ_PER_KCAL : null),
    protein: finite(n['proteins_100g']),
    carbs: finite(n['carbohydrates_100g']),
    fat: finite(n['fat_100g']),
  }

  const name = typeof product.product_name === 'string' ? product.product_name.trim() : ''
  const brand = typeof product.brands === 'string' ? product.brands.split(',')[0].trim() || null : null
  const hasNutrition = Object.values(per100g).some((value) => value != null)
  if (!name && !hasNutrition) return null

  const serving = finite(product.serving_quantity)
  return {
    code,
    name: name || brand || 'Packaged food',
    brand,
    servingGrams: serving && serving > 0 ? serving : null,
    per100g,
  }
}

/** Scales per-100 g values to the amount eaten, rounded to whole numbers like the rest of the meal log. */
export function nutritionForGrams(per100g: Nutrition, grams: number): Nutrition {
  const scale = (value: number | null) => (value == null ? null : Math.round((value * grams) / 100))
  return {
    calories: scale(per100g.calories),
    protein: scale(per100g.protein),
    carbs: scale(per100g.carbs),
    fat: scale(per100g.fat),
  }
}

export function productTitle(product: BarcodeProduct): string {
  if (!product.brand || product.name.toLowerCase().includes(product.brand.toLowerCase())) return product.name
  return `${product.brand} ${product.name}`
}
