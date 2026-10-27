import { useEffect, useState } from 'react'
import { canPromptInstall, isAndroid, isIOS, isStandalone, promptInstall } from '../update/runtime'
import { APP_VERSION, RELEASES_REPO } from '../version'

type Release = {
  version: string
  date: string
  title: string
  notes: string[]
}

type Catalog = {
  latest: string
  releases: Release[]
}

function packageUrl(version?: string): string {
  const file = 'home-builder-web.zip'
  if (version) {
    return `https://github.com/${RELEASES_REPO}/releases/download/v${version}/${file}`
  }
  if (import.meta.env.DEV) {
    return `https://github.com/${RELEASES_REPO}/releases/latest/download/${file}`
  }
  return new URL(file, document.baseURI).href
}

function githubReleaseUrl(version: string): string {
  return `https://github.com/${RELEASES_REPO}/releases/tag/v${version}`
}

export function Releases() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [installHint, setInstallHint] = useState('')
  const [canInstall, setCanInstall] = useState(canPromptInstall())
  const installed = isStandalone()

  useEffect(() => {
    void fetch(new URL('releases.json', document.baseURI), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: Catalog) => setCatalog(data))
      .catch(() => {
        setCatalog({
          latest: APP_VERSION,
          releases: [],
        })
      })
    const timer = window.setInterval(() => setCanInstall(canPromptInstall()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const onInstall = async () => {
    if (canInstall) {
      const ok = await promptInstall()
      setInstallHint(ok ? 'Home Builder is on this device.' : 'Install was dismissed.')
      setCanInstall(canPromptInstall())
      return
    }
    if (isIOS()) {
      setInstallHint('On iPhone or iPad: tap Share, then Add to Home Screen.')
      return
    }
    if (isAndroid()) {
      setInstallHint('On Android: open the browser menu and tap Install app or Add to Home screen.')
      return
    }
    setInstallHint('In Chrome or Edge, use the install icon in the address bar — or download the desktop package below.')
  }

  const latest = catalog?.latest ?? APP_VERSION

  return (
    <div className="dashboard releases-page">
      <div className="hero">
        <p className="kicker">Releases</p>
        <h2>Version history, and the app on your desk or phone.</h2>
        <p className="lead">
          You are on {APP_VERSION}. When a new build is pushed, this copy updates itself. Listings
          already on the device stay where they are.
        </p>
        <div className="release-actions">
          <button className="btn primary" type="button" onClick={() => void onInstall()} disabled={installed}>
            {installed ? 'Installed on this device' : 'Install on this device'}
          </button>
          <a className="btn brass" href={packageUrl()} download="home-builder-web.zip">
            Download for desktop
          </a>
          <button className="btn" type="button" onClick={() => void onInstall()}>
            Add to phone
          </button>
        </div>
        {installHint && <p className="install-hint">{installHint}</p>}
        <p className="empty" style={{ paddingLeft: 0 }}>
          Desktop: Chrome or Edge can install the app, or unpack the zip and open it. Phone: install
          or Add to Home Screen. Same studio, same listings.
        </p>
      </div>

      <div className="section-head">
        <h3>History</h3>
        <span>Latest {latest}</span>
      </div>
      <ol className="release-list">
        {(catalog?.releases ?? []).map((release) => {
          const current = release.version === APP_VERSION
          return (
            <li key={release.version} className={`release-card ${current ? 'current' : ''}`}>
              <header>
                <div>
                  <p className="kicker">{release.date}</p>
                  <h3>
                    {release.version} · {release.title}
                  </h3>
                </div>
                <div className="release-links">
                  {current && <span className="chip">This copy</span>}
                  <a className="btn" href={packageUrl(release.version)}>
                    Download {release.version}
                  </a>
                  <a className="btn ghost" href={githubReleaseUrl(release.version)} target="_blank" rel="noreferrer">
                    Notes
                  </a>
                </div>
              </header>
              <ul>
                {release.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
