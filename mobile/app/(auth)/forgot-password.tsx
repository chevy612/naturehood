import { ForgotPasswordForm } from '../../@/components/auth/forgot-password-form';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, commonStyles } from '../../constants/tokens';

export default function ForgotPasswordScreen() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(email: string) {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase()
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Navigate to verify screen after a short delay so user sees the success message
    setTimeout(() => {
      router.push({
        pathname: '/(auth)/signup-verify',
        params: { email: email.trim().toLowerCase(), type: 'recovery' },
      });
    }, 1500);
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
        <ForgotPasswordForm
          onSubmit={handleSubmit}
          onBack={() => router.back()}
          error={error}
          loading={loading}
          success={success}
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
