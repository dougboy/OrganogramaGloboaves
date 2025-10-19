/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: {
          DEFAULT: '#0ea5e9',
          dark: '#0284c7',
        },
        slate: {
          950: '#020617',
        },
      },
      boxShadow: {
        soft: '0 24px 60px -35px rgba(15, 23, 42, 0.4)',
      },
    },
  },
  plugins: [],
};

