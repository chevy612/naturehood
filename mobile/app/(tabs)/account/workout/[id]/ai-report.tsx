import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../../../lib/supabase';
import { colors, fonts, spacing, commonStyles } from '../../../../../constants/tokens';
import {
  fetchWorkout, updateAiStructured, isAthleteSessionLog,
  type AiStructuredExercise, type AiStructuredWorkout, type AthleteSessionLog,
} from '../../../../../lib/actions/workout-detail';
import type { WeightType } from '../../../../../lib/services/ai';
import SessionMetaPanel, { type SessionMeta, type SessionType } from '../../../../../components/workout/SessionMetaPanel';
import StrengthPanel, { type DraftBlock, blankBlock } from '../../../../../components/workout/StrengthPanel';
import SprintPanel, { type DraftSprintEffort } from '../../../../../components/workout/SprintPanel';
import CompetitionPanel, { type DraftCompetitionResult, blankCompetitionResult } from '../../../../../components/workout/CompetitionPanel';
import PhysioPanel, { type DraftBodyArea } from '../../../../../components/workout/PhysioPanel';

// ── Helpers ───────────────────────────────────────────────────────────────────

const INTENSITY_OPTIONS: Array<'low' | 'moderate' | 'high'> = ['low', 'moderate', 'high'];

function inferSessionType(workoutTypes: string[]): SessionType {
  const types = workoutTypes.map((t) => t.toLowerCase());
  if (types.some((t) => t === 'competition')) return 'competition';
  if (types.some((t) => ['physio', 'rehab', 'prehab'].includes(t)))
    return types.find((t) => ['physio', 'rehab', 'prehab'].includes(t)) as SessionType;
  if (types.some((t) => ['sprint', 'speed', 'track'].includes(t))) return 'sprint';
  if (types.some((t) => ['recovery', 'rest', 'active recovery'].includes(t))) return 'recovery';
  if (types.some((t) => ['conditioning', 'cardio', 'circuit', 'crossfit'].includes(t))) return 'conditioning';
  return 'strength';
}

function blocksFromAi(blocks: AthleteSessionLog['blocks']): DraftBlock[] {
  if (!blocks) return [];
  return blocks.map((b, bi) => ({
    block_index: b.block_index ?? bi,
    block_name: b.block_name ?? null,
    block_type: b.block_type ?? 'main',
    emom_interval_seconds: b.emom_interval_seconds ?? null,
    circuit_rounds: b.circuit_rounds ?? null,
    intensity_percent: b.intensity_percent ?? null,
    notes: b.notes ?? null,
    exercises: (b.exercises ?? []).map((ex, ei) => ({
      exercise_index: ex.exercise_index ?? ei,
      name: ex.name ?? '',
      name_original: ex.name_original ?? null,
      name_unknown: ex.name_unknown ?? false,
      category: ex.category ?? null,
      equipment: ex.equipment ?? null,
      laterality: ex.laterality ?? null,
      is_superset_with: ex.is_superset_with ?? null,
      notes: ex.notes ?? null,
      total_volume_kg: ex.total_volume_kg ?? null,
      max_weight_kg: ex.max_weight_kg ?? null,
      total_reps: ex.total_reps ?? null,
      set_count: ex.set_count ?? null,
      sets: (ex.sets ?? []).map((s, si) => ({
        set_index: s.set_index ?? si,
        is_warmup: s.is_warmup ?? false,
        is_failure: s.is_failure ?? false,
        is_dropset: s.is_dropset ?? false,
        weight_kg: s.weight_kg ?? null,
        weight_type: (s.weight_type ?? null) as WeightType,
        weight_value_raw: s.weight_value_raw ?? null,
        added_weight_kg: s.added_weight_kg ?? null,
        machine_level: s.machine_level ?? null,
        reps: s.reps ?? null,
        reps_left: s.reps_left ?? null,
        reps_right: s.reps_right ?? null,
        duration_seconds: s.duration_seconds ?? null,
        distance_m: s.distance_m ?? null,
        pace_seconds_per_km: s.pace_seconds_per_km ?? null,
        time_seconds: s.time_seconds ?? null,
        splits_seconds: s.splits_seconds ?? null,
        effort_percent: s.effort_percent ?? null,
        rest_seconds: s.rest_seconds ?? null,
        rest_between_reps_seconds: s.rest_between_reps_seconds ?? null,
        notes: s.notes ?? null,
      })),
    })),
  }));
}

