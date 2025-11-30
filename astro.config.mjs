import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    build: {
        assetsDir: '_astro',
    },
    site: 'https://joaocupido.github.io',
    base: isGithubPages ? '/neuro-exercises' : '/',
});
