import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import * as React from 'react';
import { ActivityIndicator, type TextStyle, View } from 'react-native';

const RESEND_CODE_INTERVAL_SECONDS = 60;

const TABULAR_NUMBERS_STYLE: TextStyle = { fontVariant: ['tabular-nums'] };

interface VerifyEmailFormProps {
  email: string;
  type?: 'signup' | 'recovery';
  onSubmit: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onCancel: () => void;
  error?: string;
  loading?: boolean;
}

export function VerifyEmailForm({
  email,
  onSubmit,
  onResend,
  onCancel,
  error,
  loading,
}: VerifyEmailFormProps) {
  const [code, setCode] = React.useState('');
  const { countdown, restartCountdown } = useCountdown(RESEND_CODE_INTERVAL_SECONDS);

  function handleSubmit() {
    onSubmit(code);
  }

  async function handleResend() {
    await onResend();
    restartCountdown();
  }

  return (
    <View className="gap-6">
      <Card className="border-border/0 sm:border-border pb-4 shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">Verify your email</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Enter the verification code sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            <View className="gap-1.5">
              <Label htmlFor="code">Verification code</Label>
              <Input
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
              {error ? (
                <Text className="text-destructive text-sm text-center">{error}</Text>
              ) : null}
              <Button
                variant="link"
                size="sm"
                disabled={countdown > 0 || loading}
                onPress={handleResend}>
                <Text className="text-center text-xs">
                  Didn&apos;t receive the code? Resend{' '}
                  {countdown > 0 ? (
                    <Text className="text-xs" style={TABULAR_NUMBERS_STYLE}>
                      ({countdown})
                    </Text>
                  ) : null}
                </Text>
              </Button>
            </View>
            <View className="gap-3">
              <Button className="w-full" onPress={handleSubmit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text>Continue</Text>
                )}
              </Button>
              <Button variant="link" className="mx-auto" onPress={onCancel} disabled={loading}>
                <Text>Cancel</Text>
              </Button>
            </View>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}

function useCountdown(seconds = 60) {
  const [countdown, setCountdown] = React.useState(seconds);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = React.useCallback(() => {
    setCountdown(seconds);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  React.useEffect(() => {
    startCountdown();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startCountdown]);

  return { countdown, restartCountdown: startCountdown };
}
