import { db } from './db.js'
import { kindInfo } from './nostor-util.js'
import { homeRelay } from './nostor-app.js'
import { contacts, reloadContactUpdates } from './contacts.js'
import { keys, is_valid_hpub } from './keys.js'

export const dealTrigger = [updateBalances]

const DAY_IN_SECONDS = 24/*hours*/ * 60/*minutes*/ * 60/*seconds*/

let balance_update_timeout
export function updateBalances() {
  if (balance_update_timeout) {
    clearTimeout(balance_update_timeout)
    balance_update_timeout = undefined
  }
  balance_update_timeout = setTimeout(() => {
    const TAG = 'updateBalances'
    let totals = {}
    const tr = db.transaction(['deals-pending', 'profiles', 'deletions', 'expirations'], 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('deals-pending')
    const req = os.openCursor()
    req.onerror = e => {
      console.log(`[${TAG}] database error`)
      reject()
    }
    req.onsuccess = e => {
      let cursor = e.target.result
      if (cursor) {
        let v = cursor.value
        for (t of v.data.tags) {
          if (t[0] == 'IOU') {
            const qty = +t[1]
            const qty_unit = t[2]
            if (!totals[qty_unit]) {
              totals[qty_unit] = -qty
            } else {
              totals[qty_unit] += -qty
            }
          } else if (t[0] == 'UOI') {
            const qty = +t[1]
            const qty_unit = t[2]
            if (!totals[qty_unit]) {
              totals[qty_unit] = qty
            } else {
              totals[qty_unit] += qty
            }
          }
        }
        cursor.continue()
      } else {
        console.log(`[${TAG}] new balance:`, totals)
      }
    }
  }, 100)
}

export function rememberDeal(e) {
  return new Promise((resolve, reject) => {
    if (!e || !e.id || !e.sig || !e.pubkey) reject('invalid deal')
    const TAG = 'rememberDeal'
    const now = Date.now()
    const tr = db.transaction(['deals-pending', 'profiles', 'deletions', 'expirations'], 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('deals-pending')
    const req = os.index('id').get(e.id)
    req.onerror = () => {
      reject()
    }
    req.onsuccess = () => {
      if (req.result) { // this deal is already in our database
        console.log(`[${TAG}] skipping duplicate deal`, JSON.stringify(e))
        resolve()
      } else {
        const del_os = tr.objectStore('deletions')
        const req = del_os.get(e.id)
        req.onerror = () => {
          reject()
        }
        req.onsuccess = () => {
          if (req.result) { // there's a deletion record in our database
            console.log(`[${TAG}] skipping deleted deal`, JSON.stringify(e))
            resolve()
          } else {
            if (![555].includes(e.kind)) {
              console.warn(`[${TAG}] skipping deal of invalid kind ${e.kind} (${kindInfo.filter(i => i.kind == e.kind)?.[0].desc})`/*, JSON.stringify(e)*/)
              resolve()
            } else if (e.kind == 555) {
              const counter_party_tag = e.tags.filter(t => t[0] == 'p')
              if (counter_party_tag.length != 1) {
                console.warn(`[${TAG}] skipping deal with invalid counterparty (${counter_party_tag.length} 'p' tags)`/*, JSON.stringify(e)*/)
                reject()
              } else {
                const counter_party = e.tags.filter(t => t[0] == 'p')[0][1]
                if (!is_valid_hpub(counter_party)) {
                  console.warn(`[${TAG}] skipping deal with invalid counterparty hex public key '${counter_party}' (${kindInfo.filter(i => i.kind == e.kind)?.[0].desc})`/*, JSON.stringify(e)*/)
                  reject()
                } else {
                  console.log(`[${TAG}] new deal`, JSON.stringify(e))
                  const req = os.add({ hpub1: e.pubkey, hpub2: counter_party, firstRecorded: now, data: e })
                  req.onerror = () => {
                    reject()
                  }
                  req.onsuccess = () => {
                    const finisher = () => {
                      resolve()
                      setTimeout(()=>{dealTrigger.map(f => f(e))})
                    }
                    const expiry = +(e.tags.filter(t => t[0] == 'expiration')?.[0]?.[1]||'0')
                    if (expiry) {
                      const os = tr.objectStore('expirations')
                      const req = os.put({ expiry, id: e.id })
                      req.onerror = () => {
                        reject()
                      }
                      req.onsuccess = () => {
                        // console.log(`[${TAG}] added expiration record`)
                        finisher()
                      }
                    } else {
                      finisher()
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

  })
}
