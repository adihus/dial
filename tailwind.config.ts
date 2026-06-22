import type { Config } from "tailwindcss";

export default {
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F0EFEA",
        ink: "#0A0A0A",
        accent: "#E8112D",
        line: "#1A1A1A",
        muted: "#6B6B66",
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "Arial", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        serif: ['"Georgia"', '"Times New Roman"', "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
