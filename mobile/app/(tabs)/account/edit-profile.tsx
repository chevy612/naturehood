import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { colors, fonts, spacing, commonStyles } from '../../../constants/tokens';
import { Avatar } from '@/components/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Text as UIText } from '@/components/ui/text';
import { fetchProfile, updateProfile, uploadAvatar, signOut, type Profile } from '../../../lib/actions/account';

export default function EditProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const data = await fetchProfile(user.id);
    if (data) {
      setProfile(data);
      setName(data.name ?? '');
      setUsername(data.username ?? '');
      setBio(data.bio ?? '');
    }
  }

  async function handleAvatarPick() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to update your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    const { avatarUrl, error } = await uploadAvatar(profile!.id, result.assets[0].uri);
    setUploading(false);

    if (error) {
      Alert.alert('Upload failed', error);
    } else if (avatarUrl) {
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
    }
  }

  async function handleSave() {
    if (!profile) return;

    const usernameClean = username.trim().toLowerCase();
    if (!/^[a-z0-9._]+$/.test(usernameClean)) {
      setMessage({ type: 'error', text: 'Username can only contain lowercase letters, numbers, dots, and underscores.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await updateProfile(profile.id, {
      name: name.trim(),
      username: usernameClean,
      bio: bio.trim() || null,
    });

    setSaving(false);

    if (error) {
      setMessage({ type: 'error', text: error });
    } else {
      setMessage({ type: 'success', text: 'Profile updated.' });
      setProfile(prev => prev ? { ...prev, name: name.trim(), username: usernameClean, bio: bio.trim() || null } : prev);
      setTimeout(() => router.back(), 800);
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handleAvatarPick} disabled={uploading} activeOpacity={0.8} style={styles.avatarWrapper} accessibilityLabel="Change profile photo" accessibilityRole="button">
          {uploading ? (
            <View style={styles.avatarLoader}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <Avatar name={profile.name ?? profile.username} photoUrl={profile.avatar_url} size="lg" />
          )}
          <View style={styles.cameraOverlay}>
            <Camera size={14} color={colors.background} />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>Tap to change photo</Text>
      </View>

      <View style={styles.form}>
        {message && (
          <Text style={message.type === 'success' ? styles.success : styles.error}>
            {message.text}
          </Text>
        )}

        <View>
          <Label>Display Name</Label>
          <Input value={name} onChangeText={setName} placeholder="Your full name" />
        </View>
        <View>
          <Label>Username</Label>
          <Input
            value={username}
            onChangeText={setUsername}
            placeholder="lowercase letters and numbers"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View>
          <Label>Bio</Label>
          <Textarea
            value={bio}
            onChangeText={setBio}
            placeholder="Tell the community about yourself..."
            maxLength={150}
          />
        </View>

        <Button onPress={handleSave} disabled={saving}><UIText>SAVE CHANGES</UIText></Button>
        <Button variant="destructive" onPress={handleSignOut}><UIText>Sign Out</UIText></Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   commonStyles.screen,
  content:     commonStyles.screenContent,
  centered:    commonStyles.centered,
  header:      commonStyles.navHeader,
  backBtn:     commonStyles.navHeaderSpacer,
  backIcon:    commonStyles.navBackIcon,
  headerTitle: commonStyles.navHeaderTitle,
  form:        commonStyles.formContainer,
  success:     commonStyles.textSuccess,
  error:       commonStyles.textError,

  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  avatarWrapper: { position: 'relative' },
  avatarLoader: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarHint: { fontSize: 12, fontFamily: fonts.body, color: colors.textMuted },
});
