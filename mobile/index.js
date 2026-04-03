import { registerRootComponent } from 'expo';

if (process.env.EXPO_PUBLIC_STORYBOOK === 'true') {
  const StorybookUIRoot = require('./.storybook').default;
  registerRootComponent(StorybookUIRoot);
} else {
  require('expo-router/entry');
}
