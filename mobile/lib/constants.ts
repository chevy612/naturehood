import type { Theme } from '@react-navigation/native';

// NAV_THEME is used by react-native-reusables and @react-navigation/native
// to synchronise navigation chrome colours with the Naturehood dark design tokens.
// If react-native-reusables init regenerates this file, restore these values.
export const NAV_THEME: { dark: Theme } = {
  dark: {
    dark: true,
    colors: {
      background: 'hsl(300, 10%, 8%)',    // #141115
      card:       'hsl(300, 8%, 9%)',      // #1A1719
      border:     'hsl(270, 4%, 23%)',     // #3A373C
      primary:    'hsl(74, 84%, 62%)',     // #C8F04D
      text:       '#FFFFFF',
      notification: '#FF4D4D',
    },
    fonts: {
      regular: { fontFamily: 'DMSans_400Regular', fontWeight: '400' },
      medium:  { fontFamily: 'DMSans_500Medium',  fontWeight: '500' },
      bold:    { fontFamily: 'DMSans_700Bold',    fontWeight: '700' },
      heavy:   { fontFamily: 'Inter_700Bold',     fontWeight: '700' },
    },
  },
};
