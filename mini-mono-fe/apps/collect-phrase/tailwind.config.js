/** @type {import('tailwindcss').Config} */
const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
module.exports = {
  presets: [require('../../tailwind.config.js')],
  purge: [
    join(__dirname, './pages/**/*.{js,ts,jsx,tsx}'),
    ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      textShadow: {
        sm: '0 2px 0 rgba(0,0,0,0.25)'
      }
    }
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.text-stroke-white': {
          '-webkit-text-stroke': '6px white'
        },
        '.text-stroke-white-sm': {
          '-webkit-text-stroke': '4px white'
        }
      });
    }
  ],
  variants: {
    extend: {}
  },
};
