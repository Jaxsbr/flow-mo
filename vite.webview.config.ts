import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'packages/vscode-extension/media'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'webview.html'),
      output: {
        entryFileNames: 'webview.js',
        assetFileNames: 'webview.[ext]',
      },
    },
  },
})
