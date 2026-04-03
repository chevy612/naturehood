const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Required for Storybook story auto-discovery
config.transformer = config.transformer ?? {};
config.transformer.unstable_allowRequireContext = true;

config.resolver = config.resolver ?? {};
config.resolver.alias = {
  ...(config.resolver.alias ?? {}),
  '@': path.resolve(__dirname, '@'),
};

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
