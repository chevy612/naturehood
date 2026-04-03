import { Button,  Label, Text, Input } from '@/components/ui';
import { Card, CardHeader, CardDescription,CardTitle, CardContent } from '@/components/ui/card';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  onBack: () => void;
  error?: string;
  loading?: boolean;
  success?: boolean;
}

export function ForgotPasswordForm({
  onSubmit,
  onBack,
  error,
  loading,
  success,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = React.useState('');

  function handleSubmit() {
    onSubmit(email);
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Forgot password?</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Enter your email to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          {success ? (
            <View className="gap-4">
              <Text className="text-center text-sm text-primary">
                Check your email for a verification code to reset your password.
              </Text>
              <Button variant="link" className="mx-auto" onPress={onBack}>
                <Text>Back to sign in</Text>
              </Button>
            </View>
          ) : (
            <View className="gap-6">
              <View className="gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                  returnKeyType="send"
                  value={email}
                  onChangeText={setEmail}
                  onSubmitEditing={handleSubmit}
                  editable={!loading}
                />
              </View>
              {error ? (
                <Text className="text-destructive text-sm text-center">{error}</Text>
              ) : null}
              <Button className="w-full" onPress={handleSubmit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text>Reset your password</Text>
                )}
              </Button>
              <Button variant="link" className="mx-auto" onPress={onBack} disabled={loading}>
                <Text>Back to sign in</Text>
              </Button>
            </View>
          )}
        </CardContent>
      </Card>
    </View>
  );
}
