import { View, Text } from 'react-native';
import { commonStyles } from '../../constants/tokens';

type Props = {
  title: string;
};

export default function PageHeader({ title }: Props) {
  return (
    <View style={commonStyles.pageHeader}>
      <Text style={commonStyles.pageHeaderTitle}>{title}</Text>
    </View>
  );
}
