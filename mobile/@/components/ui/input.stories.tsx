import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  args: {
    placeholder: 'Type something...',
    editable: true,
  },
  argTypes: {
    editable: { control: 'boolean' },
    secureTextEntry: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    editable: false,
    placeholder: 'Disabled input',
  },
};

export const Password: Story = {
  args: {
    placeholder: 'Enter password',
    secureTextEntry: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState('Hello Naturehood');
    return (
      <Input
        value={value}
        onChangeText={setValue}
        placeholder="Controlled input"
      />
    );
  },
};
