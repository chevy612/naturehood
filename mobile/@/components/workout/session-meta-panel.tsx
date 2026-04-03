import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export type SessionType =
  | 'strength' | 'sprint' | 'conditioning' | 'competition'
  | 'physio' | 'rehab' | 'recovery' | 'mixed';

export type PerceivedIntensity = 'low' | 'moderate' | 'high' | 'max';

export type ReadinessFeel = 'good' | 'great' | 'tired' | 'sore';

export type SessionMeta = {
  session_type: SessionType;
  perceived_intensity: PerceivedIntensity | null;
  readiness_feel: ReadinessFeel | null;
  readiness_pain_score: number | null;
  session_notes: string | null;
  parser_confidence?: number | null;
  parser_version?: string | null;
  parsing_warnings?: string[] | null;
};

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: 'strength',     label: 'Strength' },
  { value: 'sprint',       label: 'Sprint' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'competition',  label: 'Competition' },
  { value: 'physio',       label: 'Physio' },
  { value: 'rehab',        label: 'Rehab' },
  { value: 'recovery',     label: 'Recovery' },
  { value: 'mixed',        label: 'Mixed' },
];

const INTENSITIES: { value: PerceivedIntensity; label: string }[] = [
  { value: 'low',      label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high',     label: 'High' },
  { value: 'max',      label: 'Max' },
];

const READINESS_FEELS: ReadinessFeel[] = ['good', 'great', 'tired', 'sore'];

type Props = {
  meta: SessionMeta;
  onChange: (patch: Partial<SessionMeta>) => void;
};

export function SessionMetaPanel({ meta, onChange }: Props) {
  return (
    <View className="gap-6">
      {/* Session type */}
      <View className="gap-2">
        <Text variant="small">SESSION TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row flex-wrap gap-2">
            {SESSION_TYPES.map(({ value, label }) => {
              const active = meta.session_type === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => onChange({ session_type: value })}
                  className={`px-3.5 py-2 border ${active ? 'bg-primary border-primary' : 'border-border'}`}
                  activeOpacity={0.7}
                >
                  <Text className={active ? 'text-primary-foreground' : 'text-muted-foreground'}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Perceived intensity */}
      <View className="gap-2">
        <Text variant="small">INTENSITY</Text>
        <View className="flex-row flex-wrap gap-2">
          {INTENSITIES.map(({ value, label }) => {
            const active = meta.perceived_intensity === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => onChange({ perceived_intensity: active ? null : value })}
                className={`px-3.5 py-2 border ${active ? 'bg-primary border-primary' : 'border-border'}`}
                activeOpacity={0.7}
              >
                <Text className={active ? 'text-primary-foreground' : 'text-muted-foreground'}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Readiness */}
      <View className="gap-2">
        <Text variant="small">READINESS</Text>
        <View className="flex-row flex-wrap gap-2">
          {READINESS_FEELS.map((feel) => {
            const active = meta.readiness_feel === feel;
            return (
              <TouchableOpacity
                key={feel}
                onPress={() => onChange({ readiness_feel: active ? null : feel })}
                className={`px-3.5 py-2 border ${active ? 'bg-primary border-primary' : 'border-border'}`}
                activeOpacity={0.7}
              >
                <Text className={active ? 'text-primary-foreground' : 'text-muted-foreground'}>
                  {feel.charAt(0).toUpperCase() + feel.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View className="flex-row items-center gap-3 mt-1">
          <Text variant="muted" className="w-20">Pain score</Text>
          <Input
            value={meta.readiness_pain_score != null ? String(meta.readiness_pain_score) : ''}
            onChangeText={(v) => {
              if (v === '') { onChange({ readiness_pain_score: null }); return; }
              const n = Math.min(10, Math.max(0, Number(v)));
              if (!isNaN(n)) onChange({ readiness_pain_score: n });
            }}
            placeholder="0–10"
            keyboardType="decimal-pad"
            className="w-16 text-center"
          />
        </View>
      </View>

      {/* Session notes */}
      <View className="gap-2">
        <Text variant="small">SESSION NOTES</Text>
        <Textarea
          value={meta.session_notes ?? ''}
          onChangeText={(v) => onChange({ session_notes: v || null })}
          placeholder="AI summary or your own notes…"
          numberOfLines={3}
        />
      </View>

      {/* Parser confidence (read-only) */}
      {meta.parser_confidence != null && (
        <View className="flex-row items-center gap-2.5">
          <Text variant="muted">Parser confidence</Text>
          <Text variant="muted">{Math.round(meta.parser_confidence * 100)}%</Text>
          {meta.parser_version && (
            <Text variant="muted">v{meta.parser_version}</Text>
          )}
        </View>
      )}

      {/* Parsing warnings (read-only) */}
      {meta.parsing_warnings && meta.parsing_warnings.length > 0 && (
        <View className="border border-border p-3 gap-1">
          {meta.parsing_warnings.map((w, i) => (
            <Text key={i} variant="muted">{w}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
