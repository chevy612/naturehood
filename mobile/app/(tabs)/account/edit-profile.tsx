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
import Avatar from '../../../components/Avatar';
import InputField from '../../../components/ui/InputField';
import Button from '../../../components/ui/Button';

type Profile = {
  id: string;
  username: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
};

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

    const { data } = await supabase
      .from('profiles')
      .select('id, username, name, bio, avatar_url')
      .eq('id', user.id)
      .single();

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

    const asset = result.assets[0];
    setUploading(true);

    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const path = `${profile!.id}/avatar.${ext}`;

    const response = await fetch(asset.uri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

    if (uploadError) {
      Alert.alert('Upload failed', uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', profile!.id);
    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
    setUploading(false);
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

    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), username: usernameClean, bio: bio.trim() || null })
      .eq('id', profile.id);

    setSaving(false);

    if (error?.message?.includes('unique')) {
      setMessage({ type: 'error', text: 'Username is already taken.' });
    } else if (error) {
      setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Profile updated.' });
      setProfile(prev => prev ? { ...prev, name: name.trim(), username: usernameClean, bio: bio.trim() || null } : prev);
      setTimeout(() => router.back(), 800);
    }
  }

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() },
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={handleAvatarPick} disabled={uploading} activeOpacity={0.8} style={styles.avatarWrapper}>
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

      {/* Form */}
      <View style={styles.form}>
        {message && (
          <Text style={message.type === 'success' ? styles.success : styles.error}>
            {message.text}
          </Text>
        )}

        <InputField
          label="Display Name"
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
        />

        <InputField
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="lowercase letters and numbers"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <InputField
          label="Bio"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell the community about yourself..."
          variant="textarea"
          maxLength={150}
        />

        <Button title="SAVE CHANGES" onPress={handleSave} loading={saving} />
        <Button title="Sign Out" onPress={handleSignOut} variant="danger" />
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
  avatarHint: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
});
