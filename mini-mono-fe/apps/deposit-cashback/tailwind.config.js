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
    extend: {}
  },
  variants: {
    extend: {}
  },
  plugins: []
};
