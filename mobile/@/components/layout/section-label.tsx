import { Text } from '@/components/ui/text';

type Props = {
  text: string;
};

export function SectionLabel({ text }: Props) {
  return <Text variant="small">{text.toUpperCase()}</Text>;
}
