import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Button } from './button';
import { Text } from './text';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: (args) => (
    <Button {...args}>
      <Text>Press me</Text>
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <View className="gap-3">
      {(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const).map(
        (variant) => (
          <Button key={variant} variant={variant}>
            <Text>{variant.charAt(0).toUpperCase() + variant.slice(1)}</Text>
          </Button>
        )
      )}
    </View>
  ),
};

export const Sizes: Story = {
  render: () => (
    <View className="gap-3">
      {(['sm', 'default', 'lg'] as const).map((size) => (
        <Button key={size} size={size}>
          <Text>{size}</Text>
        </Button>
      ))}
    </View>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <Button {...args} disabled>
      <Text>Disabled</Text>
    </Button>
  ),
};
