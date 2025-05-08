/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{njk,js,html,md,yml,yaml,json}",
    ".eleventy.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        caveat: ['"Caveat Brush"', 'cursive'],
        nunito: ['"Nunito"', 'sans-serif'],
        jura: ['"Jura"', 'sans-serif'],
        dmsans: ['"DM Sans"', 'sans-serif'],
        courier: ['Courier', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}