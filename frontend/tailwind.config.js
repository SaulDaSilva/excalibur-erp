/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        shell: "0 1px 2px rgba(2, 6, 23, 0.35)",
      },
    },
  },
  plugins: [],
}
