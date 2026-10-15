'use client'

import { useSyncExternalStore } from 'react'
import { analyzeMeal } from '@/lib/social/browser'

export type AnalysisNotice = {
  id: string
  mealId: string
  title: string
  message: string
}

const SAVED_WITHOUT_AI = 'Your meal has been saved without AI data.'

const EMPTY_IDS: ReadonlySet<string> = new Set()
const EMPTY_NOTICES: readonly AnalysisNotice[] = []

let analyzingIds: ReadonlySet<string> = EMPTY_IDS
let notices: readonly AnalysisNotice[] = EMPTY_NOTICES
let completedCount = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function setAnalyzing(mealId: string, active: boolean) {
  const next = new Set(analyzingIds)
  if (active) next.add(mealId)
  else next.delete(mealId)
  analyzingIds = next
}

function pushNotice(mealId: string, title: string, message: string) {
  notices = [...notices, { id: `${mealId}-${Date.now()}`, mealId, title, message }]
}

export function dismissAnalysisNotice(id: string) {
  notices = notices.filter((notice) => notice.id !== id)
  emit()
}

/**
 * Runs the AI analysis in the background so the user can leave the form (as on
 * mobile). State lives at module level, so it survives client-side navigation.
 */
export function startMealAnalysis(mealId: string) {
  if (analyzingIds.has(mealId)) return
  setAnalyzing(mealId, true)
  emit()
  analyzeMeal(mealId)
    .catch((error: unknown) => {
      const raw = error instanceof Error ? error.message : ''
      const message = !raw || raw === 'AI analysis failed' ? 'We could not analyse this photo.' : raw
      const sentence = /[.!?]$/.test(message) ? message : `${message}.`
      pushNotice(mealId, 'AI analysis failed', `${sentence} ${SAVED_WITHOUT_AI}`)
    })
    .finally(() => {
      setAnalyzing(mealId, false)
      completedCount += 1
      emit()
    })
}

export function useAnalyzingMealIds(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, () => analyzingIds, () => EMPTY_IDS)
}

export function useAnalysisNotices(): readonly AnalysisNotice[] {
  return useSyncExternalStore(subscribe, () => notices, () => EMPTY_NOTICES)
}

/** Increments each time a background analysis finishes, so lists know to refetch. */
export function useAnalysisCompletedCount(): number {
  return useSyncExternalStore(subscribe, () => completedCount, () => 0)
}
