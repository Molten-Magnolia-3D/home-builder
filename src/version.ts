export const APP_NAME = 'Home Builder'
export const APP_VERSION = '0.2.0'
export const APP_CHANNEL = 'stable'
export const RELEASES_REPO = 'Molten-Magnolia-3D/home-builder'

export type VersionMeta = {
  version: string
  build: string
  builtAt: string
}

export const LOCAL_VERSION: VersionMeta = {
  version: APP_VERSION,
  build: 'dev',
  builtAt: new Date().toISOString(),
}

export function isNewer(remote: VersionMeta, current: VersionMeta): boolean {
  if (remote.version !== current.version) {
    return remote.version.localeCompare(current.version, undefined, { numeric: true }) > 0
  }
  if (remote.build === 'dev' || current.build === 'dev') return false
  return remote.build !== current.build
}
