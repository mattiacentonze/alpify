/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        alpine: "#2F8F46",
        fresh: "#58CC02",
        sky: "#58A6FF",
        cream: "#FFF8E7",
        stone: "#6B7280",
        navy: "#102A43",
        reward: "#FFC857",
        soft: "#F6FAF4",
      },
      boxShadow: {
        soft: "0 18px 48px rgba(16, 42, 67, 0.12)",
      },
    },
  },
  plugins: [],
};
