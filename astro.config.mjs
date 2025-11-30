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
    site: isGithubPages
        ? 'https://joaocupido.github.io'
        : 'http://localhost:3002',
    base: isGithubPages ? '/neuro-exercises/' : '/',
});
