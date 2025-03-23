import { getPublicKey, serializeEvent, finalizeEvent } from 'nostr-tools'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { Buffer } from 'buffer'
import { db } from './db.js'

/* secret key(s) should not leave this file */

/* TODO: need to encrypt secret keys in database */

export const keyDependencies = []

export const keys = []
export let defaultKey = window.localStorage.getItem('hpub')

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
  putDeviceKey(hpub, hsec)
  defaultKey = window.localStorage.setItem('hpub', hpub)||window.localStorage.getItem('hpub')
}

export function putDeviceKey(hpub, hsec) {
  const tr = db.transaction('keys', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('keys')
  const req = os.put({ hpub, keyType: 'device', hsec, lastUsed: Date.now() })
  req.onsuccess = (e) => {
    reloadKeys()
  }
}

export function putVolatileKey(hpub) {
  const tr = db.transaction('keys', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('keys')
  const req = os.put({ hpub, keyType: 'volatile', lastUsed: Date.now() })
  req.onsuccess = (e) => {
    reloadKeys()
  }
}

const volatileKeys = []
export function useVolatileKey(hpub, hsec) {
  if (!volatileKeys.map(k=>k.hpub).includes(hpub)) {
    volatileKeys.push({ hpub, hsec })
  }
}

export function putTrezorKey(hpub, account) {
  const tr = db.transaction('keys', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('keys')
  const req = os.put({ hpub, keyType: 'trezor', account, lastUsed: Date.now() })
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
        newList.push({ hpub: v.hpub, keyType: v.keyType, lastUsed: v.lastUsed || 0 })
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
        keyDependencies.map(f => f())
        resolve()
      }
    }
  })
}

export function sign(hpub, eventTemplate, silent) {
  const event = {...eventTemplate}
  if (!event.content) {
    event.content = ''
  }
  if (!event.created_at) {
    event.created_at = Math.floor(Date.now() / 1000)
  }
  if (!event.pubkey) {
    event.pubkey = hpub
  }
  return new Promise((resolve, reject) => {
    const info = getKeyInfo(hpub)
    if (info.keyType == 'device') {
      if (silent || confirm(`Are you sure you want to sign the following message? This document will become legally binding:\n${serializeEvent(event)}`)) {
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
              putDeviceKey(hpub, hsec) // to update 'lastUsed' time stamp
              resolve(signed)
            } catch (e) {
              console.log(event)
              reject(`unable to sign: ${e}`)
            }
          } else {
            reject(`unable to sign: secret key not found`)
          }
        }
      } else {
        reject(`canceled by user`)
      }
    } else if (info.keyType == 'volatile') {
      const value = prompt('Nostor secret key', '')
      if (value !== null) {

        let hsec, relays

        // If it's a hex key, use it verbatim
        if (value.length == 64 && Array.from(value.toLowerCase()).reduce((pre, cur) => pre && '01234566789abcdef'.includes(cur), true)) {
          hsec = value.toLowerCase()
        }

        // Otherwise...
        if (!hsec) {

          // Strip the nostr: URL scheme, if present
          let bech32 = value
          if (value.startsWith('nostr:')) {
            bech32 = value.substring(6)
          }

          // Handle Bech32-encoded formats
          try {
            const decoded = nip19.decode(bech32)
            if (decoded?.type == 'nsec') {
              hsec = decoded.data
            }
          } catch(e) {
            if (bech32.startsWith('nsec')) {
              reject(`${e}`)
              return
            }
          }
        }

        // If we couldn't recognize the key, error and return early
        if (!hsec) {
          reject(`unable to sign: unrecognized secret key format`)
          return
        }
        const matching_hpub = getPublicKey(Buffer.from(hsec, 'hex'))
        if (matching_hpub !== hpub) {
          reject(`unable to sign: secret key does not match public key`)
          return
        }

        // We have the matching hex secret key; use it
        useVolatileKey(hpub, hsec)
        try {
          const signed = finalizeEvent(event, hexToBytes(hsec))
          putVolatileKey(hpub, hsec) // to update 'lastUsed' time stamp
          resolve(signed)
        } catch (e) {
          console.log(event)
          reject(`unable to sign: ${e}`)
        }
      } else {
        reject(`canceled by user`)
      }
    } else {
      reject(`unable to sign: key type '${info.keyType}' not implemented`)
    }
  })
}

function signBatchWithSecretKey(hsec, templates) {
  return new Promise((resolve, reject) => {
    let userSummary = templates.map(e => JSON.stringify(e)).join(`\n`)
    if (confirm(`Sign the following?\n${userSummary}`)) {
      try {
        const signed = templates.map(e => {
          const event = {...e}
          if (!event.content) event.content = ''
          if (!event.created_at) event.created_at = Math.floor(Date.now() / 1000)
          if (!event.pubkey) event.pubkey = hpub
          return finalizeEvent(event, hexToBytes(hsec))
        })
        resolve(signed)
      } catch(error) {
        reject(`unable to sign: ${error}`)
      }
    } else {
      reject(`user canceled`)
    }
  })
}

export function signBatch(hpub, templates) {
  return new Promise((resolve, reject) => {
    const info = getKeyInfo(hpub)
    if (info.keyType == 'device') {
      const tr = db.transaction('keys', 'readonly')
      const os = tr.objectStore('keys')
      const req = os.get(hpub)
      req.onerror = function(e) {
        reject(`unable to sign: ${e}`)
      }
      req.onsuccess = function(e) {
        const hsec = e.target.result.hsec
        if (hsec) {
          signBatchWithSecretKey(hsec, templates).then(signed => {
            putDeviceKey(hpub, hsec) // to update 'lastUsed' time stamp
            resolve(signed)
          }, error => {
            reject(`signing error: ${error}`)
          })
        } else {
          reject(`unable to sign: secret key not found`)
        }
      }
    } else if (info.keyType == 'volatile') {
      const value = prompt('Nostor secret key', '')
      if (value !== null) {

        let hsec, relays

        // If it's a hex key, use it verbatim
        if (value.length == 64 && Array.from(value.toLowerCase()).reduce((pre, cur) => pre && '01234566789abcdef'.includes(cur), true)) {
          hsec = value.toLowerCase()
        }

        // Otherwise...
        if (!hsec) {

          // Strip the nostr: URL scheme, if present
          let bech32 = value
          if (value.startsWith('nostr:')) {
            bech32 = value.substring(6)
          }

          // Handle Bech32-encoded formats
          try {
            const decoded = nip19.decode(bech32)
            if (decoded?.type == 'nsec') {
              hsec = decoded.data
            }
          } catch(e) {
            if (bech32.startsWith('nsec')) {
              reject(`${e}`)
              return
            }
          }
        }

        // If we couldn't recognize the key, error and return early
        if (!hsec) {
          reject(`unable to sign: unrecognized secret key format`)
          return
        }
        const matching_hpub = getPublicKey(Buffer.from(hsec, 'hex'))
        if (matching_hpub !== hpub) {
          reject(`unable to sign: secret key does not match public key`)
          return
        }

        // We have the matching hex secret key; use it
        useVolatileKey(hpub, hsec)
        signBatchWithSecretKey(hsec, templates).then(signed => {
          putVolatileKey(hpub, hsec) // to update 'lastUsed' time stamp
          resolve(signed)
        }, error => {
          reject(`signing error: ${error}`)
        })
      } else {
        reject(`canceled by user`)
      }
    } else {
      reject(`unable to sign: key type '${info.keyType}' not implemented`)
    }
  })
}
