/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        neonRed: "#ff003c",
        neonCyan: "#00f0ff",
        neonPurple: "#8b5cf6",
        bg: "#050507",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(255, 0, 60, 0.6)",
        cyan: "0 0 20px rgba(0, 240, 255, 0.6)",
      },
    },
  },
  plugins: [],
};
