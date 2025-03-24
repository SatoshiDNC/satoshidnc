import { db } from './db.js'

const TAG = 'relays'

export const relayViewDependencies = []

export const relays = []

export function randomRelay() {
  const relays = ['wss://relay.satoshidnc.com']//, 'wss://relay.fanfares.io']
  console.log(relays.length)
  return relays[Math.floor(Math.random() * relays.length)]
}

export function detectRelay(url) {
  const tr = db.transaction('relays', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('relays')
  const req = os.get(url)
  req.onsuccess = (e) => {
    const relay = req.result
    if (!relay) {
      console.log(`[${TAG}] cognized new relay: ${JSON.stringify(url)}`)
      os.put({ url })
      reloadRelays()
    }
  }
}

let reloadTimer
export function reloadRelays() {
  const reload = () => {
    reloadTimer = undefined
    const tr = db.transaction('relays', 'readonly')
    const os = tr.objectStore('relays')
    const req = os.openCursor()
    req.onerror = function(e) {
       console.error(e)
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
        console.log(`[${TAG}] total: ${relays.length}`)
      }
    }
  }
  if (reloadTimer) {
    clearTimeout(reloadTimer)
  }
  reloadTimer = setTimeout(reload, 10)
}

export const HAS_DATA = 'HAS_DATA'
export const HAS_NO_DATA = 'HAS_NO_DATA'

export function setRelation(relayUrl, contactHpub, relation) {
  const tr = db.transaction('relay-contact-relations', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('relay-contact-relations')
  const req = os.put({ relayUrl, contactHpub, relation, asOf: Date.now() })
  req.onsuccess = (e) => {
    // reload()
  }
}

export function setHasData(relayUrl, contactHpub) {
  const tr = db.transaction('relay-contact-relations', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('relay-contact-relations')
  const req = os.put({ relayUrl, contactHpub, relation: HAS_DATA, asOf: Date.now() })
  req.onsuccess = (e) => {
    const req = os.delete([ relayUrl, contactHpub, HAS_NO_DATA ])
    req.onsuccess = (e) => {
      // reload()
    }
  }
}

export function setHasNoData(relayUrl, contactHpub) {
  const tr = db.transaction('relay-contact-relations', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('relay-contact-relations')
  const req = os.put({ relayUrl, contactHpub, relation: HAS_NO_DATA, asOf: Date.now() })
  req.onsuccess = (e) => {
    // reload()
  }
}
