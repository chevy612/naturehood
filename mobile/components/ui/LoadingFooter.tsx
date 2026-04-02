import { ActivityIndicator } from 'react-native';
import { colors } from '../../constants/tokens';

type Props = {
  visible: boolean;
};

export default function LoadingFooter({ visible }: Props) {
  if (!visible) return null;
  return <ActivityIndicator color={colors.accent} style={{ marginVertical: 16 }} />;
}
