import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, fonts } from '../constants/tokens';

type Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, { container: number; text: number; fontSize: number }> = {
  sm: { container: 32, text: 32, fontSize: 12 },
  md: { container: 48, text: 48, fontSize: 16 },
  lg: { container: 72, text: 72, fontSize: 22 },
};

type Props = {
  name: string;
  photoUrl?: string | null;
  size?: Size;
};

export default function Avatar({ name, photoUrl, size = 'md' }: Props) {
  const { container, fontSize } = sizeMap[size];
  const initials = getInitials(name);

  return (
    <View
      style={[
        styles.ring,
        { width: container + 4, height: container + 4, borderRadius: (container + 4) / 2 },
      ]}
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={[styles.image, { width: container, height: container, borderRadius: container / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: container, height: container, borderRadius: container / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
        </View>
      )}
    </View>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: fonts.heading,
    color: colors.textPrimary,
  },
});
