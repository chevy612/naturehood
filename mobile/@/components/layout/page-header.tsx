import { Text } from '@/components/ui/text';
import { View } from 'react-native';

type Props = {
  title: string;
};

export function PageHeader({ title }: Props) {
  return (
    <View className='px-5 pt-6'>
      <Text variant="h1" className="text-left">{title}</Text>
    </View>
  );
}