function sprintEffortsFromAi(sprint: AthleteSessionLog['sprint_session']): DraftSprintEffort[] {
  if (!sprint?.efforts) return [];
  return sprint.efforts.map((e, ei) => ({
    effort_index: e.effort_index ?? ei,
    drill_type: e.drill_type ?? 'acceleration',
    distance_m: e.distance_m ?? null,
    phase_distances_m: e.phase_distances_m ?? null,
    effort_percent: e.effort_percent ?? null,
    footwear: e.footwear ?? null,
    rest_between_reps_seconds: e.rest_between_reps_seconds ?? null,
    rest_between_sets_seconds: e.rest_between_sets_seconds ?? null,
    sets: e.sets ?? null,
    notes: e.notes ?? null,
    reps: (e.reps ?? []).map((r, ri) => ({
      rep_index: r.rep_index ?? ri,
      time_seconds: r.time_seconds ?? null,
      split_times_seconds: r.split_times_seconds ?? null,
      wind_ms: r.wind_ms ?? null,
      completed: r.completed ?? true,
      notes: r.notes ?? null,
    })),
  }));
}

function competitionFromAi(comp: AthleteSessionLog['competition_result']): DraftCompetitionResult {
  if (!comp) return blankCompetitionResult();
  return {
    event: comp.event ?? null,
    competition_name: comp.competition_name ?? null,
    venue: comp.venue ?? null,
    lane: comp.lane ?? null,
    status: (comp.status as DraftCompetitionResult['status']) ?? 'completed',
    dns_reason: comp.dns_reason ?? null,
    conditions: comp.conditions ?? null,
    best_time_seconds: comp.best_time_seconds ?? null,
    notes: comp.notes ?? null,
    rounds: (comp.rounds ?? []).map((r, ri) => ({
      round_index: ri,
      round_type: (r.round_type as DraftCompetitionResult['rounds'][0]['round_type']) ?? 'final',
      time_seconds: r.time_seconds ?? null,
      wind_ms: r.wind_ms ?? null,
      ranking: r.ranking ?? null,
      pb: r.pb ?? false,
      sb: r.sb ?? false,
      relay_leg: r.relay_leg ?? null,
      relay_split_seconds: r.relay_split_seconds ?? null,
      notes: r.notes ?? null,
    })),
  };
}

