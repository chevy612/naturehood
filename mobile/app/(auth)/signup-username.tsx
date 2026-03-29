import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, commonStyles } from '../../constants/tokens';

export default function SignupUsernameScreen() {
  const { email, fullName } = useLocalSearchParams<{ email: string; fullName: string }>();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleContinue() {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      setError('Please choose a username.');
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(trimmed)) {
      setError('Username must be 3–30 characters and can only contain letters, numbers, and underscores.');
      return;
    }
    setError('');
    router.push({ pathname: '/(auth)/signup-password', params: { email, fullName, username: trimmed } });
  }

  return (
    <KeyboardAvoidingView
      style={commonStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={commonStyles.authScreen} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
          <Text style={commonStyles.navBackIcon}>‹</Text>
        </TouchableOpacity>

        <View style={commonStyles.authHeader}>
          <Text style={commonStyles.authWordmark}>NATUREHOOD</Text>
          <Text style={commonStyles.authTagline}>Pick a username</Text>
        </View>

        <View style={commonStyles.authForm}>
          <View style={commonStyles.authField}>
            <Text style={commonStyles.sectionLabel}>USERNAME</Text>
            <TextInput
              style={commonStyles.authInput}
              placeholder="your_handle"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
            <Text style={commonStyles.authHint}>Your unique @handle on Naturehood</Text>
          </View>

          {error ? <Text style={commonStyles.textError}>{error}</Text> : null}

          <TouchableOpacity
            style={[commonStyles.authButton, loading && commonStyles.authButtonDisabled]}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={commonStyles.authButtonText}>CONTINUE</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}