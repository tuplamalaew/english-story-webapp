/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)"],
                cute: ["var(--font-mali)"],
            },
            keyframes: {
                pop: {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.2)' },
                    '100%': { transform: 'scale(1)' },
                },
                'bounce-gentle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20%)' },
                }
            },
            animation: {
                pop: 'pop 0.3s ease-in-out',
                'bounce-gentle': 'bounce-gentle 0.5s ease-in-out',
            }
        },
    },
    plugins: [],
}
