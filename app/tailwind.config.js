/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,tsx,ts}", "./public/*.html"],
  theme: {
    extend: {
      fontSize: {
        xxs: "0.6rem", // Your custom text size
        xxxs: "0.4rem", // Your custom text size
      },
    },
  },
  plugins: [],
};
