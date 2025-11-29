/**
 * Tailwind CSS v4 Configuration
 *
 * En Tailwind v4, la configuración se hace principalmente en CSS usando @theme.
 * Este archivo solo se usa para plugins y extensiones avanzadas.
 * La mayoría de la configuración está en app/globals.css
 */
import type { Config } from "tailwindcss";

const config: Config = {
  // En Tailwind v4, content se detecta automáticamente
  // pero lo dejamos por compatibilidad con herramientas
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
};

export default config;