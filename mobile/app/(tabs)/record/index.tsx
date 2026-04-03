import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../../lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { saveWorkout, fetchRecentTypes } from '../../../lib/actions/record';

const DRAFT_KEY = 'naturehood_draft_workout';

function today() {
  return new Date().toISOString().split('T')[0];
}

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

    loadTypes();
  }, []);

  useEffect(() => {
    if (!title && !workoutLog && workoutTypes.length === 0) return;
    const draft = { title, loggedDate, duration, workoutLog, isPublic, workoutTypes };
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [title, loggedDate, duration, workoutLog, isPublic, workoutTypes]);

  async function loadTypes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const types = await fetchRecentTypes(user.id);
    setPreviousTypes(types);
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

    const { error } = await saveWorkout({
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
    loadTypes();
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
      <View className="px-5 pt-5 pb-2">
        <Text variant="large">Log Workout</Text>
      </View>

      {success && (
        <View className="mx-5 mt-3 p-3 border border-border rounded-lg">
          <Text variant="muted">Workout saved!</Text>
        </View>
      )}

      <View className="p-5 gap-5">
        <View className="gap-1.5">
          <Text variant="small">WORKOUT TITLE *</Text>
          <Input
            placeholder="e.g. Push Day, Morning Run"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View className="gap-1.5">
          <Text variant="small">DATE</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={loggedDate}
            onChangeText={setLoggedDate}
          />
        </View>

        <View className="gap-1.5">
          <Text variant="small">DURATION (MINUTES)</Text>
          <Input
            placeholder="e.g. 60"
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
          />
        </View>

        <View className="gap-1.5">
          <Text variant="small">WORKOUT TYPES</Text>
          <View className="flex-row gap-2">
            <Input
              className="flex-1"
              placeholder="e.g. Strength"
              value={typeInput}
              onChangeText={setTypeInput}
              onSubmitEditing={() => addType(typeInput)}
              returnKeyType="done"
            />
            <Button variant="outline" size="sm" onPress={() => addType(typeInput)}>
              <Text>Add</Text>
            </Button>
          </View>

          {workoutTypes.length > 0 && (
            <View className="flex-row flex-wrap gap-1.5 mt-1.5">
              {workoutTypes.map(t => (
                <TouchableOpacity key={t} onPress={() => removeType(t)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Badge variant="default"><Text>{t}</Text></Badge>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {previousTypes.length > 0 && (
            <View className="mt-2 gap-1.5">
              <Text variant="muted" className="text-[11px]">Previous types:</Text>
              <View className="flex-row flex-wrap gap-1.5">
                {previousTypes.filter(t => !workoutTypes.includes(t)).slice(0, 8).map(t => (
                  <TouchableOpacity key={t} onPress={() => addType(t)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Badge variant="outline"><Text>{t}</Text></Badge>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View className="gap-1.5">
          <Text variant="small">WORKOUT NOTES</Text>
          <Textarea
            placeholder="e.g. Squat 4x8 @ 100kg..."
            value={workoutLog}
            onChangeText={setWorkoutLog}
            numberOfLines={10}
          />
        </View>

        <View className="flex-row items-center justify-between border border-border rounded-lg p-3.5">
          <View>
            <Text>Share publicly</Text>
            <Text variant="muted">Visible to the community feed</Text>
          </View>
          <Switch value={isPublic} onValueChange={setIsPublic} />
        </View>

        <Button onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text>SAVE WORKOUT</Text>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
