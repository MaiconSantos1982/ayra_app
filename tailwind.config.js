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
                'background-light': '#1a1625',
                primary: '#7CC98D',
                'primary-dim': 'rgba(124, 201, 141, 0.14)',
                secondary: '#4E5E78',
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
