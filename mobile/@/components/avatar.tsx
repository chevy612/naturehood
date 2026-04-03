import {
  Avatar as AvatarRoot,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';

type Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, string> = {
  sm: 'size-8',
  md: 'size-12',
  lg: 'size-[72px]',
};

const textSizeMap: Record<Size, string> = {
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-2xl',
};

type Props = {
  name: string;
  photoUrl?: string | null;
  size?: Size;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, photoUrl, size = 'md' }: Props) {
  return (
    <AvatarRoot className={`border-2 border-primary ${sizeMap[size]}`} alt={name}>
      {photoUrl ? <AvatarImage source={{ uri: photoUrl }} /> : null}
      <AvatarFallback>
        <Text className={textSizeMap[size]}>{getInitials(name)}</Text>
      </AvatarFallback>
    </AvatarRoot>
  );
}
