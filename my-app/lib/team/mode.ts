export type TeamMode = 'athlete' | 'coach'

export function parseTeamMode(value: string | null | undefined): TeamMode {
  return value === 'coach' ? 'coach' : 'athlete'
}

export function otherTeamMode(mode: TeamMode): TeamMode {
  return mode === 'coach' ? 'athlete' : 'coach'
}
