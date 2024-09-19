/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "../shared-ui/**/*.{erb,html}",
    "./views/**/*.{erb,html}",
    "./public/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        seqblue: "#1B557A",
        seqorange: "#C74F13",
      }
    },
  },
  plugins: [],
};