import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Enterprise Blue Green — Family Wealth OS approved theme
        surface: "#f5f7fb",
        ink: "#111827",
        muted: "#667085",
        line: "#e5e7eb",
        brand: {
          navy: "#13284c",
          royal: "#1e40af",
          blue: "#2563eb",
          green: "#10b981",
        },
        sidebar: {
          top: "#08162d",
          mid: "#0d1d39",
          bottom: "#071225",
          text: "#eaf0ff",
        },
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#10b981",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.06)",
        soft: "0 1px 3px rgba(16, 24, 40, 0.06), 0 12px 32px rgba(16, 24, 40, 0.08)",
        sidebar: "0 0 40px rgba(3, 8, 20, 0.45)",
      },
      maxWidth: {
        content: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
