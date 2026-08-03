/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Arabic"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        sky: {
          50: '#f4fbff',
          100: '#e8f7ff',
          200: '#cfeeff',
          300: '#9fdbff',
          400: '#67c0ff',
          500: '#2f9dff',
          600: '#1f7fe6',
          700: '#1a69ba',
          800: '#185795',
          900: '#1a4c78',
        },
        coral: {
          50: '#fff8f4',
          100: '#ffece0',
          200: '#ffd1b0',
          300: '#ffb37d',
          400: '#ff8a4c',
          500: '#ff6b2d',
          600: '#e44f14',
          700: '#bc4216',
          800: '#983b17',
          900: '#7c3115',
        },
      },
      boxShadow: {
        soft: '0 18px 45px -18px rgba(15, 23, 42, 0.28)',
      },
    },
  },
  plugins: [],
};
