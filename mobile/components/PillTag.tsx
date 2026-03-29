import { View, Text, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
import { colors, fonts } from '../constants/tokens';

type Variant = 'ghost-green' | 'ghost-dark' | 'accent';

type Props = {
  label: string;
  variant?: Variant;
  removable?: boolean;
};

const variantStyles: Record<Variant, { border: string; bg: string; text: string }> = {
  'ghost-green': { border: colors.accent + '40', bg: colors.accent + '15', text: colors.accent },
  'ghost-dark':  { border: colors.border,          bg: colors.surface1,       text: colors.textMuted },
  'accent':      { border: colors.accent,           bg: colors.accent,         text: colors.background },
};

export default function PillTag({ label, variant = 'ghost-green', removable = false }: Props) {
  const v = variantStyles[variant];

  return (
    <View
      style={[
        styles.pill,
        { borderColor: v.border, backgroundColor: v.bg },
      ]}
    >
      <Text style={[styles.label, { color: v.text }]}>{label}</Text>
      {removable && <X size={10} color={v.text} style={{ marginLeft: 3 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bodyMed,
    letterSpacing: 0.3,
  },
});
