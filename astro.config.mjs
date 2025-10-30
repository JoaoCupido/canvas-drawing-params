import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    vite: {
        plugins: [tailwindcss()],
    },
  site: 'https://joaocupido.github.io',
  base: '/canvas-drawing-params',
});
