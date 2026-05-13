import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "var(--accent)",
        "accent-light": "var(--accent-light)",
        danger: "var(--danger)",
      },
      backgroundImage: {
        "gradient-accent": "var(--gradient-accent)",
      },
    },
  },
  plugins: [],
};
export default config;
