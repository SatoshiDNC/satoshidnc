import { db } from './db.js'
import { randomRelay } from './relays.js'
import { getRelay } from './nostor-app.js'
import { contacts } from './contacts.js'

export const eventTrigger = []

export function aggregateEvent(e) {
  return new Promise((resolve, reject) => {
    if (!e || !e.id || !e.sig || !e.pubkey) reject('invalid event')
    const TAG = 'aggregateEvent'
    const now = Date.now()
    const tr = db.transaction('events', 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('events')
    const req = os.index('id').get(e.id)
    req.onsuccess = () => {
      if (!req.result) {
        if (e.kind == 31234 /* draft */) {
          console.log(`[${TAG}] skipping event`, JSON.stringify(e))
          resolve()
        } else {
          console.log(`[${TAG}] new event`, JSON.stringify(e))
          const req = os.add({ hpub: e.pubkey, firstSeen: now, data: e })
          req.onsuccess = () => {
            resolve()
            eventTrigger.map(f => f())
          }
        }
      } else {
        resolve()
      }
    }

  })
}

let reqNotes_requestTime
export function reqNotes(hpub) {
  const TAG = 'reqNotes'
  reqNotes_requestTime = Date.now()
  let thisRequestTime = reqNotes_requestTime
  const defaultRelay = randomRelay()
  console.log(`[${TAG}] query relay:`, defaultRelay)
  getRelay(defaultRelay).then(relay => {
    if (thisRequestTime !== reqNotes_requestTime) return
    relay.send([
      'REQ',
      'notes',
      {
        'authors': [hpub],
        'limit': 5,
      }
    ])
  })
}

let reqFeed_requestTime
export function reqFeed() {
  const TAG = 'reqFeed'
  console.log(TAG)
  reqFeed_requestTime = Date.now()
  let thisRequestTime = reqFeed_requestTime
  const defaultRelay = 'relay.satoshidnc.com'
  console.log(`[${TAG}] query relay:`, defaultRelay)
  getRelay(defaultRelay).then(relay => {
    if (thisRequestTime !== reqFeed_requestTime) return
    relay.send([
      'REQ',
      'feed',
      {
        'authors': contacts.map(c=>c.hpub),
        'limit': 50,
      }
    ])
  })
}

export function getFeed(hpub) {
  return new Promise((resolve, reject) => {
    const tr = db.transaction('events', 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('events')
    const req = os.index('hpub_firstSeen').openCursor(window.IDBKeyRange.bound([hpub, 0], [hpub, 91729187740298]), 'prev')
    req.onerror = function(e) {
      console.err(e)
    }
    const posts = []
    req.onsuccess = function(e) {
      let cursor = e.target.result
      if (cursor) {
        let v = cursor.value
        posts.push(v)
        cursor.continue()
      } else {
        resolve(posts)
      }
    }
  })
}

export function getUpdates() {
  return new Promise((resolve, reject) => {
    const tr = db.transaction(['events', 'updates-viewed'], 'readonly', { durability: 'strict' })
    const os = tr.objectStore('events')
    const DISTANT_FUTURE = 91729187740298
    const ONE_DAY_AGO_IN_MILLISECONDS = Date.now() - 24 * 60 * 60 * 1000
    const ONE_DAY_AGO_IN_SECONDS = Math.floor(ONE_DAY_AGO_IN_MILLISECONDS / 1000)
    // console.log (`from ${ONE_DAY_AGO_IN_SECONDS} to ${DISTANT_FUTURE}`)
    const req = os.index('createdAt').getAll(IDBKeyRange.bound(ONE_DAY_AGO_IN_SECONDS, DISTANT_FUTURE))
    req.onerror = function(e) {
      console.err(e)
    }
    const posts = []
    req.onsuccess = function(e) {
      resolve(Promise.all(e.target.result.filter(r => ![5, 31234].includes(r.data.kind)).map(r => {
        return new Promise((resolve, reject) => {
          const req = tr.objectStore('updates-viewed').get(r.data.id)
          req.onerror = function(e) {
            console.err(e)
          }
          req.onsuccess = function(e) {
            resolve({ ...r, viewed: e.target.result !== undefined })
          }
        })
      })))
    }
  })
}

export function markUpdateAsViewed(id, eventCreatedAtTime) {
  return new Promise((resolve, reject) => {
    const tr = db.transaction('updates-viewed', 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('updates-viewed')
    const req = os.put({ id, eventTimeStamp: eventCreatedAtTime })
    req.onerror = function(e) {
      console.err(e)
    }
    req.onsuccess = function(e) {
      resolve()
    }
  })
}