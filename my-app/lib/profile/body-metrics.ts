export type WeightUnit = 'kg' | 'lb'
export type HeightUnit = 'cm' | 'in'

export const GENDER_VALUES = ['woman', 'man', 'non_binary', 'prefer_not_to_say'] as const
export type GenderValue = (typeof GENDER_VALUES)[number]

export const GENDER_LABELS: Record<GenderValue, string> = {
  woman: 'Woman',
  man: 'Man',
  non_binary: 'Non-binary',
  prefer_not_to_say: 'Prefer not to say',
}

export const ETHNICITY_VALUES = [
  'asian',
  'black_or_african_american',
  'hispanic_or_latino',
  'middle_eastern_or_north_african',
  'native_american_or_alaska_native',
  'native_hawaiian_or_pacific_islander',
  'white',
  'mixed',
  'other',
  'prefer_not_to_say',
] as const
export type EthnicityValue = (typeof ETHNICITY_VALUES)[number]

export const ETHNICITY_LABELS: Record<EthnicityValue, string> = {
  asian: 'Asian',
  black_or_african_american: 'Black or African American',
  hispanic_or_latino: 'Hispanic or Latino',
  middle_eastern_or_north_african: 'Middle Eastern or North African',
  native_american_or_alaska_native: 'Native American or Alaska Native',
  native_hawaiian_or_pacific_islander: 'Native Hawaiian or Pacific Islander',
  white: 'White',
  mixed: 'Mixed / multiple',
  other: 'Other',
  prefer_not_to_say: 'Prefer not to say',
}

const LB_PER_KG = 2.2046226218
const CM_PER_IN = 2.54

const MIN_WEIGHT_KG = 20
const MAX_WEIGHT_KG = 500
const MIN_HEIGHT_CM = 50
const MAX_HEIGHT_CM = 300

export function kgToDisplay(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kg * LB_PER_KG
}

export function displayToKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value / LB_PER_KG
}

export function cmToDisplay(cm: number, unit: HeightUnit): number {
  return unit === 'cm' ? cm : cm / CM_PER_IN
}

export function displayToCm(value: number, unit: HeightUnit): number {
  return unit === 'cm' ? value : value * CM_PER_IN
}

export function formatWeightDisplay(kg: number | null, unit: WeightUnit): string {
  if (kg == null) return ''
  const n = kgToDisplay(kg, unit)
  const rounded = unit === 'kg' ? Math.round(n * 10) / 10 : Math.round(n * 10) / 10
  return String(rounded)
}

export function formatHeightDisplay(cm: number | null, unit: HeightUnit): string {
  if (cm == null) return ''
  const n = cmToDisplay(cm, unit)
  const rounded = unit === 'cm' ? Math.round(n * 10) / 10 : Math.round(n * 10) / 10
  return String(rounded)
}

export function parseWeightInput(
  raw: string,
  unit: WeightUnit,
): { kg: number | null } | { error: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { kg: null }
  const value = Number(trimmed)
  if (!Number.isFinite(value) || value <= 0) {
    return { error: 'Enter a valid weight.' }
  }
  const kg = displayToKg(value, unit)
  if (kg < MIN_WEIGHT_KG || kg > MAX_WEIGHT_KG) {
    const min = Math.round(kgToDisplay(MIN_WEIGHT_KG, unit))
    const max = Math.round(kgToDisplay(MAX_WEIGHT_KG, unit))
    return { error: `Weight must be between ${min} and ${max} ${unit}.` }
  }
  return { kg: Math.round(kg * 1000) / 1000 }
}

export function parseHeightInput(
  raw: string,
  unit: HeightUnit,
): { cm: number | null } | { error: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { cm: null }
  const value = Number(trimmed)
  if (!Number.isFinite(value) || value <= 0) {
    return { error: 'Enter a valid height.' }
  }
  const cm = displayToCm(value, unit)
  if (cm < MIN_HEIGHT_CM || cm > MAX_HEIGHT_CM) {
    const min = Math.round(cmToDisplay(MIN_HEIGHT_CM, unit))
    const max = Math.round(cmToDisplay(MAX_HEIGHT_CM, unit))
    return { error: `Height must be between ${min} and ${max} ${unit}.` }
  }
  return { cm: Math.round(cm * 10) / 10 }
}

export function isGenderValue(value: string): value is GenderValue {
  return (GENDER_VALUES as readonly string[]).includes(value)
}

export function isEthnicityValue(value: string): value is EthnicityValue {
  return (ETHNICITY_VALUES as readonly string[]).includes(value)
}
