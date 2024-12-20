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
        sidebar: 'sidebar/main.ts',
        background: 'background/main.ts'
      },
      output: {
        entryFileNames: '[name].js',       // No hash in entry filenames
        chunkFileNames: '[name].js',       // No hash in chunk filenames
        assetFileNames: '[name][extname]', // No hash in asset filenames
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
});



