/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1C2526", // Negro
        secondary: "#F5A623", // Naranja
        background: "#E8ECEF", // Gris claro
        darkGray: "#4A5A5C", // Gris oscuro
        softWhite: "#F5F6F5", // Blanco suave
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
}