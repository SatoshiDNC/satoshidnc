import * as nip19 from 'nostr-tools/nip19'
import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { Relay } from 'nostr-tools/relay'

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
    console.log(JSON.stringify(decoded))
    if (decoded?.type == 'nsec') {
      return bytesToHex(decoded.data)
    }
  } catch(e) {
  }
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

export function findEvent(id, relay) {
  return new Promise((resolve, reject) => {
    Relay.connect(relayUrl(relay)).then(relay => {
      const sub = relay.subscribe([
        {
          ids: [id],
        },
      ], {
        onevent(event) {
          resolve(event)
        },
        oneose() {
          sub.close()
          reject()
        }
      })
    })
  })
}