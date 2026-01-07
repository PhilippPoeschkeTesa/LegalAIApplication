/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tesa: {
          red: '#E30613',
          blue: '#009FE3',
        },
      },
    },
  },
  plugins: [],
};
