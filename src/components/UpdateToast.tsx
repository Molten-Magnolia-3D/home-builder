import { useEffect, useState } from 'react'
import { startUpdateLoop, type UpdateStatus } from '../update/runtime'

export function UpdateToast() {
  const [status, setStatus] = useState<UpdateStatus | null>(null)

  useEffect(() => {
    let stop = () => {}
    void startUpdateLoop(setStatus).then((dispose) => {
      stop = dispose
    })
    return () => stop()
  }, [])

  if (!status?.applying || !status.remote) return null

  return (
    <div className="update-toast" role="status">
      Updating Home Builder to {status.remote.version}…
    </div>
  )
}
