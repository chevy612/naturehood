import { SignInForm } from '../../@/components/sign-in-form';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, commonStyles } from '../../constants/tokens';

export default function LoginScreen() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(identifier: string, password: string) {
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <SignInForm
          onSubmit={handleLogin}
          onForgotPassword={() => router.push('/(auth)/forgot-password')}
          onSignUp={() => router.push('/(auth)/signup')}
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
});
