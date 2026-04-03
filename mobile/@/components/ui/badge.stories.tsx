import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Badge } from './badge';
import { Text } from './text';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  args: {
    variant: 'default',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  render: (args) => (
    <Badge {...args}>
      <Text>New</Text>
    </Badge>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <View className="flex-row flex-wrap gap-3">
      {(['default', 'secondary', 'destructive', 'outline'] as const).map((variant) => (
        <Badge key={variant} variant={variant}>
          <Text>{variant.charAt(0).toUpperCase() + variant.slice(1)}</Text>
        </Badge>
      ))}
    </View>
  ),
};

export const Labels: Story = {
  render: () => (
    <View className="flex-row gap-3">
      <Badge variant="default">
        <Text>Beta</Text>
      </Badge>
      <Badge variant="destructive">
        <Text>Deprecated</Text>
      </Badge>
      <Badge variant="secondary">
        <Text>Draft</Text>
      </Badge>
      <Badge variant="outline">
        <Text>Stable</Text>
      </Badge>
    </View>
  ),
};
