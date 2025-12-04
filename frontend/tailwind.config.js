/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Medify Brand Colors
        'medify-blue': {
          1: '#1A5FFF',
          2: '#2567FF',
          3: '#0E1C48',
        },
        'medify-secondary': {
          1: '#F4F7FF',
          2: '#97A6C4',
          3: '#E4ECFF',
        },
        'medify-gray': {
          1: '#0A0C0F',
          2: '#464646',
          3: '#767676',
          4: '#BEBEBE',
          5: '#E1E1E1',
        },
        primary: {
          50: '#f0fdfc',
          100: '#ccfbf9',
          200: '#99f6f3',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#02b8b0',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        sans: ['Helvetica Neue', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass-frame': '0 24px 80px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
}

