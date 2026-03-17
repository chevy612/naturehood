import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { colors, fonts, commonStyles } from '../../constants/tokens';
import PillTag from '../../components/PillTag';

const DRAFT_KEY = 'naturehood_draft_workout';

export default function RecordScreen() {
  const [title, setTitle] = useState('');
  const [loggedDate, setLoggedDate] = useState(today());
  const [duration, setDuration] = useState('');
  const [workoutLog, setWorkoutLog] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);
  const [typeInput, setTypeInput] = useState('');
  const [previousTypes, setPreviousTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Restore draft on mount
  useEffect(() => {
    AsyncStorage.getItem(DRAFT_KEY).then(raw => {
      if (!raw) return;
      Alert.alert('Restore Draft?', 'You have an unsaved workout draft.', [
        { text: 'Discard', style: 'destructive', onPress: () => AsyncStorage.removeItem(DRAFT_KEY) },
        {
          text: 'Restore',
          onPress: () => {
            const draft = JSON.parse(raw);
            setTitle(draft.title ?? '');
            setLoggedDate(draft.loggedDate ?? today());
            setDuration(draft.duration ?? '');
            setWorkoutLog(draft.workoutLog ?? '');
            setIsPublic(draft.isPublic ?? true);
            setWorkoutTypes(draft.workoutTypes ?? []);
          },
        },
      ]);
    });

    loadPreviousTypes();
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (!title && !workoutLog && workoutTypes.length === 0) return;
    const draft = { title, loggedDate, duration, workoutLog, isPublic, workoutTypes };
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [title, loggedDate, duration, workoutLog, isPublic, workoutTypes]);

  async function loadPreviousTypes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('training_logs')
      .select('workout_types')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!data) return;
    const all = data.flatMap(r => r.workout_types ?? []);
    setPreviousTypes([...new Set(all)]);
  }

  function addType(type: string) {
    const t = type.trim();
    if (!t || workoutTypes.includes(t)) return;
    setWorkoutTypes(prev => [...prev, t]);
    setTypeInput('');
  }

  function removeType(type: string) {
    setWorkoutTypes(prev => prev.filter(t => t !== type));
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please add a workout title.');
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('training_logs').insert({
      user_id: user!.id,
      title: title.trim(),
      logged_date: loggedDate,
      duration_minutes: duration ? parseInt(duration, 10) : null,
      workout_log: workoutLog.trim() || null,
      workout_types: workoutTypes,
      is_public: isPublic,
    });

    setSaving(false);

    if (error) {
      Alert.alert('Error', 'Failed to save workout. Please try again.');
      return;
    }

    await AsyncStorage.removeItem(DRAFT_KEY);
    setTitle('');
    setLoggedDate(today());
    setDuration('');
    setWorkoutLog('');
    setWorkoutTypes([]);
    setIsPublic(true);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    loadPreviousTypes();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Log Workout</Text>
      </View>

      {success && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>Workout saved!</Text>
        </View>
      )}

      <View style={styles.form}>
        <Field label="WORKOUT TITLE *">
          <TextInput
            style={styles.input}
            placeholder="e.g. Push Day, Morning Run"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </Field>

        <Field label="DATE">
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            value={loggedDate}
            onChangeText={setLoggedDate}
          />
        </Field>

        <Field label="DURATION (MINUTES)">
          <TextInput
            style={styles.input}
            placeholder="e.g. 60"
            placeholderTextColor={colors.textMuted}
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
          />
        </Field>

        <Field label="WORKOUT TYPES">
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="e.g. Strength"
              placeholderTextColor={colors.textMuted}
              value={typeInput}
              onChangeText={setTypeInput}
              onSubmitEditing={() => addType(typeInput)}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addBtn} onPress={() => addType(typeInput)}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {workoutTypes.length > 0 && (
            <View style={styles.tags}>
              {workoutTypes.map(t => (
                <TouchableOpacity key={t} onPress={() => removeType(t)}>
                  <PillTag label={t} removable />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {previousTypes.length > 0 && (
            <View style={styles.suggestions}>
              <Text style={styles.suggestLabel}>Previous types:</Text>
              <View style={styles.tags}>
                {previousTypes.filter(t => !workoutTypes.includes(t)).slice(0, 8).map(t => (
                  <TouchableOpacity key={t} onPress={() => addType(t)}>
                    <PillTag label={t} variant="ghost-dark" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Field>

        <Field label="WORKOUT NOTES">
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="e.g. Squat 4x8 @ 100kg..."
            placeholderTextColor={colors.textMuted}
            value={workoutLog}
            onChangeText={setWorkoutLog}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />
        </Field>

        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Share publicly</Text>
            <Text style={styles.toggleSub}>Visible to the community feed</Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Text style={styles.buttonText}>SAVE WORKOUT</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: commonStyles.sectionLabel,
});

function today() {
  return new Date().toISOString().split('T')[0];
}

const styles = StyleSheet.create({
  container:  commonStyles.screen,
  content:    { paddingBottom: 48 },
  pageHeader: { ...commonStyles.pageHeader, marginBottom: 8 },
  pageTitle:  commonStyles.pageHeaderTitle,
  successBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1a2e10',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  successText: {
    color: colors.accent,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  input: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },
  textarea: {
    minHeight: 200,
    paddingTop: 12,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addBtn: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  addBtnText: {
    color: colors.textPrimary,
    fontFamily: fonts.bodyMed,
    fontSize: 13,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  suggestions: {
    marginTop: 8,
    gap: 6,
  },
  suggestLabel: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
  },
  toggleLabel: {
    fontSize: 13,
    fontFamily: fonts.bodyMed,
    color: colors.textPrimary,
  },
  toggleSub: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 13,
    fontFamily: fonts.heading,
    color: colors.background,
    letterSpacing: 2,
  },
});
