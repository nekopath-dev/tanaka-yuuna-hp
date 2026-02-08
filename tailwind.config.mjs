/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#0505c7",
        "background-light": "#f9f9f7",
        "background-dark": "#1a1a1a",
        "text-main": "#2d2d2d",
        "text-muted": "#6e6e6e",
      },
      fontFamily: {
        display: ["'UD デジタル 教科書体 NK-R'", "'UD Digi Kyokasho NK-R'", "'Hiragino Sans'", "'Hiragino Kaku Gothic ProN'", "sans-serif"],
        serif: ["'UD デジタル 教科書体 NK-R'", "'UD Digi Kyokasho NK-R'", "'Hiragino Sans'", "'Hiragino Kaku Gothic ProN'", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        sm: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
