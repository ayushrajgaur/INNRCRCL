// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        void:    "#07070e",
        surface: "#0f0f1a",
        "surface-2": "#161625",
        border:  "#1e1e30",
        amber:   "#f0c040",
        ash:     "#c8c8d8",
        muted:   "#5a5a78",
        error:   "#ff5a5a",
        success: "#4affa0",
      },
    },
  },
  plugins: [],
};

export default config;
