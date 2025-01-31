import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  plugins: [vue()],
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        sidebar: 'sidebar/sidebar.html',
        background: 'background/main.ts'
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js', // Move chunks to a subdirectory and ensure no leading underscores
        assetFileNames: 'assets/[name][extname]', // Move assets to a subdirectory
      },
    }
    //,
    //assetsDir: '', // Place assets directly in the dist folder
  },
  optimizeDeps: {
    exclude: ["@surrealdb/wasm"],
    esbuildOptions: {
      target: "esnext",
    },
  },
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  // Add cache configuration for Nix builds
  cacheDir: '.vite',
});



