import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Vercel sets VERCEL=1 during builds → serve from root there; keep /portfolio/ for GitHub Pages.
  base: process.env.VERCEL ? '/' : '/portfolio/',
  plugins: [react(), tailwindcss()],

})