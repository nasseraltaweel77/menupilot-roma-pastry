import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#19201d",
        leaf: "#0f766e",
        mint: "#d9f4eb",
        saffron: "#f5b942",
        clay: "#c45a35",
        paper: "#fbfaf7",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(25, 32, 29, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
