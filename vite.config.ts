import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,      // 🔒 Locks your port
    strictPort: true, // 🚫 Stops it from jumping to 5204
  },
});