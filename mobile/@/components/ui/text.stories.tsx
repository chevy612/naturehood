import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { Text } from './text';

const meta: Meta<typeof Text> = {
  title: 'UI/Text',
  component: Text,
  args: {
    variant: 'default',
    children: 'The quick brown fox jumps over the lazy dog',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'h1', 'h2', 'h3', 'h4', 'p', 'blockquote', 'code', 'lead', 'large', 'small', 'muted'],
    },
    children: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <View className="gap-4">
      <Text variant="h1">Heading 1</Text>
      <Text variant="h2">Heading 2</Text>
      <Text variant="h3">Heading 3</Text>
      <Text variant="h4">Heading 4</Text>
      <Text variant="lead">Lead — introductory paragraph text</Text>
      <Text variant="large">Large — emphasized body text</Text>
      <Text variant="p">Paragraph — The quick brown fox jumps over the lazy dog.</Text>
      <Text variant="blockquote">Blockquote — "Design is not just what it looks and feels like. Design is how it works."</Text>
      <Text variant="code">code snippet</Text>
      <Text variant="small">Small — footnote or helper text</Text>
      <Text variant="muted">Muted — secondary or disabled text</Text>
      <Text variant="default">Default — plain body text</Text>
    </View>
  ),
};

export const Headings: Story = {
  render: () => (
    <View className="gap-3">
      <Text variant="h1">H1 — Display</Text>
      <Text variant="h2">H2 — Section</Text>
      <Text variant="h3">H3 — Subsection</Text>
      <Text variant="h4">H4 — Group</Text>
    </View>
  ),
};

export const BodyStyles: Story = {
  render: () => (
    <View className="gap-3">
      <Text variant="lead">Lead text sets the context for what follows.</Text>
      <Text variant="p">Paragraph text is used for longer reading content with comfortable line height.</Text>
      <Text variant="large">Large body for emphasis.</Text>
      <Text variant="small">Small text for captions and helper messages.</Text>
      <Text variant="muted">Muted text for secondary information.</Text>
    </View>
  ),
};
