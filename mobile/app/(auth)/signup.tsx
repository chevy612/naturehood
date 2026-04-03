import { SignUpForm } from '../../@/components/auth/sign-up-form';
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

export default function SignupScreen() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp(email: string, password: string) {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    setError('');

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push({
      pathname: '/(auth)/signup-verify',
      params: { email: email.trim().toLowerCase(), type: 'signup' },
    });

    setLoading(false);
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
        <SignUpForm
          onSubmit={handleSignUp}
          onSignIn={() => router.replace('/(auth)/login')}
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
