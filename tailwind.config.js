/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,tsx}", "./public/*.html"],
  theme: {
    extend: {
      fontSize: {
        xxs: "0.6rem", // Your custom text size
      },
    },
  },
  plugins: [],
};
