import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, fonts, commonStyles } from '../../constants/tokens';

type Variant = 'default' | 'textarea';

type Props = TextInputProps & {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: Variant;
  maxLength?: number;
};

export default function InputField({
  label,
  value,
  onChangeText,
  variant = 'default',
  maxLength,
  ...rest
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {maxLength !== undefined && (
          <Text style={styles.counter}>{value.length} / {maxLength}</Text>
        )}
      </View>
      <TextInput
        style={[styles.input, variant === 'textarea' && styles.textarea]}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        multiline={variant === 'textarea'}
        textAlignVertical={variant === 'textarea' ? 'top' : 'center'}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: commonStyles.sectionLabel,
  counter: {
    fontSize: 11,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.surface1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },
  textarea: {
    minHeight: 90,
    paddingTop: 12,
  },
});
