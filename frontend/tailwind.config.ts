import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FF6500',
                'primary-dark': '#E55A00',
                'primary-light': '#FF8533',
                dark: '#1F2937',
                'dark-light': '#374151',
                'dark-lighter': '#4B5563',
            },
            fontFamily: {
                sans: ['system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
