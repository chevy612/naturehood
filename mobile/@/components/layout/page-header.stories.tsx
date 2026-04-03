import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { PageHeader } from './page-header';

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  args: {
    title: 'Page Title',
  },
  argTypes: {
    title: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {};

export const Examples: Story = {
  render: () => (
    <View className="gap-8">
      <PageHeader title="Community Feed" />
      <PageHeader title="Events" />
      <PageHeader title="My Profile" />
      <PageHeader title="Training Log" />
    </View>
  ),
};
