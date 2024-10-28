import { getPublicKey, finalizeEvent } from 'nostr-tools'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { Buffer } from 'buffer'
import { db } from './db.js'

/* secret key(s) should not leave this file */

/* TODO: need to encrypt secret keys in database */

export const keyViewDependencies = []

export const keys = []
export let defaultKey = window.localStorage.getItem('hsec')

export function getKeyInfo(hpub) {
  return keys.filter(k => k.hpub == hpub)?.[0]
}

export function getDefaultKeyInfo() {
  return (
    keys.filter(k => k.hpub == defaultKey)?.[0] ||
    keys?.[0]
  )
}

export function initDefaultKey() {
  const hsec = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex')
  const hpub = getPublicKey(Buffer.from(hsec, 'hex'))
  addSecretKey(hpub, hsec)
  defaultKey = window.localStorage.setItem('hsec', hsec)||window.localStorage.getItem('hsec')
}

export function addSecretKey(hpub, hsec) {
  const tr = db.transaction('keys', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('keys')
  const req = os.put({ hpub, keyType: 'secret', hsec })
  req.onsuccess = (e) => {
    reloadKeys()
  }
}

export function addTrezorKey(hpub, account) {
  const tr = db.transaction('keys', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('keys')
  const req = os.put({ hpub, keyType: 'trezor', account })
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
        if (!getKeyInfo(defaultKey)) {
          let info = getDefaultKeyInfo()
          if (info) {
            defaultKey = info.hpub
          }
        }
        keyViewDependencies.map(v => v.setRenderFlag(true))
        resolve()
      }
    }
  })
}

export function sign(hpub, event) {
  return new Promise((resolve, reject) => {
    const info = getKeyInfo(hpub)
    if (info.keyType == 'secret') {
      const tr = db.transaction('keys', 'readonly')
      const os = tr.objectStore('keys')
      const req = os.get(hpub)
      req.onerror = function(e) {
        reject(`unable to sign: ${e}`)
      }
      req.onsuccess = function(e) {
        const hsec = e.target.result.hsec
        if (hsec) {
          try {
            const signed = finalizeEvent(event, hexToBytes(hsec))
            resolve(signed)
          } catch (e) {
            console.log(e)
            reject(`unable to sign: ${e}`)
          }
        } else {
          reject(`unable to sign: secret key not found`)
        }
      }
    } else {
      reject(`unable to sign: key type '${info.keyType}' not implemented`)
    }
  })
}
