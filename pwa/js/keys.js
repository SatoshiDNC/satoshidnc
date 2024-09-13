import { getPublicKey } from 'nostr-tools'
import * as nip19 from 'nostr-tools/nip19'
import { Buffer } from 'buffer'
import { db } from './db.js'

// /* secret key should not leave this file */
// function hsec() { return window.localStorage.getItem('hsec')||(window.localStorage.setItem('hsec', Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex'))||window.localStorage.getItem('hsec')) }
// function bsec() { return Buffer.from(hsec(), 'hex') }
// function nsec() { return nip19.nsecEncode(bsec()) }

// export function hpub() { return getPublicKey(bsec()) }
// export function bpub() { return Buffer.from(hpub(), 'hex') }
// export function npub() { return nip19.npubEncode(hpub()) }

// function getSecretKey(pubkey) {
//   if (pubkey == bpub() || pubkey == hpub() || pubkey == npub()) {
//     return bsec()
//   }
// }

// export function signText(text, pubkey) {
//   return Buffer.from(schnorr.sign(Buffer.from(text, 'hex'), getSecretKey(pubkey)))
// }

// export function signEvent(event, pubkey) {
//   return finalizeEvent(event, getSecretKey(pubkey))
// }

export const keyViewDependencies = []

export const keys = []

export function initDefaultKey() {
  const hsec = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex')
  const hpub = getPublicKey(Buffer.from(hsec, 'hex'))
  addSecretKey(hpub, hsec)
}

export function addSecretKey(hpub, hsec) {
  const tr = db.transaction('keys', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('keys')
  const req = os.put({ hpub, keyType: 'secret', hsec })
  req.onsuccess = (e) => {
    reloadKeys()
  }
}

export function addTrezorKey(hpub, derPath) {
  const tr = db.transaction('keys', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('keys')
  const req = os.put({ hpub, keyType: 'trezor', derivation: derPath })
  req.onsuccess = (e) => {
    reloadKeys()
  }
}

export function reloadKeys() {
  return new Promise((resolve, reject) => {
    const tr = db.transaction('keys', 'readonly')
    const os = tr.objectStore('keys')
    const req = os.openCursor()
    req.onerror = function(e) {
       console.err(e)
    }
    const newList = []
    req.onsuccess = function(e) {
      let cursor = e.target.result
      if (cursor) {
        let v = cursor.value
        newList.push({ hpub: v.hpub, keyType: v.keyType })
        cursor.continue()
      } else {
        keys.length = 0
        keys.push(...newList)
        keyViewDependencies.map(v => v.setRenderFlag(true))
        resolve()
      }
    }
  })
}