import { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  Share,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/avatar';
import { SectionLabel } from '@/components/layout/section-label';
import { WorkoutCard } from '@/components/workout/workout-card';
import { fetchProfile, fetchWorkouts, type Profile, type WorkoutSummary } from '../../../lib/actions/account';

export default function AccountScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [p, w] = await Promise.all([
      fetchProfile(user.id),
      fetchWorkouts(user.id),
    ]);

    if (p) setProfile(p);
    setWorkouts(w);
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

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
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#C8F04D" size="large" />
      </View>
    );
  }

  if (!profile) return null;

  const roleLabel =
    profile.role === 'athlete' ? 'Athlete' :
    profile.role === 'brand' ? 'Brand' : 'Explorer';

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
      data={workouts}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#C8F04D" />
      }
      ListHeaderComponent={
        <View>
          <View className="px-5 pt-5 pb-3 border-b border-border">
            <Text variant="large">@{profile.username}</Text>
          </View>

          <View className="flex-row items-center px-5 pt-6 gap-8">
            <Avatar name={profile.name ?? profile.username} photoUrl={profile.avatar_url} size="lg" />
            <View className="flex-1 items-center">
              <Text variant="large">{workouts.length}</Text>
              <Text variant="muted">Workouts</Text>
            </View>
          </View>

          <View className="px-5 pt-3 gap-2">
            <Text variant="large">{profile.name}</Text>
            <Badge variant="outline" className="self-start">
              <Text>{roleLabel}</Text>
            </Badge>
            {profile.bio ? <Text variant="muted">{profile.bio}</Text> : null}
          </View>

          <View className="flex-row gap-2.5 px-5 py-4">
            <Button
              variant="outline"
              className="flex-1"
              onPress={() => router.push('/account/edit-profile')}
            >
              <Text>Edit Profile</Text>
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onPress={handleShare}
            >
              <Text>Share Profile</Text>
            </Button>
          </View>

          <View className="px-5 pb-3 pt-1 border-t border-border">
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
      ItemSeparatorComponent={() => <View className="h-2.5" />}
      ListEmptyComponent={
        <Text variant="muted" className="text-center px-5 pt-6">No workouts logged yet.</Text>
      }
    />
  );
}
