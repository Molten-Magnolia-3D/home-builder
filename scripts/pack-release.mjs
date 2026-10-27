import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const dist = join(root, 'dist')
if (!existsSync(dist)) {
  console.error('dist/ is missing. Run vite build first.')
  process.exit(1)
}

const staging = join(tmpdir(), `home-builder-pack-${Date.now()}`)
mkdirSync(staging)
cpSync(dist, join(staging, 'home-builder'), { recursive: true })
const zipPath = join(dist, 'home-builder-web.zip')
execFileSync('zip', ['-r', zipPath, 'home-builder'], { cwd: staging, stdio: 'inherit' })
rmSync(staging, { recursive: true, force: true })
console.log(`Wrote ${zipPath}`)
