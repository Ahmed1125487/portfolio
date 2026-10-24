import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'postprocessing-vendor': ['@react-three/postprocessing', 'postprocessing'],
          'motion-vendor': ['gsap', 'lenis', 'framer-motion', 'split-type'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
