# Neuro Exercises

A collection of cognitive tools built with **Astro**, **Tailwind CSS**, and optional **Tauri** integration. It currently includes these interactive modules:

* **🖌️ Drawing Tool** – A URL‑configurable drawing canvas
* **🔗 Trail Making Test (TMT)** – A neuropsychological sequencing exercise

The app can be used:

* **Online**, with the help of GitHub Pages
* **Locally**, with `npm run dev`
* **As a desktop app**, using **Tauri**, which includes multiple execution modes

---

## Features

### Drawing Tool

* 🎨 Customizable brush sizes and colors
* 🧹 Optional eraser mode
* 🖼️ Background image support with opacity control
* 🔲 Grid/pattern background option (new)
* 🔗 Fully configurable through URL parameters
* 📱 Touch‑friendly and responsive

### Trail Making Test (TMT)

* 🔢 Auto-generated TMT layout (nodes placed at random or fixed, based on user's request)
* 🔤 Configurable symbol order: numbers / letters / mixed (new)
* ⏱️ Built‑in timer
* 🖼️ Background image support with opacity control (new)
* 🔲 Grid/pattern background option (new)
* 📝 Result logging (WIP) (new)
* 📊 URL‑controlled configuration

---

## Getting Started

### Development

```bash
npm install
npm run dev
```

---

## Tauri Usage

The project also supports **Tauri**, allowing it to run as a full desktop application.

### 1. Local Tauri Development (served by Astro dev server)

```bash
npx tauri dev
```

### 2. Tauri Build (production executable)

```bash
npx tauri build
```

### Localhost Exposure in Final Build

The **final Tauri build** also exposes a local web server accessible externally:

```
http://localhost:9527/
```

This allows you to open the app in a browser even when running the desktop executable.

---

## Pages

* `/` – Home menu
* `/drawing` – Drawing Canvas
* `/tmt` – Trail Making Test
* `/[drawing|tmt]/docs` – API documentation of certain tool
* `/[drawing|tmt]/generate` – URL generator for certain tool

