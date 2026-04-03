import '../global.css';

import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Preview } from '@storybook/react-native';

const StorybookDecorator: Preview['decorators'][number] = (Story) => (
  <SafeAreaProvider>
    <View className="flex-1 bg-background p-4">
      <Story />
    </View>
  </SafeAreaProvider>
);

const preview: Preview = {
  decorators: [StorybookDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
