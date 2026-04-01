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
import { supabase } from '../../lib/supabase';
import { colors, commonStyles } from '../../constants/tokens';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export default function SignupPasswordScreen() {
  const { email, fullName, username } = useLocalSearchParams<{
    email: string;
    fullName: string;
    username: string;
  }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateAccount() {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, username, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      // Sign in immediately — triggers onAuthStateChange in _layout.tsx → navigates to /(tabs)
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError('Account created! Please sign in to continue.');
        router.replace('/(auth)/login');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={commonStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={commonStyles.authScreen} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32, minHeight: 44, justifyContent: 'center' }} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={commonStyles.navBackIcon}>‹</Text>
        </TouchableOpacity>

        <View style={commonStyles.authHeader}>
          <Text style={commonStyles.authWordmark}>NATUREHOOD</Text>
          <Text style={commonStyles.authTagline}>Set your password</Text>
        </View>

        <View style={commonStyles.authForm}>
          <View style={commonStyles.authField}>
            <Text style={commonStyles.sectionLabel}>PASSWORD</Text>
            <TextInput
              style={commonStyles.authInput}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="next"
            />
          </View>

          <View style={commonStyles.authField}>
            <Text style={commonStyles.sectionLabel}>CONFIRM PASSWORD</Text>
            <TextInput
              style={commonStyles.authInput}
              placeholder="Repeat your password"
              placeholderTextColor={colors.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleCreateAccount}
            />
          </View>

          {error ? <Text style={commonStyles.textError}>{error}</Text> : null}

          <TouchableOpacity
            style={[commonStyles.authButton, loading && commonStyles.authButtonDisabled]}
            onPress={handleCreateAccount}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={commonStyles.authButtonText}>CREATE ACCOUNT</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}