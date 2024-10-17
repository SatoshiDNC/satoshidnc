export let db

export function init() {
  return new Promise((resolve, reject) => {
    const req = ((typeof window !== 'undefined')? window.indexedDB : indexedDB).open('db', 2)
    req.onsuccess = e => {
      db = req.result
      resolve()
    }
    req.onerror = e => {
      reject(e)
    }
    req.onupgradeneeded = e => {
      console.log(`db: upgrading from ${e.oldVersion} to ${e.newVersion}`)
      const db = e.target.result
      db.onerror = e => {
        console.error(e)
      }
      let os
      if (e.oldVersion < 1) {
        db.createObjectStore(`keys`, { keyPath: 'hpub' })
        db.createObjectStore(`contacts`, { keyPath: 'hpub' })
        db.createObjectStore(`relays`, { keyPath: 'url' })
        db.createObjectStore(`relay-contact-relations`, { keyPath: ['relayUrl', 'contactHpub', 'relation'] })
        db.createObjectStore(`personal`, { keyPath: ['hpub', 'key'] })
      }
      if (e.oldVersion < 2) {
        db.createObjectStore(`relay-stats`, { keyPath: ['relayUrl', 'key'] })
      }
    }
  })
}