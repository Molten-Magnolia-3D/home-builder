const CACHE = 'home-builder-runtime'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.endsWith('/version.json') || url.pathname.endsWith('version.json')) {
    event.respondWith(fetch(request, { cache: 'no-store' }))
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE)
      try {
        const fresh = await fetch(request)
        if (fresh.ok) await cache.put(request, fresh.clone())
        return fresh
      } catch {
        const cached = await cache.match(request)
        if (cached) return cached
        if (request.mode === 'navigate') {
          const shell = await cache.match('./index.html')
          if (shell) return shell
        }
        return Response.error()
      }
    })(),
  )
})
