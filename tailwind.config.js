/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}",
            "./components/**/*.{js,jsx,ts,tsx}" // <--- ¡Importante!
  ],  
  presets: [require("nativewind/preset")],
  theme: {
    shadow: {
      around: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10, // Para Android
      },
    },
    extend: {
      colors: {
        primary: "#16A34A",
        primaryPressed: "#15803D",
        primaryDisabled: "#86EFAC",
      },
    },
    plugins: [],
  },
};
