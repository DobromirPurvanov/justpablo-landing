import fs from "fs"
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { cities } from "./src/lib/cities"

/** В продукция Vercel сервира /varna (cleanUrls). Dev сървърът по подразбиране
    иска /varna.html, което чупи вътрешните линкове — тук ги изравняваме. */
function cleanUrlsDev(): Plugin {
  return {
    name: 'clean-urls-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (url !== '/' && !path.extname(url)) {
          const candidate = path.resolve(__dirname, '.' + url + '.html')
          if (fs.existsSync(candidate)) req.url = url + '.html'
        }
        next()
      })
    },
  }
}

/** Montserrat е self-hosted, но `font-display: swap` сменя системния шрифт
    късно при бавна мрежа и измества hero съдържанието. `optional` запазва
    първоначалния layout, а кешираният шрифт се използва при следващи зареждания. */
function stableFontDisplay(): Plugin {
  return {
    name: 'stable-font-display',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('@fontsource/montserrat/') || !id.endsWith('.css')) return
      return code.replaceAll('font-display: swap', 'font-display: optional')
    },
  }
}

// Локалните страници се генерират с `npm run gen:cities` от src/lib/cities.ts
const cityInputs = Object.fromEntries(
  cities.map(c => [c.slug, path.resolve(__dirname, `${c.slug}.html`)])
)

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [stableFontDisplay(), react(), cleanUrlsDev()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        biskvitki: path.resolve(__dirname, 'biskvitki.html'),
        poveritelnost: path.resolve(__dirname, 'poveritelnost.html'),
        ...cityInputs,
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
