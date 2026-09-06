/** @type {import('tailwindcss').Config} */
const tokens = ['viz-neutral','viz-active','viz-compare','viz-swap','viz-success','viz-pivot','viz-danger', 'page', 'surface', 'subtle', 'ink', 'muted', 'line', 'accent', 'on-color',
  'neutral', 'active', 'success', 'danger', 'compare', 'swap', 'pivot',
  'active-soft', 'success-soft', 'danger-soft', 'compare-soft', 'swap-soft'];
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: Object.fromEntries(tokens.map(name => [name, `rgb(var(--${name}) / <alpha-value>)`])),
      borderRadius: { DEFAULT: '0.375rem', md: '0.5rem', lg: '0.75rem', xl: '1rem' },
      boxShadow: { sm: '0 1px 3px rgb(42 39 35 / .04)', lg: '0 8px 32px rgb(42 39 35 / .06)', xl: '0 16px 48px rgb(42 39 35 / .10)' },
    },
  },
  plugins: [],
};
