import { db } from './db.js'

const TAG = 'RELAYS'

export const relayViewDependencies = []

export const relays = []

export function detectRelay(url) {
  const tr = db.transaction('relays', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('relays')
  const req = os.get(url)
  req.onsuccess = (e) => {
    const relay = req.result
    if (!relay) {
      console.log(`[${TAG}] cognized new relay: ${JSON.stringify(relay)}`)
      os.put({ url })
    }
  }
  reloadRelays()
}

export function reloadRelays() {
  const tr = db.transaction('relays', 'readonly')
  const os = tr.objectStore('relays')
  const req = os.openCursor()
  req.onerror = function(e) {
     console.err(e)
  }
  const newList = []
  req.onsuccess = function(e) {
    let cursor = e.target.result
    if (cursor) {
      let v = cursor.value
      newList.push({ url: v.url, contacts: [] })
      cursor.continue()
    } else {
      relays.length = 0
      relays.push(...newList)
      relayViewDependencies.map(v => v.setRenderFlag(true))
      console.log(`[${TAG}] relays: ${relays.length}`)
    }
  }
}
