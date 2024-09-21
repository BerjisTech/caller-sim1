import { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,ts,css,scss}', './src/styles.scss'],
  darkMode: 'class', // Can also be 'media'
  important: true, // Makes Tailwind classes have higher priority
  theme: {
    screens: {},
    container: {
      center: true,
      padding: {},
    },
    extend: {
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
      fontFamily: {},
      fontWeight: {},
      backgroundImage: {},
      colors: {},
      boxShadow: {},
      borderColor: ({ theme }) => theme('colors'),
      border: {},
      spacing: {},
      maxWidth: {},
      zIndex: {},
    },
  },
  plugins: [],
};

export default config;
