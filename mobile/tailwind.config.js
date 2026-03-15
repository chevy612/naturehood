/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#141115',
        surface1: '#1E1B1F',
        surface2: '#2A272C',
        card: '#1A1719',
        border: '#3A373C',
        accent: '#C8F04D',
        muted: '#6B6870',
        disabled: '#A09EA3',
        danger: '#FF4D4D',
      },
    },
  },
  plugins: [],
};
