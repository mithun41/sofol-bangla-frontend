// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        swing: {
          "0%, 100%": { transform: "rotate(-10deg)" },
          "50%": { transform: "rotate(10deg)" },
        },
      },
      animation: {
        swing: "swing 0.3s ease-in-out infinite",
      },
    },
  },
};
