import { Text } from '@/components/ui/text';
import { View } from 'react-native';

type Props = {
  title: string;
};

export function PageHeader({ title }: Props) {
  return (
    <View>
      <Text variant="large">{title}</Text>
    </View>
  );
}
