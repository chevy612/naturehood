import { ResetPasswordForm } from '../../@/components/reset-password-form';
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

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(password: string, code: string) {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!code.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    // Verify the OTP first
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'recovery',
    });

    if (verifyError) {
      setError('Invalid or expired code. Please try again.');
      setLoading(false);
      return;
    }

    // Set the new password
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Sign out so the user signs in fresh with their new password
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
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
        <View style={styles.wordmarkContainer}>
          <Text style={commonStyles.authWordmark}>NATUREHOOD</Text>
        </View>
        <ResetPasswordForm
          onSubmit={handleSubmit}
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
