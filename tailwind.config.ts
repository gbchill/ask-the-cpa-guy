import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#0f766e', // Teal
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#475569', // Slate
                    foreground: '#ffffff',
                },
                destructive: {
                    DEFAULT: '#ef4444', // Red
                    foreground: '#ffffff',
                },
                muted: {
                    DEFAULT: '#f1f5f9',
                    foreground: '#64748b',
                },
                accent: {
                    DEFAULT: '#f1f5f9',
                    foreground: '#0f766e',
                },
                background: {
                    DEFAULT: '#ffffff',
                },
                foreground: {
                    DEFAULT: '#0f172a',
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)'],
            },
        },
    },
    plugins: [],
};

export default config;