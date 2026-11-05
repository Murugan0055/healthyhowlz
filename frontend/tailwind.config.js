/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gym: {
          dark: '#0b0f17',
          card: '#131b26',
          border: '#223044'
        }
      }
    },
  },
  plugins: [],
}

