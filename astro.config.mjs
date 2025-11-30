import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
    build: {
        assetsDir: '_astro',
    },
  site: 'https://joaocupido.github.io/neuro-exercises',
  base: '/',
});
