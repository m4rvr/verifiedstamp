/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        base: 'Inter var'
      }
    }
  },
  plugins: []
}
