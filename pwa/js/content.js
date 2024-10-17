import { db } from './db.js'
import { getRelayStat, setRelayStat } from './stats.js'
import { randomRelay } from './relays.js'

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

let requestTime
export function pingFeed() {
  const TAG = 'pingFeed'
  requestTime = Date.now()
  v.requestTime = requestTime
  const relay = 'wss://relay.satoshidnc.com'//randomRelay()
  console.log('random relay:', relay)
  let avgConnect = getRelayStat(relay, 'avgConnect')
  try {
    v.socket = new WebSocket(relay)
    console.log(`[${TAG}] created socket`, v.socket.readyState, WebSocket.OPEN)
  } catch (e) {
    setRelayStat(relay, 'lastConnect', { time: 0, date: requestTime })
    console.log(`[${TAG}] error:`, e)
  }
  v.socket.addEventListener('open', event => {
    if (requestTime != v.requestTime) return
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
    v.deltaTime = deltaTime
    v.setRenderFlag(true)
    console.log(`[${TAG}] open`, deltaTime)
    v.socket.send(JSON.stringify([
      'REQ',
      'feed',
      {
        'authors': [v.hpub],
        'limit': 5,
      }
    ]))
  })
  v.socket.addEventListener('close', e => {
    console.log(`[${TAG}] close`)
  })
  v.socket.addEventListener('error', e => {
    console.log(`[${TAG}] error`)
  })
  v.socket.addEventListener('message', e => {
    let m = JSON.parse(e.data)
    if (m[0] == 'EVENT' && m[1] == 'feed') {
      const event = m[2]
      aggregateEvent(event)
    } else {
      console.log(`[${TAG}] message`, JSON.stringify(m))
    }
  })
}

export function getFeed() {
  return new Promise((resolve, reject) => {
    const tr = db.transaction('events', 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('events')
    const req = os.index('date').openCursor(null, 'next')
    req.onerror = function(e) {
      console.err(e)
    }
    req.onsuccess = function(e) {
      let cursor = e.target.result
      if (cursor) {
        let v = cursor.value
        console.log(v)
        cursor.continue()
      } else {
        console.log(`end`)
      }
    }
  })
}