import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    950: '#050505',
                    900: '#0a0a0a',
                    800: '#141414',
                    700: '#1f1f1f',
                },
                accent: {
                    orange: '#e87c00',
                }
            },
        },
    },
    plugins: [],
};
export default config;
