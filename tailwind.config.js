/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fb': '#1877F2',
        'instagram': '#E4405F',
        'twitter': '#000000',
        'pinterest': '#E60023',
      }
    },
  },
  plugins: [],
}
