import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

// When deploying to GitHub Pages under /<repo>/, set BASE_PATH at build time.
// Defaults to "/" so local dev and other hosts stay simple.
const base = process.env.BASE_PATH ?? "/"

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
