const TAG = 'db'

export let db

export const log_and_reject = () => {
  console.error(`[${TAG}] database error`)
}

export function init() {
  return new Promise((resolve, reject) => {
    const req = ((typeof window !== 'undefined')? window.indexedDB : indexedDB).open('db', 9)
    req.onsuccess = e => {
      db = req.result
      resolve()
    }
    req.onerror = e => {
      console.error(`[${TAG}] database error`, e)
      reject(e)
    }
    req.onupgradeneeded = e => {
      console.log(`[${TAG}] upgrading from version ${e.oldVersion} to ${e.newVersion}`)
      const db = e.target.result
      db.onerror = e => {
        console.error(`[${TAG}]`, e)
      }
      let os
      if (e.oldVersion < 1) {
        db.createObjectStore('keys', { keyPath: 'hpub' })
        db.createObjectStore('contacts', { keyPath: 'hpub' })
        db.createObjectStore('relays', { keyPath: 'url' })
        db.createObjectStore('relay-contact-relations', { keyPath: ['relayUrl', 'contactHpub', 'relation'] })
        db.createObjectStore('personal', { keyPath: ['hpub', 'key'] })
      }
      if (e.oldVersion < 2) {
        db.createObjectStore('relay-stats', { keyPath: ['relayUrl', 'key'] })
        os = db.createObjectStore('events', { keyPath: 'data.id' })
        os.createIndex('id', 'data.id')
        os.createIndex('createdAt', 'data.created_at')
        os.createIndex('firstSeen', 'firstSeen')
        os.createIndex('hpub_firstSeen', ['hpub', 'firstSeen'])
        db.createObjectStore('updates-viewed', { keyPath: 'id' })
      }
      if (e.oldVersion < 3) {
        db.createObjectStore('profiles', { keyPath: 'hpub' })
        db.createObjectStore('deletions', { keyPath: 'id' })
      }
      if (e.oldVersion < 4) {
        os = db.createObjectStore('expirations', { keyPath: 'id' })
        os.createIndex('expiry', 'expiry')
      }
      if (e.oldVersion < 5) {
        os = db.createObjectStore('updates-new', { keyPath: 'hpub' })
      }
      if (e.oldVersion < 6) {
        os = db.createObjectStore('deals-pending', { keyPath: 'data.id' })
        os.createIndex('id', 'data.id')
      }
      if (e.oldVersion < 7) {
        os = db.createObjectStore('reactions-pending', { keyPath: 'id' })
        os.createIndex('id', 'id')
      }
      if (e.oldVersion < 8) {
        os = db.createObjectStore('channels-followed', { keyPath: 'hpub' })
        os.createIndex('hpub', 'hpub')
      }
      if (e.oldVersion < 9) {
        os = db.createObjectStore('incoming-reactions-pending', { keyPath: 'data.id' })
        os.createIndex('target', 'target')

        db.deleteObjectStore('reactions-pending')
        os = db.createObjectStore('outgoing-reactions-signed', { keyPath: 'id' })
        os.createIndex('id', 'id')
      }
    }
  })
}