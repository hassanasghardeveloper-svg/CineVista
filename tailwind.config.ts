import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            screens: {
                xs: '475px',
            },
            colors: {
                dark: {
                    950: '#050505',
                    900: '#0a0a0a',
                    800: '#141414',
                    700: '#1f1f1f',
                },
                accent: {
                    orange: '#c2410c',
                }
            },
        },
    },
    plugins: [],
};
export default config;
