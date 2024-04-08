/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.go", "./templates/**/*.html", "./static/**/*.js"],
  theme: {
    extend: {
      aspectRatio: {
        "16/10": "16 / 10",
      },
      fontSize: {},
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
