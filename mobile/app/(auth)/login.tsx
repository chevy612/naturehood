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
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, commonStyles } from '../../constants/tokens';

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!identifier.trim() || !password) {
      setError('Please enter your email/username and password.');
      return;
    }

    setLoading(true);
    setError('');

    let email = identifier.trim().toLowerCase();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isEmail) {
      const { data, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', email)
        .single();

      if (lookupError || !data) {
        setError('No account found for that username.');
        setLoading(false);
        return;
      }
      email = data.email;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError('Incorrect email or password.');
    }

    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={commonStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={commonStyles.authScreen} keyboardShouldPersistTaps="handled">
        <View style={commonStyles.authHeader}>
          <Text style={commonStyles.authWordmark}>NATUREHOOD</Text>
          <Text style={commonStyles.authTagline}>Sign in to continue</Text>
        </View>

        <View style={commonStyles.authForm}>
          <View style={commonStyles.authField}>
            <Text style={commonStyles.sectionLabel}>EMAIL OR USERNAME</Text>
            <TextInput
              style={commonStyles.authInput}
              placeholder="you@example.com or username"
              placeholderTextColor={colors.textMuted}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          <View style={commonStyles.authField}>
            <Text style={commonStyles.sectionLabel}>PASSWORD</Text>
            <TextInput
              style={commonStyles.authInput}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {error ? <Text style={commonStyles.textError}>{error}</Text> : null}

          <TouchableOpacity
            style={[commonStyles.authButton, loading && commonStyles.authButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={commonStyles.authButtonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/signup')} activeOpacity={0.7}>
            <Text style={commonStyles.authLink}>
              Don't have an account?{' '}
              <Text style={[commonStyles.authLink, commonStyles.authLinkAccent]}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}