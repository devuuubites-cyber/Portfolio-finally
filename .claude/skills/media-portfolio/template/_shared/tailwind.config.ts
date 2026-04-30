import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['ui-monospace', "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        // Scene-aligned palette pulled from the gameboy-palette city street.
        // Most surfaces stay neutral so editorial UI doesn't clash with the world.
        ink: {
          DEFAULT: "#0a0a0a",
          soft: "#141414",
        },
        bone: {
          DEFAULT: "#f4efe6",
          dim: "#cfc8bb",
          mute: "#8c8579",
        },
        moss: {
          DEFAULT: "#9bb886", // muted GB green
          deep: "#5d7a52",
          dim: "#3a4a36",
        },
        amber: {
          DEFAULT: "#d9c179", // sign / sodium light hint
        },
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 600ms ease-out both",
        "rise-in": "rise-in 700ms cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [animate],
} satisfies Config
