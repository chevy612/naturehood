import { Text } from 'react-native';
import { commonStyles } from '../../constants/tokens';

type Props = {
  message: string;
};

export default function EmptyState({ message }: Props) {
  return (
    <Text style={[commonStyles.textBody, { textAlign: 'center', marginTop: 40 }]}>
      {message}
    </Text>
  );
}
