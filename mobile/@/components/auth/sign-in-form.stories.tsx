import type { Meta, StoryObj } from '@storybook/react-native';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { SignInForm } from './sign-in-form';

const meta: Meta<typeof SignInForm> = {
  title: 'Auth/SignInForm',
  component: SignInForm,
  args: {
    onSubmit: action('onSubmit'),
    onForgotPassword: action('onForgotPassword'),
    onSignUp: action('onSignUp'),
    error: undefined,
    loading: false,
  },
  argTypes: {
    error: { control: 'text' },
    loading: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof SignInForm>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: 'Invalid email or password. Please try again.',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
