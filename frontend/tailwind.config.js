/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: "#FFFDF5",
          ink: "#171717",
          yellow: "#FFE156",
          blue: "#4D7CFE",
          coral: "#FF6B6B",
          lime: "#B8F56A",
          white: "#FFFFFF",
          muted: "#F3EFE6",
          darkMuted: "#262626",
        }
      },
      boxShadow: {
        neo: "4px 4px 0 #171717",
        "neo-sm": "2px 2px 0 #171717",
        "neo-lg": "6px 6px 0 #171717",
        "neo-xl": "8px 8px 0 #171717",
      },
      fontFamily: {
        heading: ["'Space Grotesk'", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      }
    },
  },
  plugins: [],
}
