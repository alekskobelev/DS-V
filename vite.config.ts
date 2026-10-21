/// <reference types="vitest" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { generateSitemapFile } from './src/utils/generate-sitemap';

/**
 * Плагин Vite для автоматической генерации sitemap.xml на этапе сборки (build-time)
 */
function sitemapBuildPlugin(): Plugin {
  return {
    name: 'vite-plugin-sitemap-generator',
    apply: 'build',
    closeBundle() {
      try {
        const result = generateSitemapFile();
        console.log(`[vite-sitemap-generator] Успешно сгенерирован sitemap.xml (${result.totalEntries} URL) на этапе сборки.`);
      } catch (err) {
        console.warn('[vite-sitemap-generator] Предупреждение при сборке sitemap.xml:', err);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      sitemapBuildPlugin(),
    ],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"]
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@root': path.resolve(__dirname, '.'),
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom', 'lucide-react', 'three'],
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'lucide-react',
      ],
      exclude: ['pg', 'nodemailer', 'firebase-admin', 'minio', 'compression', 'express'],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: false,
      ws: false,
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      target: 'es2022',
      minify: 'esbuild',
      sourcemap: false,
      emptyOutDir: true,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 2500,
      rollupOptions: {
        treeshake: {
          moduleSideEffects: 'no-external',
          preset: 'recommended',
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('three')) {
                return 'vendor-three';
              }
              if (id.includes('jspdf') || id.includes('html2canvas')) {
                return 'vendor-pdf';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('@google/genai')) {
                return 'vendor-genai';
              }
              if (id.includes('xlsx')) {
                return 'vendor-xlsx';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('@tiptap') || id.includes('prosemirror')) {
                return 'vendor-tiptap';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('marked') || id.includes('turndown') || id.includes('dompurify')) {
                return 'vendor-content';
              }
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
            }
            if (id.includes('src/data/')) {
              return 'app-data';
            }
          },
        },
      },
    },
  };
});
