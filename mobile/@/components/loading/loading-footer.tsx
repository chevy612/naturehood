import { ActivityIndicator, View } from 'react-native';

type Props = {
  visible: boolean;
};

export function LoadingFooter({ visible }: Props) {
  if (!visible) return null;
  return (
    <View>
      <ActivityIndicator />
    </View>
  );
}
