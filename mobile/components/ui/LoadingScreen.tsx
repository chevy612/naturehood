import { ActivityIndicator, View } from 'react-native';
import { colors, commonStyles } from '../../constants/tokens';

export default function LoadingScreen() {
  return (
    <View style={commonStyles.centered}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}
