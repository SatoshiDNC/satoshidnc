import { db } from './db.js'

export const relayStatsViewDependencies = []

export const relayStats = []

export function setRelayStat(relayUrl, key, value) {
  const tr = db.transaction('relay-stats', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('relay-stats')
  const req = os.put({ relayUrl, key, value })
  req.onsuccess = (e) => {
    reloadRelayStats()
  }
}

export function getRelayStat(relayUrl, key) {
  return relayStats.filter(s => s.relayUrl == relayUrl && s.key == key)?.[0]?.value
}

export function reloadRelayStats() {
  const tr = db.transaction('relay-stats', 'readonly')
  const os = tr.objectStore('relay-stats')
  const req = os.openCursor()
  req.onerror = function(e) {
    console.error(e)
  }
  const newList = []
  req.onsuccess = function(e) {
    let cursor = e.target.result
    if (cursor) {
      let v = cursor.value
      newList.push({ relayUrl: v.relayUrl, key: v.key, value: v.value })
      cursor.continue()
    } else {
      relayStats.length = 0
      relayStats.push(...newList)
      relayStatsViewDependencies.map(v => v.setRenderFlag(true))
    }
  }
}
