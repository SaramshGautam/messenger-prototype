import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  useEffect(() => {
    const handler = (event) => { event.preventDefault(); setInstallEvent(event) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])
  if (!installEvent || dismissed) return null
  const install = async () => { await installEvent.prompt(); await installEvent.userChoice; setInstallEvent(null) }
  return <aside className="install-card"><Download /><div><strong>Install Messenger Prototype</strong><span>Add this sandbox to your home screen.</span></div><button onClick={install}>Install</button><button className="close" onClick={() => setDismissed(true)}><X size={16} /></button></aside>
}
