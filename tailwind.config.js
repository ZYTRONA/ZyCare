/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0088CC',
        secondary: '#00A8E8',
        danger: '#DC2626',
        success: '#10B981',
        warning: '#F59E0B',
      },
    },
  },
  plugins: [],
}
