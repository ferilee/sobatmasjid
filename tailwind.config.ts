import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1f7a4c",
        accent: "#f59e0b",
      },
    },
  },
  plugins: [],
};

export default config;
