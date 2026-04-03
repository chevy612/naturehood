import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { SectionLabel } from './section-label';

const meta: Meta<typeof SectionLabel> = {
  title: 'Layout/SectionLabel',
  component: SectionLabel,
  args: {
    text: 'Section Title',
  },
  argTypes: {
    text: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof SectionLabel>;

export const Default: Story = {};

export const Examples: Story = {
  render: () => (
    <View className="gap-4">
      <SectionLabel text="Recent Activity" />
      <SectionLabel text="Upcoming Events" />
      <SectionLabel text="My Stats" />
      <SectionLabel text="About Me" />
    </View>
  ),
};
