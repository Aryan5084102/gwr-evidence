/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        // Light surfaces (kept under "navy" key for minimal refactor)
        navy: {
          DEFAULT: "#F5F7FA",
          900: "#FFFFFF",
          800: "#FFFFFF",
          700: "#E5E7EB",
        },
        // Guinness Blue palette
        royal: {
          DEFAULT: "#0057B8",
          400: "#003B7A",
          300: "#3B82F6",
        },
        // Gold accent
        gold: {
          DEFAULT: "#C8A44D",
          400: "#B8943D",
          300: "#D4B062",
        },
        // Text & misc
        soft: "#1F2937",
        muted: "#6B7280",
        line: "#E5E7EB",
        surface: "#FFFFFF",
        canvas: "#F5F7FA",
      },
      backgroundImage: {
        "navy-gradient":
          "linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 100%)",
        "gold-shine":
          "linear-gradient(135deg, #C8A44D 0%, #D4B062 50%, #C8A44D 100%)",
        "blue-shine":
          "linear-gradient(135deg, #0057B8 0%, #003B7A 100%)",
      },
      boxShadow: {
        glow: "0 0 0 3px rgba(0, 87, 184, 0.08)",
        panel: "0 1px 2px rgba(15, 23, 42, 0.04)",
        soft: "0 1px 2px rgba(15, 23, 42, 0.05)",
      },
      borderRadius: {
        xl: "0.85rem",
        "2xl": "1.1rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
        fadeIn: "fadeIn 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
