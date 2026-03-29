import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../constants/tokens';
import type {
  AthleteSessionLog,
  AthleteBlock,
  AthleteExerciseLog,
  AthleteSetLog,
  CompetitionResult,
  SprintSession,
  PhysioSession,
  SessionType,
  PerceivedIntensity,
} from '../../lib/services/ai';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(2)}s`;
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(2).padStart(5, '0');
  return `${m}:${s}`;
}

function fmtWeight(set: AthleteSetLog): string | null {
  if (set.weight_type === 'bodyweight') return 'BW';
  if (set.weight_type === 'machine_level' && set.machine_level != null) return `Lvl ${set.machine_level}`;
  if (set.weight_type === 'added' && set.added_weight_kg != null) return `+${set.added_weight_kg} kg`;
  if (set.weight_kg != null) return `${set.weight_kg} kg`;
  return null;
}

function sessionTypeLabel(type: SessionType): string {
  const labels: Record<SessionType, string> = {
    strength: 'Strength', sprint: 'Sprint', conditioning: 'Conditioning',
    competition: 'Competition', physio: 'Physio', rehab: 'Rehab',
    prehab: 'Prehab', recovery: 'Recovery', mixed: 'Mixed', unknown: 'Unknown',
  };
  return labels[type] ?? type;
}

function intensityColor(intensity: PerceivedIntensity | null | undefined): string {
  switch (intensity) {
    case 'max':      return colors.error;
    case 'high':     return colors.accent;
    case 'moderate': return colors.textDisabled;
    case 'low':      return colors.textMuted;
    default:         return colors.textMuted;
  }
}

// ─── Set row ──────────────────────────────────────────────────────────────────

function SetRow({ set }: { set: AthleteSetLog }) {
  const weight = fmtWeight(set);
  const parts: string[] = [];
  if (set.reps != null) parts.push(`${set.reps} reps`);
  else if (set.duration_seconds != null) parts.push(`${set.duration_seconds}s`);
  if (weight) parts.push(weight);
  if (set.distance_m != null) parts.push(`${set.distance_m}m`);
  if (set.effort_percent != null) parts.push(`${set.effort_percent}%`);

  return (
    <View style={s.setRow}>
      <Text style={s.setLabel}>
        Set {set.set_index + 1}{set.is_warmup ? ' (WU)' : ''}{set.is_failure ? ' ✗' : ''}
      </Text>
      <Text style={s.setMetrics}>{parts.join(' · ') || '—'}</Text>
    </View>
  );
}

// ─── Exercise card ────────────────────────────────────────────────────────────

function ExerciseCard({ ex }: { ex: AthleteExerciseLog }) {
  return (
    <View style={s.exerciseCard}>
      <View style={s.exerciseHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.exerciseName}>{ex.name}</Text>
          {ex.name_original ? (
            <Text style={s.exerciseOriginal}>({ex.name_original})</Text>
          ) : null}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {ex.max_weight_kg != null && (
            <Text style={s.exerciseMaxWeight}>{ex.max_weight_kg} kg</Text>
          )}
          {ex.total_volume_kg != null && (
            <Text style={s.exerciseVolume}>{ex.total_volume_kg.toLocaleString()} kg vol</Text>
          )}
        </View>
      </View>
      {ex.notes ? <Text style={s.exerciseNotes}>{ex.notes}</Text> : null}
      {ex.sets.map((set) => <SetRow key={set.set_index} set={set} />)}
    </View>
  );
}

// ─── Strength blocks ──────────────────────────────────────────────────────────

function StrengthBlocks({ blocks }: { blocks: AthleteBlock[] }) {
  return (
    <View style={{ gap: spacing.lg }}>
      {blocks.map((block) => (
        <View key={block.block_index}>
          {block.block_name ? (
            <Text style={s.blockLabel}>
              {block.block_name}
              {block.block_type === 'emom' && block.emom_interval_seconds
                ? `  E${block.emom_interval_seconds / 60}MOM`
                : ''}
              {block.circuit_rounds != null ? `  × ${block.circuit_rounds}` : ''}
            </Text>
          ) : null}
          {block.exercises.map((ex) => (
            <ExerciseCard key={ex.exercise_index} ex={ex} />
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Sprint efforts ───────────────────────────────────────────────────────────

function SprintEfforts({ sprint }: { sprint: SprintSession }) {
  return (
    <View style={{ gap: spacing.md }}>
      {(sprint.surface || sprint.footwear) ? (
        <Text style={s.metaLine}>
          {[sprint.surface, sprint.footwear].filter(Boolean).join(' · ')}
        </Text>
      ) : null}
      {sprint.efforts.map((effort) => (
        <View key={effort.effort_index} style={s.sprintCard}>
          <View style={s.sprintCardHeader}>
            <Text style={s.blockLabel}>
              {effort.drill_type.replace(/_/g, ' ')}
            </Text>
            {effort.distance_m != null && (
              <Text style={s.sprintMeta}>{effort.distance_m}m</Text>
            )}
            {effort.effort_percent != null && (
              <Text style={s.sprintMeta}>@ {effort.effort_percent}%</Text>
            )}
          </View>
          {effort.reps.map((rep) => (
            <View key={rep.rep_index} style={s.sprintRepRow}>
              <Text style={s.setLabel}>Rep {rep.rep_index + 1}</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {rep.time_seconds != null && (
                  <Text style={s.sprintTime}>{fmtTime(rep.time_seconds)}</Text>
                )}
                {rep.split_times_seconds && rep.split_times_seconds.length > 0 && (
                  <Text style={s.sprintSplits}>[{rep.split_times_seconds.join(' · ')}]</Text>
                )}
                {rep.completed === false && (
                  <Text style={s.dnf}>DNF</Text>
                )}
              </View>
            </View>
          ))}
          {effort.notes ? <Text style={s.exerciseNotes}>{effort.notes}</Text> : null}
        </View>
      ))}
    </View>
  );
}

// ─── Competition result ───────────────────────────────────────────────────────

function CompetitionResultView({ result }: { result: CompetitionResult }) {
  const statusColor = ['dns', 'dnf', 'dq'].includes(result.status) ? colors.error : colors.accent;

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        {result.event ? (
          <Text style={s.competitionEvent}>{result.event}</Text>
        ) : null}
        {result.competition_name ? (
          <Text style={s.metaLine}>{result.competition_name}</Text>
        ) : null}
        <Text style={[s.statusBadge, { color: statusColor }]}>
          {result.status.toUpperCase()}
        </Text>
      </View>

      {result.dns_reason ? (
        <Text style={[s.metaLine, { color: colors.error }]}>DNS: {result.dns_reason}</Text>
      ) : null}

      {result.rounds.map((round, i) => (
        <View key={i} style={s.roundRow}>
          <Text style={s.roundType}>{round.round_type}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={s.roundTime}>
              {round.time_seconds != null ? fmtTime(round.time_seconds) : '—'}
            </Text>
            {round.pb && <Text style={s.pbBadge}>PB</Text>}
            {round.sb && !round.pb && <Text style={s.sbBadge}>SB</Text>}
          </View>
        </View>
      ))}

      {result.best_time_seconds != null && (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          <Text style={s.bestLabel}>BEST</Text>
          <Text style={s.bestTime}>{fmtTime(result.best_time_seconds)}</Text>
        </View>
      )}

      {result.notes ? <Text style={s.exerciseNotes}>{result.notes}</Text> : null}
    </View>
  );
}

// ─── Physio view ──────────────────────────────────────────────────────────────

function PhysioView({ physio }: { physio: PhysioSession }) {
  const clearanceColor: Record<string, string> = {
    cleared: colors.accent,
    modified_training: colors.textDisabled,
    rest_only: colors.error,
    pending_review: colors.textMuted,
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {physio.provider ? (
          <Text style={s.metaLine}>{physio.provider}</Text>
        ) : null}
        {physio.clearance_status ? (
          <Text style={[s.statusBadge, { color: clearanceColor[physio.clearance_status] ?? colors.textDisabled }]}>
            {physio.clearance_status.replace(/_/g, ' ').toUpperCase()}
          </Text>
        ) : null}
      </View>

      {physio.body_areas && physio.body_areas.length > 0 && (
        <View style={{ gap: 4 }}>
          <Text style={s.blockLabel}>Areas</Text>
          {physio.body_areas.map((area, i) => (
            <View key={i} style={s.areaRow}>
              <Text style={s.exerciseName}>
                {area.side && area.side !== 'bilateral' ? `${area.side} ` : ''}{area.area}
              </Text>
              {area.injury_name ? (
                <Text style={{ fontSize: 12, fontFamily: fonts.body, color: colors.error }}>{area.injury_name}</Text>
              ) : null}
              {area.treatment_type ? (
                <Text style={s.exerciseNotes}>{area.treatment_type}</Text>
              ) : null}
              {(area.pain_score_before != null || area.pain_score_after != null) && (
                <Text style={s.metaLine}>Pain: {area.pain_score_before ?? '?'} → {area.pain_score_after ?? '?'}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {physio.exercises && physio.exercises.length > 0 && (
        <View style={{ gap: 4 }}>
          <Text style={s.blockLabel}>Exercises</Text>
          {physio.exercises.map((ex) => <ExerciseCard key={ex.exercise_index} ex={ex} />)}
        </View>
      )}

      {physio.notes ? <Text style={s.exerciseNotes}>{physio.notes}</Text> : null}
    </View>
  );
}

// ─── Parser warnings ──────────────────────────────────────────────────────────

function ParserWarnings({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;
  return (
    <View style={s.warningsBox}>
      <Text style={s.warningsLabel}>PARSER WARNINGS</Text>
      {warnings.map((w, i) => (
        <Text key={i} style={s.warningItem}>• {w}</Text>
      ))}
    </View>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.statPill}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SessionResultProps {
  session: AthleteSessionLog;
}

export default function SessionResult({ session }: SessionResultProps) {
  const { summary } = session;
  const intensity = summary.estimated_intensity ?? session.perceived_intensity;
  const confidence = summary.parser_confidence ?? 1;

  const stats: { label: string; value: string }[] = [];
  if (summary.total_sets != null)     stats.push({ label: 'Sets',   value: String(summary.total_sets) });
  if (summary.total_reps != null)     stats.push({ label: 'Reps',   value: String(summary.total_reps) });
  if (summary.total_volume_kg != null) stats.push({ label: 'Vol',   value: `${(summary.total_volume_kg / 1000).toFixed(1)}t` });
  if (summary.total_distance_m != null) stats.push({ label: 'Dist', value: `${(summary.total_distance_m / 1000).toFixed(2)} km` });

  return (
    <View style={s.container}>
      {/* Header row */}
      <View style={s.headerRow}>
        <View style={s.typeBadge}>
          <Text style={s.typeBadgeText}>{sessionTypeLabel(session.session_type)}</Text>
        </View>
        {session.session_subtype ? (
          <View style={s.subtypeBadge}>
            <Text style={s.subtypeBadgeText}>{session.session_subtype}</Text>
          </View>
        ) : null}
        {intensity ? (
          <Text style={[s.intensityText, { color: intensityColor(intensity) }]}>
            {intensity.toUpperCase()}
          </Text>
        ) : null}
      </View>

      {/* Session notes */}
      {summary.session_notes ? (
        <Text style={s.sessionNotes}>{summary.session_notes}</Text>
      ) : null}

      {/* Stats */}
      {stats.length > 0 && (
        <View style={s.statsRow}>
          {stats.map((st) => <StatPill key={st.label} label={st.label} value={st.value} />)}
        </View>
      )}

      {/* Readiness */}
      {session.readiness && (session.readiness.feel || session.readiness.pain_score != null) ? (
        <View style={s.readinessRow}>
          <Text style={s.metaLine}>Readiness:</Text>
          {session.readiness.feel ? (
            <Text style={s.readinessValue}>{session.readiness.feel}</Text>
          ) : null}
          {session.readiness.pain_score != null ? (
            <Text style={s.readinessValue}>Pain {session.readiness.pain_score}/10</Text>
          ) : null}
        </View>
      ) : null}

      <View style={s.divider} />

      {/* Strength / conditioning blocks */}
      {session.blocks && session.blocks.length > 0 && (
        <StrengthBlocks blocks={session.blocks} />
      )}

      {/* Sprint */}
      {session.sprint_session && (
        <SprintEfforts sprint={session.sprint_session} />
      )}

      {/* Competition */}
      {session.competition_result && (
        <CompetitionResultView result={session.competition_result} />
      )}

      {/* Physio */}
      {session.physio_session && (
        <PhysioView physio={session.physio_session} />
      )}

      {/* Confidence + warnings */}
      <View style={s.confidenceRow}>
        <Text style={s.metaLine}>AI confidence: </Text>
        <Text style={[s.confidenceValue, {
          color: confidence >= 0.8 ? colors.accent : confidence >= 0.6 ? colors.textDisabled : colors.error,
        }]}>
          {Math.round(confidence * 100)}%
        </Text>
        <Text style={s.parserVersion}> v{session.parser_version}</Text>
      </View>

      {summary.parsing_warnings && summary.parsing_warnings.length > 0 && (
        <ParserWarnings warnings={summary.parsing_warnings} />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { gap: spacing.md },

  // Header
  headerRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  typeBadge:      { borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 8, paddingVertical: 3 },
  typeBadgeText:  { fontSize: 11, fontFamily: fonts.headingM, color: colors.accent, letterSpacing: 1, textTransform: 'uppercase' },
  subtypeBadge:   { borderWidth: 1, borderColor: colors.border, paddingHorizontal: 8, paddingVertical: 3 },
  subtypeBadgeText: { fontSize: 11, fontFamily: fonts.body, color: colors.textDisabled, textTransform: 'uppercase' },
  intensityText:  { fontSize: 11, fontFamily: fonts.headingM, letterSpacing: 2, marginLeft: 'auto' },

  sessionNotes: { fontSize: 13, fontFamily: fonts.body, color: colors.textMuted, fontStyle: 'italic', lineHeight: 20 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statPill: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface1, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 60 },
  statValue: { fontSize: 18, fontFamily: fonts.heading, color: colors.textPrimary },
  statLabel: { fontSize: 10, fontFamily: fonts.headingM, color: colors.textMuted, letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 },

  // Readiness
  readinessRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  readinessValue: { fontSize: 12, fontFamily: fonts.body, color: colors.textDisabled, textTransform: 'capitalize' },

  divider: { height: 1, backgroundColor: colors.border },

  // Blocks / exercises
  blockLabel: { fontSize: 10, fontFamily: fonts.headingM, color: colors.accent, letterSpacing: 3, textTransform: 'uppercase', marginBottom: spacing.xs },
  exerciseCard: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.xs, gap: 4 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  exerciseName:   { fontSize: 13, fontFamily: fonts.body, color: colors.textPrimary },
  exerciseOriginal: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted },
  exerciseMaxWeight: { fontSize: 12, fontFamily: fonts.bodyMed, color: colors.textDisabled },
  exerciseVolume: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted },
  exerciseNotes:  { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted, fontStyle: 'italic' },

  // Sets
  setRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  setLabel:  { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
  setMetrics: { fontSize: 12, fontFamily: fonts.body, color: colors.textDisabled },

  // Sprint
  sprintCard: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, padding: spacing.md, gap: spacing.sm },
  sprintCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sprintMeta:   { fontSize: 12, fontFamily: fonts.body, color: colors.textDisabled },
  sprintRepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sprintTime:   { fontSize: 14, fontFamily: fonts.heading, color: colors.textPrimary },
  sprintSplits: { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted },
  dnf:          { fontSize: 11, fontFamily: fonts.bodyMed, color: colors.error },

  // Competition
  competitionEvent: { fontSize: 20, fontFamily: fonts.heading, color: colors.textPrimary },
  statusBadge: { fontSize: 11, fontFamily: fonts.headingM, letterSpacing: 2 },
  roundRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 8 },
  roundType:   { fontSize: 13, fontFamily: fonts.body, color: colors.textDisabled, textTransform: 'capitalize' },
  roundTime:   { fontSize: 14, fontFamily: fonts.heading, color: colors.textPrimary },
  pbBadge:     { fontSize: 10, fontFamily: fonts.heading, color: colors.accent },
  sbBadge:     { fontSize: 10, fontFamily: fonts.heading, color: colors.textDisabled },
  bestLabel:   { fontSize: 10, fontFamily: fonts.headingM, color: colors.textMuted, letterSpacing: 3, textTransform: 'uppercase' },
  bestTime:    { fontSize: 22, fontFamily: fonts.heading, color: colors.accent },

  // Physio
  areaRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.xs, gap: 2 },

  // Confidence
  confidenceRow:   { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  confidenceValue: { fontSize: 12, fontFamily: fonts.bodyMed },
  parserVersion:   { fontSize: 11, fontFamily: fonts.body, color: colors.border },

  // Warnings
  warningsBox:   { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface1, padding: spacing.sm, gap: 4, marginTop: 4 },
  warningsLabel: { fontSize: 10, fontFamily: fonts.headingM, color: colors.textDisabled, letterSpacing: 3, textTransform: 'uppercase' },
  warningItem:   { fontSize: 11, fontFamily: fonts.body, color: colors.textMuted },

  metaLine: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
});
