import assert from 'node:assert/strict'
import test from 'node:test'
import { isValidBarcode, nutritionForGrams, parseOpenFoodFactsProduct, productTitle } from './barcode'

test('isValidBarcode accepts EAN/UPC lengths only', () => {
  assert.equal(isValidBarcode('3017624010701'), true)
  assert.equal(isValidBarcode('12345678'), true)
  assert.equal(isValidBarcode('1234567'), false)
  assert.equal(isValidBarcode('30176240107a1'), false)
})

test('parseOpenFoodFactsProduct reads per-100 g nutrition and serving size', () => {
  const product = parseOpenFoodFactsProduct('3017624010701', {
    status: 1,
    product: {
      product_name: 'Nutella',
      brands: 'Ferrero, Nutella',
      serving_quantity: '15',
      nutriments: { 'energy-kcal_100g': 539, proteins_100g: 6.3, carbohydrates_100g: 57.5, fat_100g: 30.9 },
    },
  })
  assert.deepEqual(product, {
    code: '3017624010701',
    name: 'Nutella',
    brand: 'Ferrero',
    servingGrams: 15,
    per100g: { calories: 539, protein: 6.3, carbs: 57.5, fat: 30.9 },
  })
})

test('parseOpenFoodFactsProduct falls back to kJ and rejects unknown products', () => {
  const product = parseOpenFoodFactsProduct('12345678', {
    status: 1,
    product: { product_name: 'Oats', nutriments: { energy_100g: 1569 } },
  })
  assert.equal(Math.round(product!.per100g.calories!), 375)
  assert.equal(product!.servingGrams, null)
  assert.equal(parseOpenFoodFactsProduct('12345678', { status: 0 }), null)
  assert.equal(parseOpenFoodFactsProduct('12345678', { status: 1, product: { nutriments: {} } }), null)
})

test('nutritionForGrams scales and rounds, keeping missing values empty', () => {
  assert.deepEqual(nutritionForGrams({ calories: 539, protein: 6.3, carbs: null, fat: 30.9 }, 15), {
    calories: 81,
    protein: 1,
    carbs: null,
    fat: 5,
  })
})

test('productTitle prefixes the brand unless the name already has it', () => {
  const base = { code: '1', servingGrams: null, per100g: { calories: null, protein: null, carbs: null, fat: null } }
  assert.equal(productTitle({ ...base, name: 'Greek Yogurt', brand: 'Fage' }), 'Fage Greek Yogurt')
  assert.equal(productTitle({ ...base, name: 'Nutella', brand: 'Nutella' }), 'Nutella')
})
