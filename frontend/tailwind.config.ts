import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact tokens from GEMINI.md
        "bg-void": "#0B0D10",
        "bg-panel": "#14171C",
        "bg-panel-raised": "#1B1F26",
        "border-hairline": "#262B33",
        "text-primary": "#E8EAED",
        "text-muted": "#8B93A1",
        "accent-scan": "#5EC8FF",
        "signal-critical": "#FF5468",
        "signal-high": "#FF9F43",
        "signal-medium": "#FFD166",
        "signal-low": "#6C9EFF",
        "signal-resolved": "#3DDC97",

        // Convenient semantic aliases
        void: "#0B0D10",
        panel: {
          DEFAULT: "#14171C",
          raised: "#1B1F26",
        },
        hairline: "#262B33",
        primary: "#E8EAED",
        muted: "#8B93A1",
        scan: "#5EC8FF",
      },
      fontFamily: {
        display: ["var(--font-sans-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "4px",
        md: "4px",
        lg: "6px",
      },
      boxShadow: {
        // Strictly no drop shadows according to GEMINI.md
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
