import { db } from './db.js'
import { getRelayStat, setRelayStat } from './stats.js'
import { randomRelay } from './relays.js'
import { contentView as debugView } from './view/home/chats/profile/info/content.js'
import { setHasData } from './relays.js'

export function aggregateEvent(hpub, e) {
  const TAG = 'aggregateEvent'
  const now = Date.now()
  return new Promise((resolve, reject) => {
    if (!e || !e.id || !e.sig || !e.pubkey) reject('invalid event')
    const tr = db.transaction('events', 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('events')
    const req = os.index('id').get(e.id)
    req.onsuccess = () => {
      if (!req.result) {
        console.log(`[${TAG}] new event`, JSON.stringify(e))
        const req = os.add({ hpub, firstSeen: now, data: e })
        req.onsuccess = () => {
          resolve()
        }
      } else {
        resolve()
      }
    }

  })
}

let requestTime
export function pingFeed(hpub) {
  const TAG = 'pingFeed'
  requestTime = Date.now()
  let thisRequestTime = requestTime
  const relay = randomRelay()
  console.log(`[${TAG}] query relay:`, relay)
  let avgConnect = getRelayStat(relay, 'avgConnect')
  let socket
  try {
    socket = new WebSocket(relay)
    console.log(`[${TAG}] created socket`, socket.readyState, WebSocket.OPEN)
  } catch (e) {
    setRelayStat(relay, 'lastConnect', { time: 0, date: requestTime })
    console.log(`[${TAG}] error:`, e)
  }
  socket.addEventListener('open', event => {
    const deltaTime = Date.now() - requestTime
    if (avgConnect) {
      const w0 = avgConnect.weight, w1 = w0 + 1
      const t0 = avgConnect.time, t1 = (t0 * w0 + deltaTime) / w1
      avgConnect = { time: t1, weight: w1 }
    } else {
      avgConnect = { time: deltaTime, weight: 1 }
    }
    setRelayStat(relay, 'avgConnect', avgConnect)
    setRelayStat(relay, 'lastConnect', { time: deltaTime, date: requestTime })
    if (thisRequestTime == requestTime) {
      debugView.deltaTime = deltaTime
      debugView.setRenderFlag(true)
    }
    console.log(`[${TAG}] open`, deltaTime)
    socket.send(JSON.stringify([
      'REQ',
      'feed',
      {
        'authors': [hpub],
        'limit': 5,
      }
    ]))
  })
  socket.addEventListener('close', e => {
    console.log(`[${TAG}] close`)
  })
  socket.addEventListener('error', e => {
    console.log(`[${TAG}] error`)
  })
  socket.addEventListener('message', e => {
    let m = JSON.parse(e.data)
    if (m[0] == 'EVENT' && m[1] == 'feed') {
      const event = m[2]
      aggregateEvent(hpub, event)
      setHasData(relay, hpub)
    } else {
      console.log(`[${TAG}] message`, JSON.stringify(m))
    }
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
    console.log (`from ${ONE_DAY_AGO_IN_SECONDS} to ${DISTANT_FUTURE}`)
    const req = os.index('createdAt').getAll(IDBKeyRange.bound(ONE_DAY_AGO_IN_SECONDS, DISTANT_FUTURE))
    req.onerror = function(e) {
      console.err(e)
    }
    const posts = []
    req.onsuccess = function(e) {
      resolve(Promise.all(e.target.result.filter(r => ![5, 31234].includes(r.data.kind)).map(r => {
        return new Promise((resolve, reject) => {
          const req = tr.objectStore('updates-viewed').get(r.data.id)
          req.onsuccess = function(e) {
            console.log(e)
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