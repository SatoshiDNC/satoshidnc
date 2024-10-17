import { db } from './db.js'

export const relayStatsViewDependencies = []

export const relayStats = []

export function setRelayStat(relay, key, value) {
  const tr = db.transaction('relay-stats', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('relay-stats')
  console.log(relay, key, value)
  const req = os.put({ relay, key, value })
  req.onsuccess = (e) => {
    reloadPersonalData()
  }
}

export function getRelayStat(relay, key) {
  return relayStats.filter(s => s.relay == relay && s.key == key)?.[0]?.value
}

export function reloadRelayStats() {
  const tr = db.transaction('relay-stats', 'readonly')
  const os = tr.objectStore('relay-stats')
  const req = os.openCursor()
  req.onerror = function(e) {
    console.err(e)
  }
  const newList = []
  req.onsuccess = function(e) {
    let cursor = e.target.result
    if (cursor) {
      let v = cursor.value
      newList.push({ relay: v.relay, key: v.key, value: v.value })
      cursor.continue()
    } else {
      relayStats.length = 0
      relayStats.push(...newList)
      relayStatsViewDependencies.map(v => v.setRenderFlag(true))
    }
  }
}
