const TAG = 'db'

export let db

export function init() {
  return new Promise((resolve, reject) => {
    const req = ((typeof window !== 'undefined')? window.indexedDB : indexedDB).open('db', 4)
    req.onsuccess = e => {
      db = req.result
      resolve()
    }
    req.onerror = e => {
      reject(e)
    }
    req.onupgradeneeded = e => {
      console.log(`[${TAG}] upgrading from ${e.oldVersion} to ${e.newVersion}`)
      const db = e.target.result
      db.onerror = e => {
        console.error(`[${TAG}]`, e)
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
        os = db.createObjectStore(`events`, { keyPath: 'data.id' })
        os.createIndex(`id`, 'data.id')
        os.createIndex(`createdAt`, 'data.created_at')
        os.createIndex(`firstSeen`, 'firstSeen')
        os.createIndex(`hpub_firstSeen`, ['hpub', 'firstSeen'])
        db.createObjectStore(`updates-viewed`, { keyPath: 'id' })
      }
      if (e.oldVersion < 3) {
        db.createObjectStore(`profiles`, { keyPath: 'hpub' })
        db.createObjectStore(`deletions`, { keyPath: 'id' })
      }
      if (e.oldVersion < 4) {
        db.createObjectStore(`expirations`, { autoIncrement: true })
        os.createIndex(`expiry`, 'expiry')
      }
    }
  })
}