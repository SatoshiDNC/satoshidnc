import * as nip19 from 'nostr-tools/nip19'
import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { Relay } from 'nostr-tools/relay'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

export function noteDecode(bech32) {
  try {
    const decoded = nip19.decode(bech32)
    if (decoded?.type == 'note') {
      return decoded.data
    }
  } catch(e) {
  }
}

export function nsecDecode(bech32) {
  try {
    const decoded = nip19.decode(bech32)
    if (decoded?.type == 'nsec') {
      return bytesToHex(decoded.data)
    }
  } catch(e) {
  }
}

export function signEvent(hsec, event) {
  return finalizeEvent(event, hexToBytes(hsec))
}

export function validKey(hex) {
  return hex?.length === 64 && hex?.toLowerCase().split('').reduce((a, c) => a && '0123456789abcdef'.includes(c), true)
}

export function npub(hpub) {
  return nip19.npubEncode(hpub)
}

export function nsec(hsec) {
  return nip19.nsecEncode(hsec)
}

export function relayUrl(input) {
  if (input.includes('.')) {
    if (input.includes('://')) {
      return input
    } else {
      return `wss://${input}`
    }
  }
}

export function publishEvent(event, relay) {
  return new Promise((resolve, reject) => {
    Relay.connect(relayUrl(relay)).then(relay => {
      relay.subscribe([
        {
          ids: [event.id],
        },
      ], {
        onevent(event) {
          resolve()
        },
        oneose() {
          reject()
        }
      })
      relay.publish(event).then(() => {
        relay.close()
      })
    }).catch(() => {
      reject()
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

export function nostrWatchRelays() {
  return new Promise((resolve, reject) => {
    fetch(`https://api.nostr.watch/v1/online`).then(resp => resp.json()).then(json => {
      resolve(json)
    }, rejectReason => {
      console.log(rejectReason)
      resolve([])
    })
  })
}