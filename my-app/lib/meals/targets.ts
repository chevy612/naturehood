import { EMPTY_TARGETS } from '@/lib/meals/utils'
import type { NutritionTargets, NutritionTargetsState } from '@/lib/meals/types'

// Same key and shape the mobile app persists in AsyncStorage. Targets are
// device-local on both platforms; they are not stored in Supabase.
const STORAGE_KEY = '@naturehood/nutrition-targets'

export const DEFAULT_TARGETS_STATE: NutritionTargetsState = {
  daily: { ...EMPTY_TARGETS },
  weekly: { ...EMPTY_TARGETS },
}

export function loadNutritionTargets(): NutritionTargetsState {
  if (typeof window === 'undefined') return DEFAULT_TARGETS_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_TARGETS_STATE
    const parsed = JSON.parse(raw) as Partial<Record<keyof NutritionTargetsState, Partial<NutritionTargets>>>
    return {
      daily: { ...EMPTY_TARGETS, ...parsed.daily },
      weekly: { ...EMPTY_TARGETS, ...parsed.weekly },
    }
  } catch {
    return DEFAULT_TARGETS_STATE
  }
}

export function saveNutritionTargets(state: NutritionTargetsState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable (private mode); targets simply won't persist.
  }
}
