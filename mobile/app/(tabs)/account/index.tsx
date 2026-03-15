import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { colors, fonts, spacing, commonStyles } from '../../../constants/tokens';
import Avatar from '../../../components/Avatar';
import SectionLabel from '../../../components/ui/SectionLabel';
import WorkoutCard from '../../../components/workout/WorkoutCard';

type Profile = {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  role: 'athlete' | 'brand' | 'other';
  avatar_url: string | null;
};

type WorkoutSummary = {
  id: string;
  title: string;
  logged_date: string;
  duration_minutes: number | null;
  workout_types: string[];
};

export default function AccountScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, workoutsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, username, name, bio, role, avatar_url')
        .eq('id', user.id)
        .single(),
      supabase
        .from('training_logs')
        .select('id, title, logged_date, duration_minutes, workout_types')
        .eq('user_id', user.id)
        .order('logged_date', { ascending: false })
        .limit(50),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (workoutsRes.data) setWorkouts(workoutsRes.data);
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  // Reload profile when returning from edit-profile
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleShare() {
    if (!profile) return;
    await Share.share({ message: `naturehood.app/@${profile.username}` });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!profile) return null;

  const roleLabel =
    profile.role === 'athlete' ? 'Athlete' :
    profile.role === 'brand' ? 'Brand' : 'Explorer';

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={workouts}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.accent} />
      }
      ListHeaderComponent={
        <View>
          {/* Page header */}
          <View style={styles.pageHeader}>
            <Text style={styles.usernameHeader}>@{profile.username}</Text>
          </View>

          {/* Profile hero */}
          <View style={styles.hero}>
            <Avatar name={profile.name ?? profile.username} photoUrl={profile.avatar_url} size="lg" />
            <View style={styles.stats}>
              <Text style={styles.statNumber}>{workouts.length}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
          </View>

          {/* Profile info */}
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{profile.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{roleLabel}</Text>
            </View>
            {profile.bio ? (
              <Text style={styles.bio}>{profile.bio}</Text>
            ) : null}
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnHalf]}
              onPress={() => router.push('/account/edit-profile')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnHalf]}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Share Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Workouts section label */}
          <View style={styles.sectionHeader}>
            <SectionLabel text="Workouts" />
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <WorkoutCard
          {...item}
          onPress={(id) => router.push(`/account/workout/${id}`)}
        />
      )}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No workouts logged yet.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: commonStyles.screen,
  content: { paddingBottom: 40 },
  centered: commonStyles.centered,

  pageHeader: commonStyles.pageHeader,
  usernameHeader: commonStyles.pageHeaderTitle,

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  stats: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: fonts.heading,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    marginTop: 2,
  },

  profileInfo: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: 6,
  },
  displayName: {
    fontSize: 18,
    fontFamily: fonts.heading,
    color: colors.textPrimary,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.accent + '40',
    backgroundColor: colors.accent + '15',
  },
  roleText: {
    fontSize: 10,
    fontFamily: fonts.headingM,
    color: colors.accent,
    letterSpacing: 1,
  },
  bio: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textMuted,
    lineHeight: 20,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnHalf: { flex: 1 },
  actionBtnText: {
    fontSize: 13,
    fontFamily: fonts.bodyMed,
    color: colors.textPrimary,
  },

  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  emptyText: {
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
});
