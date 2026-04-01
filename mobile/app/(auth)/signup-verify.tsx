import { useState, useEffect } from 'react';
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

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export default function SignupVerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleVerify() {
    if (code.trim().length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? 'Invalid code. Please try again.');
        return;
      }

      router.push({ pathname: '/(auth)/signup-name', params: { email } });
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendCooldown(60);
    setError('');
    try {
      await fetch(`${API_BASE}/api/auth/signup/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // silently fail — user can try again after cooldown
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
          <Text style={commonStyles.authTagline}>Check your email</Text>
        </View>

        <View style={commonStyles.authForm}>
          <Text style={commonStyles.textBody}>
            We sent a 6-digit code to {email}. Enter it below to continue.
          </Text>

          <View style={commonStyles.authField}>
            <Text style={commonStyles.sectionLabel}>VERIFICATION CODE</Text>
            <TextInput
              style={[commonStyles.authInput, { letterSpacing: 8, textAlign: 'center', fontSize: 20 }]}
              placeholder="000000"
              placeholderTextColor={colors.textMuted}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleVerify}
            />
          </View>

          {error ? <Text style={commonStyles.textError}>{error}</Text> : null}

          <TouchableOpacity
            style={[commonStyles.authButton, loading && commonStyles.authButtonDisabled]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={commonStyles.authButtonText}>VERIFY</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCooldown > 0}
            activeOpacity={0.7}
          >
            <Text style={[commonStyles.authLink, resendCooldown > 0 && { color: colors.textDisabled }]}>
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : 'Did not receive it? Resend code'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}