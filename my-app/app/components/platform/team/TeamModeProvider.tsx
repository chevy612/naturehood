'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { otherTeamMode, parseTeamMode, type TeamMode } from '@/lib/team/mode'

type TeamModeContextValue = {
  mode: TeamMode
  userId: string
  saving: boolean
  error: string | null
  setMode: (mode: TeamMode) => Promise<void>
}

const TeamModeContext = createContext<TeamModeContextValue | null>(null)

export function TeamModeProvider({
  userId,
  initialMode,
  children,
}: {
  userId: string
  initialMode: string | null
  children: React.ReactNode
}) {
  const [mode, setModeState] = useState<TeamMode>(parseTeamMode(initialMode))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setMode = useCallback(async (next: TeamMode) => {
    const previous = mode
    setModeState(next)
    setSaving(true)
    setError(null)
    const { error: updateError } = await createClient()
      .from('profiles')
      .update({ team_mode: next, updated_at: new Date().toISOString() })
      .eq('id', userId)
    setSaving(false)
    if (updateError) {
      setModeState(previous)
      setError('Could not switch mode. Try again.')
    }
  }, [mode, userId])

  const value = useMemo(() => ({ mode, userId, saving, error, setMode }), [mode, userId, saving, error, setMode])

  return <TeamModeContext.Provider value={value}>{children}</TeamModeContext.Provider>
}

export function useTeamMode() {
  const value = useContext(TeamModeContext)
  if (!value) throw new Error('useTeamMode must be used inside TeamModeProvider')
  return value
}

export function useTeamModeToggle() {
  const { mode, saving, error, setMode } = useTeamMode()
  const toggle = useCallback(() => {
    if (saving) return
    void setMode(otherTeamMode(mode))
  }, [mode, saving, setMode])
  return { mode, saving, error, toggle }
}
