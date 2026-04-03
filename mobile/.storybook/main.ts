import type { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  stories: [
    '../@/**/*.stories.?(m)[jt]s?(x)',
    '../stories/**/*.stories.?(m)[jt]s?(x)',
  ],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
  ],
};

export default main;
