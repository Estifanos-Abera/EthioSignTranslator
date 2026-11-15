/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream:   { DEFAULT: "#F2EDE4", warm: "#EDE6D9", deep: "#E0D5C5" },
        night:   { DEFAULT: "#1E2229", deep: "#141820", mid: "#252B34" },
        clay:    { DEFAULT: "#B33925", light: "#C94F38" },
        adey:    { DEFAULT: "#E5A93C", light: "#F4B942" },
        taupe:   { DEFAULT: "#6B5E52", light: "#8C7E72" },
        divider: "#D4C4B0",
      },
      fontFamily: {
        serif:    ["EB Garamond", "Georgia", "serif"],
        sans:     ["Inter", "system-ui", "sans-serif"],
        ethiopic: ["Noto Sans Ethiopic", "sans-serif"],
        mono:     ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
