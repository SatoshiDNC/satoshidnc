import { db } from './db.js'

export function aggregateEvent(e) {
  const TAG = 'aggregateEvent'
  const now = Date.now()
  return new Promise((resolve, reject) => {
    if (!e || !e.id || !e.sig || !e.pubkey) reject('invalid event')
    const tr = db.transaction('events', 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('events')
    const req = os.get(e.id)
    req.onsuccess = () => {
      if (!req.result) {
        console.log(`[${TAG}] new event`, JSON.stringify(e))
        const req = os.put({ id: e.id, firstSeen: now, data: e })
        req.onsuccess = () => {
          resolve()
        }
      } else {
        resolve()
      }
    }

  })
}
