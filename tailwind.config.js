/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  // Add RTL support
  corePlugins: {
    space: ({ addUtilities, theme, variants }) => {
      const utilities = {};
      const directions = {
        x: ['right', 'left'],
        y: ['top', 'bottom'],
      };

      for (const [key, properties] of Object.entries(directions)) {
        for (const margin of Object.entries(theme('margin'))) {
          utilities[`.space-${key}-${margin[0]} > :not([hidden]) ~ :not([hidden])`] = {
            [`margin-${properties[0]}`]: margin[1],
          };
        }
      }

      addUtilities(utilities, variants('space'));
    },
  },
};