import { db } from './db.js'

export const follows = []
export const followsTrigger = []

let reloadChannelFollows_timer
export function reloadChannelFollows() {
  const TAG = 'reloadChannelFollows'
  if (reloadChannelFollows_timer) clearTimeout(reloadChannelFollows_timer)
  reloadChannelFollows_timer = setTimeout(() => {
    console.log(`[${TAG}] querying channel follows`)
    const tr = db.transaction(['channels-followed'], 'readonly')
    const os = tr.objectStore('channels-followed')
    const req = os.getAll()
    req.onerror = function(e) {
      console.error(e)
    }
    req.onsuccess = function(e) {
      console.log(`[${TAG}]`, e.target.result)
      for (let f of e.target.result) {
        if (!follows.includes(f.hpub)) {
          follows.push(f.hpub)
        }
      }
      for (let i = follows.length-1; i>=0; i--) {
        if (!e.target.result.filter(f => f.hpub = follows[i]).length) {
          follows.splice(i, 1)
        }
      }
      followsTrigger.map(f => f())
    }
  }, 100)
}

export function amFollowingChannel(hpub) {
  return follows.includes(hpub)
}

export function followChannel(hpub) {
  const TAG = `followChannel`
  return new Promise((resolve, reject) => {
    const now = Date.now()
    const tr = db.transaction(['channels-followed'], 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('channels-followed')
    const req = os.add({ id: hpub, timestamp: now })
    req.onerror = function(e) {
      if (e?.target?.error?.name === 'ConstraintError') {
        console.log(`[${TAG}] channel already followed '${hpub}'`)
        resolve()
      } else {
        console.log(`[${TAG}] '${hpub}'`)
        console.error(e)
      }
    }
    req.onsuccess = function(e) {
      console.log(`[${TAG}] followed channel '${hpub}'`)
      reloadChannelFollows()
      resolve()
    }
  })
}

export function unfollowChannel(hpub) {
  const TAG = `unfollowChannel`
  return new Promise((resolve, reject) => {
    const now = Date.now()
    const tr = db.transaction(['channels-followed'], 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('channels-followed')
    const req = os.del(hpub)
    req.onerror = function(e) {
      if (e?.target?.error?.name === 'ConstraintError') {
        console.log(`[${TAG}] channel already unfollowed '${hpub}'`)
        resolve()
      } else {
        console.log(`[${TAG}] '${hpub}'`)
        console.error(e)
      }
    }
    req.onsuccess = function(e) {
      console.log(`[${TAG}] unfollowed channel '${hpub}'`)
      reloadChannelFollows()
      resolve()
    }
  })
}
