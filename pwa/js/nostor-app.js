import { relayUrl } from './nostor-util.js'
import { aggregateEvent } from './content.js'
import { getRelayStat, setRelayStat } from './stats.js'
import { setHasData } from './relays.js'
import { defaultKey, sign } from './keys.js'
import { Relay } from 'nostr-tools/relay'

let relays = []

export function homeRelay() {
  return getRelay('relay.satoshidnc.com')
}

export function getRelay(name) {
  const TAG = 'connection'
  const requestTime = Date.now()
  const relay = relayUrl(name)
  let r = relays.filter(r => r.url == relay)?.[0]
  if (r?.state === 'open') {
    return new Promise((resolve, reject) => {
      resolve(r)
    })
  }
  if (r?.state === 'init') {
    return r.promise
  }
  // Remove the existing non-open relay (if any)
  const filteredRelays = relays.filter(r => r.url != relay)
  relays.length = 0
  filteredRelays.forEach(r => relays.push(r))
  // Initiate connection
  let avgConnect = getRelayStat(relay, 'avgConnect')
  let socket
  let authEvent
  try {
    socket = new WebSocket(relay)
    console.log(`[${TAG}] created socket to ${relay}`)
  } catch (e) {
    setRelayStat(relay, 'lastConnect', { time: 0, date: requestTime })
    console.log(`[${TAG}] error:`, e)
  }
  // Add new instance
  r = {
    url: relay,
    state: 'init',
    socket,
    send: function(obj) {
      const r = this
      console.log(`[${TAG}] send ${JSON.stringify(obj)}`)
      r.socket.send(JSON.stringify(obj))
    },
    sendEvent: function(event) {
      const r = this
      return r.send(['EVENT', event])
    },
  }
  relays.push(r)
  return r.promise = new Promise((resolve, reject) => {
    socket.addEventListener('close', e => {
      r.state = 'closed'
      console.log(`[${TAG}] close`)
    })
    socket.addEventListener('error', e => {
      r.state = 'closed'
      console.log(`[${TAG}] error`)
    })
    socket.addEventListener('message', e => {
      let m = JSON.parse(e.data)
      // console.log(`[${TAG}] recv`, JSON.stringify(m))
      if (m[0] == 'EVENT' /* && m[1] == 'feed' */) {
        const event = m[2]
        aggregateEvent(event)
        setHasData(relay, event.pubkey)
      } else if (m[0] == 'AUTH' && m[1]) {
        sign(defaultKey, {
          'kind': 22242,
          'tags': [
            ['relay', `${r.url}`],
            ['challenge', `${m[1]}`]
          ],
        }, true).then(event => {
          authEvent = event
          r.send(['AUTH', event])
        }).catch(reason => {
          r.socket.close()
          r.state = 'closed'
          reject(`could not sign authentication message: ${reason}`)
        })
      } else if (m[0] == 'OK' && m[1] == authEvent?.id && m[2] == true) {
        r.authenticated = true
        if (r.timer) {
          clearTimeout(r.timer)
          r.timer = undefined
        }
        resolve(r)
      } else {
        // console.log(`[${TAG}] message`, JSON.stringify(m))
      }
    })
    socket.addEventListener('open', event => {
      r.state = 'open'
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
      console.log(`[${TAG}] connection opened in ${deltaTime} ms`)
      r.timer = setTimeout(() => {
        resolve(r)
      }, 1000)
    })
  })
}

export function publishEvent(event, relay) {
  const TAG = 'PUB'
  return new Promise((resolve, reject) => {
    let timer
    Relay.connect(relayUrl(relay)).then(relay => {
      console.log(`[${TAG}] connected to ${relay.url}`)
      relay.subscribe([
        {
          ids: [event.id],
        },
      ], {
        onevent(event) {
          console.log(`[${TAG}] publisher onevent: ${JSON.stringify(event)}`)
          relay.close()
          if (timer) {
            clearTimeout(timer)
            timer = undefined
          }
          resolve()
        },
        oneose() {
          console.log(`[${TAG}] publisher oneose`)
        }
      })
      console.log(`[${TAG}] publishing...`)
      relay.publish(event).then(() => {
        console.log(`[${TAG}] published`)
        timer = setTimeout(() => {
          console.log(`[${TAG}] confirmation timed out`)
          relay.close()
          timer = undefined
          reject()
        }, 5000)
      }, e => {
        console.log(`[${TAG}] publish failed: ${e}`)
        reject(e)
      })
    }).catch(e => {
      console.log(`[${TAG}] error: ${e}`)
      reject(e)
    })
  })
}

let connections = 0
export function findEvent(id, url) {
  return new Promise((resolve, reject) => {
    const operator = () => {
      if (connections > 10) {
        setTimeout(operator, 100)
        return
      }
      console.log('connecting to', url)
      connections++
      let foundEvent
      Relay.connect(relayUrl(url)).then(relay => {
        console.log('connected to', url)
        const sub = relay.subscribe([
          {
            ids: [id],
          },
        ], {
          onevent(event) {
            console.log('event from', url)
            foundEvent = event
          },
          oneose() {
            console.log('eose from', url)
            connections--
            try {
              relay.close()
            } catch (e) {
            }
            if (foundEvent) {
              resolve({ ...foundEvent, _foundOnRelay: url })
            } else {
              reject()
            }
          }
        })
        console.log('subscribed to', url)
      }).catch(() => {
        console.log('error from', url)
        connections--
        reject()
      })  
    }
    operator()
  })
}
