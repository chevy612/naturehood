import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Avatar } from '@/components/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

type Props = {
  id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_types: string[];
  workout_log: string | null;
  profile: {
    username: string;
    name: string;
    avatar_url: string | null;
  } | null;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function FeedCard({ title, logged_date, duration_minutes, workout_types, workout_log, profile }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const displayName = profile?.name ?? profile?.username ?? 'Unknown';

  return (
    <Card>
      <CardContent className="gap-2.5">
        {/* Header: avatar + name/username + date */}
        <View className="flex-row items-start gap-2.5">
          <Avatar name={displayName} photoUrl={profile?.avatar_url ?? null} size="sm" />
          <View className="flex-1">
            <Text variant="small">{displayName}</Text>
            {profile?.username ? (
              <Text variant="muted">@{profile.username}</Text>
            ) : null}
          </View>
          <Text variant="muted">{formatDate(logged_date)}</Text>
        </View>

        {/* Title */}
        <Text variant="large">{title}</Text>

        {/* Pills: duration + workout types */}
        {(duration_minutes != null || workout_types?.length > 0) && (
          <View className="flex-row flex-wrap gap-1.5">
            {duration_minutes != null && (
              <Badge variant="secondary">
                <Text>{duration_minutes} MIN</Text>
              </Badge>
            )}
            {workout_types?.map(type => (
              <Badge key={type} variant="outline">
                <Text>{type.toUpperCase()}</Text>
              </Badge>
            ))}
          </View>
        )}

        {/* Notes */}
        {workout_log ? (
          <>
            <Text
              variant="muted"
              numberOfLines={expanded ? undefined : 3}
              onTextLayout={e => {
                if (!expanded) setTruncated(e.nativeEvent.lines.length >= 3);
              }}
            >
              {workout_log}
            </Text>
            {(truncated || expanded) && (
              <Pressable onPress={() => setExpanded(prev => !prev)}>
                <Text variant="small">{expanded ? 'See less' : 'See more'}</Text>
              </Pressable>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
