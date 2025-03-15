import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: "0.0.0.0",  
    port: process.env.PORT || 4173,  
    strictPort: true,  
    hmr: {
      host: "yang-liu-project2-1.onrender.com" 
    }
  },
  preview: {
    port: process.env.PORT || 4173,
    allowedHosts: ["yang-liu-project2-1.onrender.com"] 
  }
});
