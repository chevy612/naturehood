import { Button, Input, Label, Text } from '@/components/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import * as React from 'react';
import { ActivityIndicator, TextInput, View } from 'react-native';

interface ResetPasswordFormProps {
  onSubmit: (password: string, code: string) => Promise<void>;
  error?: string;
  loading?: boolean;
}

export function ResetPasswordForm({ onSubmit, error, loading }: ResetPasswordFormProps) {
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const codeInputRef = React.useRef<TextInput>(null);

  function onPasswordSubmitEditing() {
    codeInputRef.current?.focus();
  }

  function handleSubmit() {
    onSubmit(password, code);
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Reset password</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Enter the code sent to your email and set a new password
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                placeholder="At least 8 characters"
                secureTextEntry
                returnKeyType="next"
                submitBehavior="submit"
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={onPasswordSubmitEditing}
                editable={!loading}
              />
            </View>
            <View className="gap-1.5">
              <Label htmlFor="code">Verification code</Label>
              <Input
                ref={codeInputRef}
                id="code"
                autoCapitalize="none"
                returnKeyType="send"
                keyboardType="numeric"
                autoComplete="sms-otp"
                textContentType="oneTimeCode"
                value={code}
                onChangeText={setCode}
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
                <Text>Reset Password</Text>
              )}
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
