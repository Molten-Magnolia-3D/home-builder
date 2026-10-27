import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function gitBuild(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return 'dev'
  }
}

function versionPlugin(): Plugin {
  return {
    name: 'home-builder-version',
    apply: 'build',
    generateBundle() {
      const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }
      const meta = {
        version: pkg.version,
        build: gitBuild(),
        builtAt: new Date().toISOString(),
      }
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: `${JSON.stringify(meta, null, 2)}\n`,
      })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), versionPlugin()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
