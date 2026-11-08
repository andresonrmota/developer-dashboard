import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/**
 * Só no dev server: POST /__mapear roda scripts/mapear-projetos.mjs e devolve
 * o relatório. É o que o botão "Mapear projetos" chama. Em produção (Vercel)
 * não existe pasta de projetos nem este endpoint.
 */
function mapearProjetos(): Plugin {
  return {
    name: 'mapear-projetos',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__mapear', (req, res, next) => {
        if (req.method !== 'POST') return next()
        const script = fileURLToPath(new URL('./scripts/mapear-projetos.mjs', import.meta.url))
        execFile(process.execPath, [script, '--json'], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
          res.setHeader('Content-Type', 'application/json')
          if (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: (stderr || err.message).trim() }))
            return
          }
          res.end(stdout)
        })
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mapearProjetos()],
})
