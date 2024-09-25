import { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,ts,css,scss}', './src/styles.scss'],
  darkMode: 'class', // Can also be 'media'
  important: true, // Makes Tailwind classes have higher priority
  theme: {
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
      boxShadow: {
        sm: 'box-shadow: 0 0 2px 0 rgb(0 0 0 / 0.05)',
        shadow:
          'box-shadow: 0 0 3px 0 rgb(0 0 0 / 0.1), 0 0 2px -1px rgb(0 0 0 / 0.1)',
        md: 'box-shadow: 0 0 6px -1px rgb(0 0 0 / 0.1), 0 0 4px -2px rgb(0 0 0 / 0.1)',
        lg: 'box-shadow: 0 0 15px -3px rgb(0 0 0 / 0.1), 0 0 6px -4px rgb(0 0 0 / 0.1)',
        xl: 'box-shadow: 0 0 25px -5px rgb(0 0 0 / 0.1), 0 0 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': 'box-shadow: 0 0 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: 'box-shadow: 0 0 #0000',
      },
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
