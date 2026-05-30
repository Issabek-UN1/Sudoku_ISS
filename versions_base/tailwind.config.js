/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        morning: {
          50: '#fff8ec',
          100: '#ffedc8',
          500: '#ff9f1c',
          600: '#ed7d00'
        },
        brain: {
          500: '#4f46e5',
          700: '#3730a3'
        }
      },
      boxShadow: {
        soft: '0 18px 50px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};
