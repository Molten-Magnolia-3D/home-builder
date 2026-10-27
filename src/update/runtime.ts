import { isNewer, LOCAL_VERSION, type VersionMeta } from '../version'

const SEEN_KEY = 'home-builder-seen-build'
const POLL_MS = 45_000

export type UpdateStatus = {
  current: VersionMeta
  remote: VersionMeta | null
  applying: boolean
  installed: boolean
  canInstall: boolean
}

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

let deferredInstall: InstallEvent | null = null
const listeners = new Set<() => void>()

function notify(): void {
  for (const listener of listeners) listener()
}

export function subscribeUpdate(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function versionUrl(): string {
  return new URL('version.json', document.baseURI).href
}

export async function fetchRemoteVersion(): Promise<VersionMeta | null> {
  try {
    const response = await fetch(versionUrl(), { cache: 'no-store' })
    if (!response.ok) return null
    return (await response.json()) as VersionMeta
  } catch {
    return null
  }
}

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return
  const url = new URL('sw.js', document.baseURI)
  await navigator.serviceWorker.register(url, { scope: './' })
  await navigator.serviceWorker.ready
}

export async function applyUpdate(): Promise<void> {
  const remote = await fetchRemoteVersion()
  if (remote) localStorage.setItem(SEEN_KEY, `${remote.version}+${remote.build}`)
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration()
    await reg?.update()
    reg?.waiting?.postMessage('skipWaiting')
  }
  window.location.reload()
}

export function rememberBuild(meta: VersionMeta): void {
  localStorage.setItem(SEEN_KEY, `${meta.version}+${meta.build}`)
}

export function seenBuild(): string | null {
  return localStorage.getItem(SEEN_KEY)
}

export function captureInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredInstall = event as InstallEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferredInstall = null
    notify()
  })
}

export function canPromptInstall(): boolean {
  return deferredInstall !== null
}

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
}

export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent)
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredInstall) return false
  await deferredInstall.prompt()
  const choice = await deferredInstall.userChoice
  deferredInstall = null
  notify()
  return choice.outcome === 'accepted'
}

export async function startUpdateLoop(onStatus: (status: UpdateStatus) => void): Promise<() => void> {
  await registerServiceWorker()
  captureInstallPrompt()

  let current = LOCAL_VERSION
  const remoteNow = await fetchRemoteVersion()
  if (remoteNow) current = remoteNow
  if (!seenBuild()) rememberBuild(current)

  const emit = (remote: VersionMeta | null, applying: boolean) => {
    onStatus({
      current,
      remote,
      applying,
      installed: isStandalone(),
      canInstall: canPromptInstall() && !isStandalone(),
    })
  }

  emit(remoteNow, false)

  const check = async () => {
    const remote = await fetchRemoteVersion()
    if (!remote) return
    if (isNewer(remote, current) || (seenBuild() && seenBuild() !== `${remote.version}+${remote.build}` && remote.build !== 'dev')) {
      emit(remote, true)
      await applyUpdate()
      return
    }
    current = remote
    emit(remote, false)
  }

  void check()

  const timer = window.setInterval(() => {
    void check()
  }, POLL_MS)
  const onFocus = () => {
    void check()
  }
  document.addEventListener('visibilitychange', onFocus)
  window.addEventListener('focus', onFocus)
  subscribeUpdate(() => emit(current, false))

  return () => {
    window.clearInterval(timer)
    document.removeEventListener('visibilitychange', onFocus)
    window.removeEventListener('focus', onFocus)
  }
}
