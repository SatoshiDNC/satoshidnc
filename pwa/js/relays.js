import { db } from './db.js'

export function detectRelay(url) {
  const tr = db.transaction('relays', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('relays')
  const req = os.get(url)
  req.onsuccess = (e) => {
    const relay = req.result
    console.log(relay)
    if (!relay) {
      os.put({ url })
    }
  }
  reloadRelays()
}