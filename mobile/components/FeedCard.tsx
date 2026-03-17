import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import PillTag from './PillTag';
import { colors, fonts } from '../constants/tokens';

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

export default function FeedCard({ title, logged_date, duration_minutes, workout_types, workout_log, profile }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const displayName = profile?.name ?? profile?.username ?? 'Unknown';

  return (
    <View style={styles.card}>
      {/* Header: avatar + name/username + date */}
      <View style={styles.header}>
        <Avatar
          name={displayName}
          photoUrl={profile?.avatar_url ?? null}
          size="sm"
        />
        <View style={styles.meta}>
          <Text style={styles.name}>{displayName}</Text>
          {profile?.username ? (
            <Text style={styles.username}>@{profile.username}</Text>
          ) : null}
        </View>
        <Text style={styles.date}>{formatDate(logged_date)}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Pills: duration + workout types */}
      {(duration_minutes != null || workout_types?.length > 0) && (
        <View style={styles.pills}>
          {duration_minutes != null && (
            <PillTag label={`${duration_minutes} MIN`} variant="ghost-green" />
          )}
          {workout_types?.map(type => (
            <PillTag key={type} label={type.toUpperCase()} variant="ghost-dark" />
          ))}
        </View>
      )}

      {/* Notes */}
      {workout_log ? (
        <>
          <Text
            style={styles.log}
            numberOfLines={expanded ? undefined : 3}
            onTextLayout={e => {
              if (!expanded) setTruncated(e.nativeEvent.lines.length >= 3);
            }}
          >
            {workout_log}
          </Text>
          {(truncated || expanded) && (
            <TouchableOpacity onPress={() => setExpanded(prev => !prev)} activeOpacity={0.7}>
              <Text style={styles.seeMore}>{expanded ? 'See less' : 'See more'}</Text>
            </TouchableOpacity>
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  meta: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontFamily: fonts.bodyMed,
    color: colors.textPrimary,
  },
  username: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: 1,
  },
  date: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: 2,
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.heading,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  log: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    lineHeight: 18,
  },
  seeMore: {
    fontSize: 12,
    fontFamily: fonts.bodyMed,
    color: colors.accent,
  },
});