function physioAreasFromAi(physio: AthleteSessionLog['physio_session']): DraftBodyArea[] {
  if (!physio?.body_areas) return [];
  return physio.body_areas.map((a, i) => ({
    area_index: i,
    area: a.area ?? '',
    side: (a.side as DraftBodyArea['side']) ?? null,
    injury_name: a.injury_name ?? null,
    pain_score_before: a.pain_score_before ?? null,
    pain_score_after: a.pain_score_after ?? null,
    treatment_type: a.treatment_type ?? null,
  }));
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AiReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Detect which mode: 'v2', 'v1', or 'empty'
  const [mode, setMode] = useState<'v2' | 'v1' | 'empty'>('empty');

  // ── V2 state ────────────────────────────────────────────────────────────────
  const [sessionMeta, setSessionMeta] = useState<SessionMeta>({
    session_type: 'strength',
    perceived_intensity: null,
    readiness_feel: null,
    readiness_pain_score: null,
    session_notes: null,
  });
  const [blocks, setBlocks] = useState<DraftBlock[]>([]);
  const [sprintSurface, setSprintSurface] = useState<string | null>(null);
  const [sprintFootwear, setSprintFootwear] = useState<string | null>(null);
  const [sprintEfforts, setSprintEfforts] = useState<DraftSprintEffort[]>([]);
  const [competitionResult, setCompetitionResult] = useState<DraftCompetitionResult>(blankCompetitionResult());
  const [physioBodyAreas, setPhysioBodyAreas] = useState<DraftBodyArea[]>([]);
  const [physioExerciseBlocks, setPhysioExerciseBlocks] = useState<DraftBlock[]>([]);
  const [physioProvider, setPhysioProvider] = useState<string | null>(null);
  const [physioClearanceStatus, setPhysioClearanceStatus] = useState<string | null>(null);
  const [physioNotes, setPhysioNotes] = useState<string | null>(null);
  const [parserVersion, setParserVersion] = useState<string>('2.0.0');

  // ── V1 state ────────────────────────────────────────────────────────────────
  const [v1Intensity, setV1Intensity] = useState<'low' | 'moderate' | 'high' | undefined>(undefined);
  const [v1Summary, setV1Summary] = useState('');
  const [v1Exercises, setV1Exercises] = useState<AiStructuredExercise[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchWorkout(id).then((data) => {
      if (data) {
        if (data.ai_structured && isAthleteSessionLog(data.ai_structured)) {
          const ai = data.ai_structured as AthleteSessionLog;
          const sessionType = (ai.session_type as SessionType) ?? inferSessionType(data.workout_types);
          setSessionMeta({
            session_type: sessionType,
            perceived_intensity: (ai.summary?.estimated_intensity as SessionMeta['perceived_intensity']) ?? null,
            readiness_feel: (ai.readiness?.feel as SessionMeta['readiness_feel']) ?? null,
            readiness_pain_score: ai.readiness?.pain_score ?? null,
            session_notes: ai.summary?.session_notes ?? null,
            parser_confidence: ai.summary?.parser_confidence ?? null,
            parser_version: ai.parser_version ?? null,
            parsing_warnings: ai.summary?.parsing_warnings ?? null,
          });
          setBlocks(blocksFromAi(ai.blocks));
          setSprintSurface(ai.sprint_session?.surface ?? null);
          setSprintFootwear(ai.sprint_session?.footwear ?? null);
          setSprintEfforts(sprintEffortsFromAi(ai.sprint_session));
          setCompetitionResult(competitionFromAi(ai.competition_result));
          setPhysioBodyAreas(physioAreasFromAi(ai.physio_session));
          setPhysioProvider(ai.physio_session?.provider ?? null);
          setPhysioClearanceStatus(ai.physio_session?.clearance_status ?? null);
          setPhysioNotes(ai.physio_session?.notes ?? null);
          setParserVersion(ai.parser_version ?? '2.0.0');
          // Physio exercises from physio_session.exercises
          if (ai.physio_session?.exercises && ai.physio_session.exercises.length > 0) {
            setPhysioExerciseBlocks([{
              ...blankBlock(0),
              block_name: 'Rehab Exercises',
              exercises: blocksFromAi([{ block_index: 0, block_name: null, block_type: 'main', exercises: ai.physio_session.exercises }])[0]?.exercises ?? [],
            }]);
          }
          setMode('v2');
        } else if (data.ai_structured) {
          const ai = data.ai_structured as AiStructuredWorkout;
          setV1Intensity(ai.estimated_intensity);
          setV1Summary(ai.summary ?? '');
          setV1Exercises(ai.exercises ?? []);
          setMode('v1');
        } else {
          setMode('empty');
        }
      }
      setLoading(false);
    });
  }, [id]);

  // ── Save: V2 ─────────────────────────────────────────────────────────────────
  async function handleSaveV2() {
    setSaving(true);
    setSaveError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const sessionType = sessionMeta.session_type;
      const isStrength = ['strength', 'conditioning', 'mixed', 'recovery'].includes(sessionType);
      const isSprint = sessionType === 'sprint';
      const isCompetition = sessionType === 'competition';
      const isPhysio = ['physio', 'rehab', 'prehab'].includes(sessionType);

      const structured: AthleteSessionLog = {
        parser_version: parserVersion,
        session_type: sessionType,
        session_subtype: null,
        perceived_intensity: sessionMeta.perceived_intensity ?? null,
        readiness: (sessionMeta.readiness_feel || sessionMeta.readiness_pain_score != null)
          ? { feel: sessionMeta.readiness_feel ?? null, pain_score: sessionMeta.readiness_pain_score ?? null, notes: null }
          : null,
        blocks: isStrength
          ? blocks.map((b) => ({
              block_index: b.block_index,
              block_name: b.block_name,
              block_type: b.block_type ?? null,
              emom_interval_seconds: b.emom_interval_seconds ?? null,
              circuit_rounds: b.circuit_rounds ?? null,
              intensity_percent: b.intensity_percent ?? null,
              notes: b.notes ?? null,
              exercises: b.exercises.map((ex) => ({
                exercise_index: ex.exercise_index,
                name: ex.name,
                name_original: ex.name_original ?? null,
                name_unknown: ex.name_unknown ?? false,
                category: ex.category ?? undefined,
                equipment: ex.equipment ?? null,
                laterality: ex.laterality ?? null,
                is_superset_with: ex.is_superset_with ?? null,
                notes: ex.notes ?? null,
                total_volume_kg: ex.total_volume_kg ?? null,
                max_weight_kg: ex.max_weight_kg ?? null,
                total_reps: ex.total_reps ?? null,
                set_count: ex.set_count ?? undefined,
                sets: ex.sets.map((s) => ({
                  set_index: s.set_index,
                  is_warmup: s.is_warmup ?? undefined,
                  is_failure: s.is_failure ?? undefined,
                  is_dropset: s.is_dropset ?? undefined,
                  weight_kg: s.weight_kg ?? null,
                  weight_type: (s.weight_type ?? null) as WeightType,
                  weight_value_raw: s.weight_value_raw ?? undefined,
                  added_weight_kg: s.added_weight_kg ?? null,
                  machine_level: s.machine_level ?? null,
                  reps: s.reps ?? null,
                  reps_left: s.reps_left ?? null,
                  reps_right: s.reps_right ?? null,
                  duration_seconds: s.duration_seconds ?? null,
                  distance_m: s.distance_m ?? null,
                  pace_seconds_per_km: s.pace_seconds_per_km ?? null,
                  time_seconds: s.time_seconds ?? null,
                  splits_seconds: s.splits_seconds ?? undefined,
                  effort_percent: s.effort_percent ?? null,
                  rest_seconds: s.rest_seconds ?? null,
                  rest_between_reps_seconds: s.rest_between_reps_seconds ?? null,
                  notes: s.notes ?? null,
                })),
              })),
            }))
          : undefined,
        sprint_session: isSprint
          ? {
              surface: sprintSurface ?? null,
              footwear: sprintFootwear ?? null,
              conditions: null,
              efforts: sprintEfforts.map((e) => ({
                effort_index: e.effort_index,
                drill_type: e.drill_type as any,
                distance_m: e.distance_m ?? null,
                phase_distances_m: e.phase_distances_m ?? undefined,
                effort_percent: e.effort_percent ?? null,
                footwear: e.footwear ?? null,
                rest_between_reps_seconds: e.rest_between_reps_seconds ?? null,
                rest_between_sets_seconds: e.rest_between_sets_seconds ?? null,
                sets: e.sets ?? null,
                notes: e.notes ?? null,
                reps: (e.reps ?? []).map((r) => ({
                  rep_index: r.rep_index,
                  time_seconds: r.time_seconds ?? null,
                  split_times_seconds: r.split_times_seconds ?? undefined,
                  wind_ms: r.wind_ms ?? null,
                  completed: r.completed,
                  notes: r.notes ?? null,
                })),
              })),
            }
          : null,
        competition_result: isCompetition
          ? {
              event: competitionResult.event ?? null,
              competition_name: competitionResult.competition_name ?? null,
              venue: competitionResult.venue ?? null,
              lane: competitionResult.lane ?? null,
              status: competitionResult.status,
              dns_reason: competitionResult.dns_reason ?? null,
              conditions: competitionResult.conditions ?? null,
              best_time_seconds: competitionResult.best_time_seconds ?? null,
              notes: competitionResult.notes ?? null,
              rounds: competitionResult.rounds.map((r) => ({
                round_type: r.round_type,
                time_seconds: r.time_seconds ?? null,
                wind_ms: r.wind_ms ?? null,
                ranking: r.ranking ?? null,
                pb: r.pb,
                sb: r.sb,
                relay_leg: r.relay_leg ?? null,
                relay_split_seconds: r.relay_split_seconds ?? null,
                notes: r.notes ?? null,
              })),
            }
          : null,
        physio_session: isPhysio
          ? {
              provider: physioProvider ?? null,
              clearance_status: physioClearanceStatus ?? null,
              notes: physioNotes ?? null,
              body_areas: physioBodyAreas.map((a) => ({
                area: a.area,
                side: a.side ?? null,
                injury_name: a.injury_name ?? null,
                pain_score_before: a.pain_score_before ?? null,
                pain_score_after: a.pain_score_after ?? null,
                treatment_type: a.treatment_type ?? null,
              })),
              exercises: physioExerciseBlocks.flatMap((b) =>
                b.exercises.map((ex) => ({
                  exercise_index: ex.exercise_index,
                  name: ex.name,
                  name_original: ex.name_original ?? null,
                  name_unknown: ex.name_unknown ?? false,
                  category: ex.category ?? undefined,
                  equipment: ex.equipment ?? null,
                  laterality: ex.laterality ?? null,
                  is_superset_with: ex.is_superset_with ?? null,
                  notes: ex.notes ?? null,
                  total_volume_kg: ex.total_volume_kg ?? null,
                  max_weight_kg: ex.max_weight_kg ?? null,
                  total_reps: ex.total_reps ?? null,
                  set_count: ex.set_count ?? undefined,
                  sets: ex.sets.map((s) => ({
                    set_index: s.set_index,
                    is_warmup: s.is_warmup ?? undefined,
                    is_failure: s.is_failure ?? undefined,
                    is_dropset: s.is_dropset ?? undefined,
                    weight_kg: s.weight_kg ?? null,
                    weight_type: (s.weight_type ?? null) as WeightType,
                    weight_value_raw: s.weight_value_raw ?? undefined,
                    added_weight_kg: s.added_weight_kg ?? null,
                    machine_level: s.machine_level ?? null,
                    reps: s.reps ?? null,
                    reps_left: s.reps_left ?? null,
                    reps_right: s.reps_right ?? null,
                    duration_seconds: s.duration_seconds ?? null,
                    distance_m: s.distance_m ?? null,
                    pace_seconds_per_km: s.pace_seconds_per_km ?? null,
                    time_seconds: s.time_seconds ?? null,
                    splits_seconds: s.splits_seconds ?? undefined,
                    effort_percent: s.effort_percent ?? null,
                    rest_seconds: s.rest_seconds ?? null,
                    rest_between_reps_seconds: s.rest_between_reps_seconds ?? null,
                    notes: s.notes ?? null,
                  })),
                }))
              ),
            }
          : null,
        summary: {
          session_notes: sessionMeta.session_notes ?? null,
          parser_confidence: sessionMeta.parser_confidence ?? undefined,
          parsing_warnings: sessionMeta.parsing_warnings ?? undefined,
          total_volume_kg: null,
          total_sets: null,
          total_reps: null,
          total_distance_m: null,
          total_work_duration_seconds: null,
          estimated_intensity: sessionMeta.perceived_intensity ?? null,
        },
      };

      const { error } = await updateAiStructured(id!, user.id, structured);
      if (error) throw new Error(error);
      router.back();
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  // ── Save: V1 ─────────────────────────────────────────────────────────────────
  async function handleSaveV1() {
    setSaving(true);
    setSaveError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const updated: AiStructuredWorkout = {
        exercises: v1Exercises.filter((ex) => ex.name.trim()),
        summary: v1Summary.trim() || undefined,
        estimated_intensity: v1Intensity,
      };
      const { error } = await updateAiStructured(id!, user.id, updated);
      if (error) throw new Error(error);
      router.back();
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function updateV1Exercise(index: number, field: keyof AiStructuredExercise, value: string) {
    setV1Exercises((prev) => {
      const next = [...prev];
      const ex = { ...next[index] };
      if (field === 'name' || field === 'notes' || field === 'reps') {
        (ex as any)[field] = value || undefined;
      } else {
        const n = parseFloat(value);
        (ex as any)[field] = isNaN(n) ? undefined : n;
      }
      next[index] = ex;
      return next;
    });
  }

  if (loading) {
    return (
      <View style={commonStyles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const sessionType = sessionMeta.session_type;
  const isStrength = ['strength', 'conditioning', 'mixed', 'recovery'].includes(sessionType);
  const isSprint = sessionType === 'sprint';
  const isCompetition = sessionType === 'competition';
  const isPhysio = ['physio', 'rehab', 'prehab'].includes(sessionType);

  return (
    <KeyboardAvoidingView
      style={commonStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={commonStyles.navHeader}>
        <TouchableOpacity onPress={() => router.back()} style={commonStyles.navHeaderSpacer} activeOpacity={0.7} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={commonStyles.navBackIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={commonStyles.navHeaderTitle}>Edit AI Report</Text>
        <View style={commonStyles.navHeaderSpacer} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">

        {/* ── V2 form ── */}
        {mode === 'v2' && (
          <>
            <SessionMetaPanel meta={sessionMeta} onChange={(patch) => setSessionMeta((p) => ({ ...p, ...patch }))} />

            {isStrength && (
              <StrengthPanel blocks={blocks} onChange={setBlocks} />
            )}

            {isSprint && (
              <SprintPanel
                efforts={sprintEfforts}
                surface={sprintSurface}
                footwear={sprintFootwear}
                onEffortsChange={setSprintEfforts}
                onMetaChange={(patch) => {
                  if (patch.surface !== undefined) setSprintSurface(patch.surface ?? null);
                  if (patch.footwear !== undefined) setSprintFootwear(patch.footwear ?? null);
                }}
              />
            )}

            {isCompetition && (
              <CompetitionPanel
                result={competitionResult}
                onChange={(patch) => setCompetitionResult((p) => ({ ...p, ...patch }))}
              />
            )}

            {isPhysio && (
              <PhysioPanel
                bodyAreas={physioBodyAreas}
                exerciseBlocks={physioExerciseBlocks}
                physioProvider={physioProvider}
                physioClearanceStatus={physioClearanceStatus}
                physioNotes={physioNotes}
                onBodyAreasChange={setPhysioBodyAreas}
                onExerciseBlocksChange={setPhysioExerciseBlocks}
                onDetailsChange={(patch) => {
                  if (patch.physioProvider !== undefined) setPhysioProvider(patch.physioProvider ?? null);
                  if (patch.physioClearanceStatus !== undefined) setPhysioClearanceStatus(patch.physioClearanceStatus ?? null);
                  if (patch.physioNotes !== undefined) setPhysioNotes(patch.physioNotes ?? null);
                }}
              />
            )}
          </>
        )}

        {/* ── V1 legacy form ── */}
        {(mode === 'v1' || mode === 'empty') && (
          <>
            <View style={s.section}>
              <Text style={commonStyles.sectionLabel}>INTENSITY</Text>
              <View style={s.intensityRow}>
                {INTENSITY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[s.intensityBtn, v1Intensity === opt && s.intensityBtnActive]}
                    onPress={() => setV1Intensity(opt)}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.intensityBtnText, v1Intensity === opt && s.intensityBtnTextActive]}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={s.section}>
              <Text style={commonStyles.sectionLabel}>SUMMARY</Text>
              <TextInput
                style={s.textInput}
                value={v1Summary}
                onChangeText={setV1Summary}
                placeholder="One sentence describing the session…"
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            <View style={s.section}>
              <Text style={commonStyles.sectionLabel}>EXERCISES</Text>
              {v1Exercises.map((ex, i) => (
                <View key={i} style={s.exerciseCard}>
                  <View style={s.exerciseNameRow}>
                    <TextInput
                      style={[s.textInput, { flex: 1 }]}
                      value={ex.name}
                      onChangeText={(v) => updateV1Exercise(i, 'name', v)}
                      placeholder="Exercise name"
                      placeholderTextColor={colors.textMuted}
                    />
                    <TouchableOpacity
                      onPress={() => setV1Exercises((p) => p.filter((_, idx) => idx !== i))}
                      activeOpacity={0.7}
                      style={s.deleteBtn}
                    >
                      <Text style={s.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={s.metricsRow}>
                    {(['sets', 'reps', 'weight_kg', 'distance_km', 'duration_seconds'] as const).map((field) => (
                      <View key={field} style={s.metricField}>
                        <Text style={s.metricLabel}>
                          {field === 'weight_kg' ? 'kg' : field === 'distance_km' ? 'km' : field === 'duration_seconds' ? 'sec' : field}
                        </Text>
                        <TextInput
                          style={s.metricInput}
                          value={ex[field] != null ? String(ex[field]) : ''}
                          onChangeText={(v) => updateV1Exercise(i, field, v)}
                          keyboardType={field === 'reps' ? 'default' : 'decimal-pad'}
                          placeholder="—"
                          placeholderTextColor={colors.textMuted}
                        />
                      </View>
                    ))}
                  </View>
                  <TextInput
                    style={[s.textInput, s.notesInput]}
                    value={ex.notes ?? ''}
                    onChangeText={(v) => updateV1Exercise(i, 'notes', v)}
                    placeholder="Notes (optional)"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={s.addBtn}
                onPress={() => setV1Exercises((p) => [...p, { name: '' }])}
                activeOpacity={0.8}
              >
                <Text style={s.addBtnText}>+ Add Exercise</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {saveError ? (
          <Text style={[commonStyles.textError, { marginHorizontal: spacing.md }]}>{saveError}</Text>
        ) : null}

        <TouchableOpacity
          style={[s.saveBtn, saving && s.saveBtnDisabled]}
          onPress={mode === 'v2' ? handleSaveV2 : handleSaveV1}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Text style={s.saveBtnText}>Confirm & Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scrollContent: { padding: spacing.md, paddingBottom: 80, gap: spacing.lg },
  section: { gap: spacing.sm },

  // V1 form styles (kept from before)
  intensityRow: { flexDirection: 'row', gap: 8 },
  intensityBtn: {
    flex: 1, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', borderRadius: 6,
  },
  intensityBtnActive: { borderColor: colors.accent, backgroundColor: colors.accent + '15' },
  intensityBtnText: { fontSize: 12, fontFamily: fonts.bodyMed, color: colors.textMuted },
  intensityBtnTextActive: { color: colors.accent },
  textInput: {
    backgroundColor: colors.surface1, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, fontFamily: fonts.body, color: colors.textPrimary,
  },
  exerciseCard: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: spacing.sm, gap: 8, backgroundColor: colors.card,
  },
  exerciseNameRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 10 },
  deleteBtnText: { fontSize: 14, color: colors.error, fontFamily: fonts.body },
  metricsRow: { flexDirection: 'row', gap: 6 },
  metricField: { flex: 1, gap: 3, alignItems: 'center' },
  metricLabel: {
    fontSize: 10, fontFamily: fonts.headingM, color: colors.textMuted,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  metricInput: {
    width: '100%', backgroundColor: colors.surface1,
    borderWidth: 1, borderColor: colors.border, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 8,
    fontSize: 13, fontFamily: fonts.body, color: colors.textPrimary, textAlign: 'center',
  },
  notesInput: { fontSize: 13, paddingVertical: 8 },
  addBtn: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    paddingVertical: 12, alignItems: 'center',
  },
  addBtnText: { fontSize: 13, fontFamily: fonts.bodyMed, color: colors.textMuted },

  saveBtn: {
    paddingVertical: 14, backgroundColor: colors.accent, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: 13, fontFamily: fonts.heading, color: colors.background,
    letterSpacing: 2, textTransform: 'uppercase',
  },
});
