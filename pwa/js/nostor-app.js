import { relayUrl } from './nostor-util.js'
import { aggregateEvent } from './content.js'
import { getRelayStat, setRelayStat } from './stats.js'

let relays = []

export function getRelay(name) {
  const relay = relayUrl(name)
  return new Promise((resolve, reject) => {
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
      const r = {
        url: relay,
        state: 'open',
        socket,
        send: function(obj) {
          const r = this
          console.log(`send ${JSON.stringify(obj)}`)
          r.socket.send(JSON.stringify(obj))
        }
      }
      relays.push(r)
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
      // if (thisRequestTime == requestTime) {
      //   debugView.deltaTime = deltaTime
      //   debugView.setRenderFlag(true)
      // }
      console.log(`[${TAG}] open`, deltaTime)
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
  })
}

export function publishEvent(event, relay) {
  const TAG = 'PUB'
  return new Promise((resolve, reject) => {
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
          resolve()
        },
        oneose() {
          console.log(`[${TAG}] publisher oneose`)
        }
      })
      console.log(`[${TAG}] publishing...`)
      relay.publish(event).then(() => {
        console.log(`[${TAG}] published`)
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
      //console.log('connecting to', relay)
      connections++
      let foundEvent
      Relay.connect(relayUrl(url)).then(relay => {
        const sub = relay.subscribe([
          {
            ids: [id],
          },
        ], {
          onevent(event) {
            foundEvent = event
          },
          oneose() {
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
      }).catch(() => {
        connections--
        reject()
      })  
    }
    operator()
  })
}
