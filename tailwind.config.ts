import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 22px 48px rgba(22, 61, 107, 0.12)"
      },
      borderRadius: {
        panel: "1.5rem"
      }
    }
  },
  plugins: []
};

export default config;
