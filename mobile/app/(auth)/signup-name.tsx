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

export default function SignupNameScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleContinue() {
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    setError('');
    router.push({ pathname: '/(auth)/signup-username', params: { email, fullName: fullName.trim() } });
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
          <Text style={commonStyles.authTagline}>What's your name?</Text>
        </View>

        <View style={commonStyles.authForm}>
          <View style={commonStyles.authField}>
            <Text style={commonStyles.sectionLabel}>FULL NAME</Text>
            <TextInput
              style={commonStyles.authInput}
              placeholder="Jane Smith"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
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