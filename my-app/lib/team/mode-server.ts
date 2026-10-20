import { createClient } from '@/lib/supabase/server'
import { parseTeamMode, type TeamMode } from '@/lib/team/mode'

export async function getTeamMode(): Promise<TeamMode> {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) return 'athlete'
  const { data } = await supabase.from('profiles').select('team_mode').eq('id', userId).maybeSingle()
  return parseTeamMode(data?.team_mode)
}
