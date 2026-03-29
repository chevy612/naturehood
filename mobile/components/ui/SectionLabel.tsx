import { Text } from 'react-native';
import { commonStyles } from '../../constants/tokens';

type Props = {
  text: string;
};

export default function SectionLabel({ text }: Props) {
  return <Text style={commonStyles.sectionLabel}>{text.toUpperCase()}</Text>;
}
