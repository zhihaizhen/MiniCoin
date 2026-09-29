const defaults = require('tailwindcss/defaultTheme');

module.exports = {
  theme: {
    ...defaults,
    extend: {
      fontFamily: {}
    }
  },
  variants: {
    extend: {}
  },
  plugins: []
};
