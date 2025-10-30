# DrawCanvas - URL-Configurable Drawing App

A drawing canvas application built with Astro and Tailwind CSS that can be configured entirely through URL parameters.

## Features

- 🎨 Drawing with customizable brush sizes and colors
- 🧹 Optional eraser tool
- 🖼️ Background image support with adjustable opacity
- 🔗 URL-based configuration
- 📱 Responsive design with touch support
- 🌙 Modern dark theme

## Getting Started

### Development

\`\`\`bash
npm install
npm run dev
\`\`\`

### Build

\`\`\`bash
npm run build
\`\`\`

### Deploy to GitHub Pages

1. Update `astro.config.mjs` with your GitHub username and repository name:
   \`\`\`js
   site: 'https://yourusername.github.io',
   base: '/your-repo-name',
   \`\`\`

2. Build the project:
   \`\`\`bash
   npm run build
   \`\`\`

3. Deploy the `dist` folder to GitHub Pages

## URL Parameters

- `size` - Brush size (1-50, default: 5)
- `colors` - Available colors (comma-separated hex or `*` for all)
- `eraser` - Show eraser tool (true/false)
- `bgImage` - Background image URL
- `bgOpacity` - Background opacity (0-100, default: 50)

### Example URLs

\`\`\`
/?size=10&colors=*&eraser=true
/?colors=#ff0000,#00ff00,#0000ff
/?bgImage=https://example.com/bg.jpg&bgOpacity=30
\`\`\`

## Pages

- `/` - Drawing canvas
- `/docs` - API documentation
- `/generate` - URL generator tool

## License

MIT
