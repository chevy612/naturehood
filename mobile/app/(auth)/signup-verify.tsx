import { VerifyEmailForm } from '../../@/components/auth/verify-email-form';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, commonStyles } from '../../constants/tokens';

export default function SignupVerifyScreen() {
  const { email, type } = useLocalSearchParams<{ email: string; type?: string }>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(code: string) {
    if (code.trim().length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    const otpType = type === 'recovery' ? 'recovery' : 'signup';

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: otpType,
    });

    if (verifyError) {
      setError('Invalid code. Please try again.');
      setLoading(false);
      return;
    }

    // For signup: auth state change in _layout.tsx navigates to /(tabs)
    // For recovery: navigate to reset password screen
    if (otpType === 'recovery') {
      router.replace({ pathname: '/(auth)/reset-password', params: { email } });
    }

    setLoading(false);
  }

  async function handleResend() {
    const otpType = type === 'recovery' ? 'recovery' : 'signup';
    if (otpType === 'recovery') {
      await supabase.auth.resetPasswordForEmail(email);
    } else {
      await supabase.auth.resend({ type: 'signup', email });
    }
  }

  return (
    <KeyboardAvoidingView
      style={commonStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <VerifyEmailForm
          email={email}
          type={type === 'recovery' ? 'recovery' : 'signup'}
          onSubmit={handleSubmit}
          onResend={handleResend}
          onCancel={() => router.back()}
          error={error}
          loading={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'center',
  },
  wordmarkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
});
