import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isVercel = process.env.VERCEL === '1';

  return {
    base: mode === 'production' ? (isVercel ? '/' : '/gigagym/') : '/',
    plugins: [inspectAttr(), react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
