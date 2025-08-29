/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0f1',
          100: '#e1e1e3',
          200: '#c3c3c7',
          300: '#8585ab',
          400: '#47478f',
          500: '#000b4f',
          600: '#000a46',
          700: '#00083d',
          800: '#000734',
          900: '#00052b',
        },
        secondary: {
          50: '#f4f4f7',
          100: '#e9e9f0',
          200: '#d3d3e0',
          300: '#a6a6c7',
          400: '#7979ae',
          500: '#4c4fb1',
          600: '#434696',
          700: '#3a3c7b',
          800: '#313360',
          900: '#1a1b34',
        },
        accent: {
          50: '#f0f4ff',
          100: '#e1e9ff',
          200: '#c3d3ff',
          300: '#8fadff',
          400: '#5b87ff',
          500: '#1353b9',
          600: '#1148a6',
          700: '#0f3d93',
          800: '#0d3380',
          900: '#0b286d',
        },
        orange: {
          50: '#fff8f5',
          100: '#ffede0',
          200: '#ffd4b3',
          300: '#ffb380',
          400: '#ff944d',
          500: '#ff6633',
          600: '#e55a2e',
          700: '#cc4f29',
          800: '#b34424',
          900: '#99391f',
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}