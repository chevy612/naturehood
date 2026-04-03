import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Pressable, View } from 'react-native';

type AiStructuredWorkout = {
  exercises: { name: string }[];
  estimated_intensity?: 'low' | 'moderate' | 'high';
};

type Props = {
  id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_types: string[];
  ai_structured?: AiStructuredWorkout | null;
  onPress: (id: string) => void;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function WorkoutCard({
  id,
  title,
  logged_date,
  duration_minutes,
  workout_types,
  ai_structured,
  onPress,
}: Props) {
  return (
    <Pressable onPress={() => onPress(id)}>
      <View className="gap-2">
        <View className="flex-row justify-between items-center">
          <Text variant="muted">{formatDate(logged_date)}</Text>
          {duration_minutes != null && (
            <Badge variant="outline">
              <Text>{duration_minutes} min</Text>
            </Badge>
          )}
        </View>

        <Text variant="large" numberOfLines={2}>{title}</Text>

        {workout_types.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5">
            {workout_types.map((type) => (
              <Badge key={type} variant="secondary">
                <Text>{type}</Text>
              </Badge>
            ))}
          </View>
        )}

        {ai_structured?.exercises && (
          <View className="flex-row items-center gap-2 pt-1.5 border-t border-border">
            <Text variant="muted">
              {ai_structured.exercises.length} exercise{ai_structured.exercises.length !== 1 ? 's' : ''}
            </Text>
            {ai_structured.estimated_intensity && (
              <Badge variant={ai_structured.estimated_intensity === 'high' ? 'secondary' : 'outline'}>
                <Text>{ai_structured.estimated_intensity} intensity</Text>
              </Badge>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}
