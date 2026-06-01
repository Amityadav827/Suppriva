import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0B5D3B",
        "dark-green": "#063921",
        gold: "#D9A520",
        cream: "#F7F6F2",
        card: "#FFFFFF",
        "border-light": "#E8E5DD",
        "text-dark": "#0F172A",
        muted: "#5B6475",
        "soft-green": "#EAF4EC",
        "button-hover": "#0E7A4F",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "24px",
        pill: "999px",
      },
      boxShadow: {
        premium: "0 24px 80px rgba(6, 57, 33, 0.12)",
        "premium-hover": "0 30px 90px rgba(6, 57, 33, 0.18)",
        gold: "0 18px 46px rgba(217, 165, 32, 0.26)",
      },
      maxWidth: {
        site: "1400px",
      },
    },
  },
  plugins: [],
};

export default config;
