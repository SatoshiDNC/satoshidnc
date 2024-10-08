import * as nip19 from 'nostr-tools/nip19'
import { finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { Relay } from 'nostr-tools/relay'

export function bech32_noteId(bech32) {
  try {
    const decoded = nip19.decode(bech32)
    if (decoded?.type == 'note') {
      return decoded.data
    }
  } catch(e) {
  }
}

export function npub(hpub) {
  return nip19.npubEncode(hpub)
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