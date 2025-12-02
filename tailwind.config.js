/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#120d1d',
                'background-light': '#1e162e',
                primary: '#39ff14', // Neon Green
                'primary-dim': 'rgba(57, 255, 20, 0.1)',
                secondary: '#6a0dad', // Deep Purple
                text: '#ffffff',
                'text-muted': '#a0a0a0',
                danger: '#ff4444',
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            boxShadow: {
                neon: '0 0 10px rgba(57, 255, 20, 0.3)',
            }
        },
    },
    plugins: [],
}
