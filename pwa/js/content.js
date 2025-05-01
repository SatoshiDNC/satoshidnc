import { db } from './db.js'
import { kindInfo } from './nostor-util.js'
import { homeRelay } from './nostor-app.js'
import { contacts, reloadContactUpdates } from './contacts.js'
import { follows as channels } from './channels.js'
import { keys } from './keys.js'

export const eventTrigger = []
export const deletionTrigger = []
export const unlockTrigger = []
export const profileTrigger = []
export const reactionTrigger = []

const DAY_IN_SECONDS = 24/*hours*/ * 60/*minutes*/ * 60/*seconds*/

export function setDummyKey(id) {
  return new Promise((resolve, reject) => {
    const TAG = 'setDummyKey'
    const now = Date.now()
    const tr = db.transaction(['events', 'profiles', 'deletions', 'expirations'], 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('events')
    const req = os.index('id').get(id)
    req.onerror = () => {
      console.error(`[${TAG}] database error`)
      reject()
    }
    req.onsuccess = () => {
      if (req.result) { // the event to update is in our database
        req.result.data._key = '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
        const req2 = os.put(req.result)
        req2.onerror = () => {
          console.error(`[${TAG}] database error`)
          reject()
        }
        req2.onsuccess = () => {
          console.log(`[${TAG}] auto-decryption aborted for event ${id}`)
          resolve()
        }
      }
    }
  })
}

export function aggregateEvent(e) {
  return new Promise((resolve, reject) => {
    if (!e || !e.id || !e.sig || !e.pubkey) reject('invalid event')
    const TAG = 'aggregate'
    const LOG_AND_REJECT = () => {
      console.error(`[${TAG}] database error`)
      reject()
    }
    const now = Date.now()
    const tr = db.transaction(['events', 'profiles', 'deletions', 'expirations', 'incoming-reactions-pending'], 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('events')
    const req = os.index('id').get(e.id)
    req.onerror = LOG_AND_REJECT
    req.onsuccess = () => {
      if (req.result) { // this event is already in our database
        //console.log(`[${TAG}] skipping duplicate event`, JSON.stringify(e))
        resolve()
      } else {
        const del_os = tr.objectStore('deletions')
        const req = del_os.get(e.id)
        req.onerror = LOG_AND_REJECT
        req.onsuccess = () => {
          if (req.result) { // there's a deletion record in our database
            console.log(`[${TAG}] skipping deleted event`, JSON.stringify(e))
            resolve()
          } else {
            if ([31234].includes(e.kind)) {
              console.log(`[${TAG}] skipping event of kind ${e.kind} (${kindInfo.filter(i => i.kind == e.kind)?.[0].desc})`/*, JSON.stringify(e)*/)
              resolve()
            } else if (e.kind == 5) {
              handle_incoming_deletion(e, os, del_os, TAG, LOG_AND_REJECT, resolve, reject)
            } else if (e.kind == 24) {
              handle_incoming_key(e, os, TAG, LOG_AND_REJECT, resolve, reject)
            } else if (e.kind == 7) {
              handle_incoming_reaction(e, tr, TAG, LOG_AND_REJECT, resolve, reject)
            } else {
              console.log(`[${TAG}] new event`, JSON.stringify(e))
              const req = os.add({ hpub: e.pubkey, firstSeen: now, data: e })
              req.onerror = () => {
                reject()
              }
              req.onsuccess = () => {
                const finisher = () => {
                  if (e.kind == 0) {
                    const os = tr.objectStore('profiles')
                    const req = os.put({ hpub: e.pubkey, asOf: now, data: e })
                    req.onerror = () => {
                      reject()
                    }
                    req.onsuccess = () => {
                      console.log(`[${TAG}] updated profile for`, e.pubkey)
                      resolve()
                      setTimeout(() => {
                        eventTrigger.map(f => f(e))
                        profileTrigger.map(f => f(e.pubkey))
                      })
                    }
                  } else {
                    resolve()
                    setTimeout(() => { eventTrigger.map(f => f(e)) })
                  }
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

  })
}

function handle_incoming_deletion(e, os, del_os, tag, database_error_handler, resolve, reject) {
  const ids = []
  const todo = e.tags.filter(t => t[0] == 'e').map(t => t[1])
  const deletionProcessing = () => {
    if (todo.length > 0) {
      const toDelete = todo.pop()
      const req = del_os.put({ id: toDelete, asOf: Date.now(), hpub: e.pubkey })
      req.onerror = database_error_handler
      req.onsuccess = () => {
        const req = os.index('id').get(toDelete)
        req.onerror = database_error_handler
        req.onsuccess = () => {
          if (req.result) { // the deleted event is in our database
            if (req.result.data.pubkey != e.pubkey) {
              console.log(`[${tag}] ignored deletion attempt by different pubkey: ${e.pubkey} tried to delete post by ${req.result.data.pubkey}`)
              deletionProcessing()
            } else {
              ids.push(toDelete)
              req = os.delete(toDelete)
              req.onerror = database_error_handler
              req.onsuccess = () => {
                deletionProcessing()
              }
            }
          } else {
            deletionProcessing()
          }
        }
      }
    } else {
      if (ids.length) {
        console.log(`[${tag}] noted deletions:`, ids)
        setTimeout(() => { deletionTrigger.map(f => f(ids)) })
      }
      resolve()
    }
  }
  deletionProcessing()  
}

function handle_incoming_key(e, os, tag, database_error_handler, resolve, reject) {
  const ids = []
  const todo = e.tags.filter(t => t[0] == 'e').map(t => t[1])
  const unlockProcessing = () => {
    if (todo.length > 0) {
      const toUnlock = todo.pop()
      const req = os.index('id').get(toUnlock)
      req.onerror = database_error_handler
      req.onsuccess = () => {
        if (req.result) { // the event to unlock is in our database
          if (req.result.data.pubkey != e.pubkey) {
            console.log(`[${tag}] ignored unlock attempt by different pubkey: ${e.pubkey} tried to unlock post by ${req.result.data.pubkey}`)
            unlockProcessing()
          } else {
            ids.push(toUnlock)
            req.result.data._key = e.content
            const req2 = os.put({ hpub: req.result.hpub, firstSeen: req.result.firstSeen, data: req.result.data })
            req2.onerror = database_error_handler
            req2.onsuccess = () => {
              unlockProcessing()
            }
          }
        } else {
          unlockProcessing()
        }
      }
    } else {
      console.log(`[${tag}] unlocked posts:`, ids)
      setTimeout(() => { unlockTrigger.map(f => f(ids)) })
      resolve()
    }
  }
  unlockProcessing()
}

function handle_incoming_reaction(e, tr, tag, database_error_handler, resolve, reject) {
  const os = tr.objectStore('events')
  const reaction_os = tr.objectStore('incoming-reactions-pending')
  const event_reacted_to = e.tags.filter(t => t[0] == 'e').map(t => t[1]).pop()
  if (event_reacted_to) {
    const req1 = reaction_os.add({ data: e, target: event_reacted_to })
    req1.onerror = e => {
      if (e?.target?.error?.name === 'ConstraintError') return
      database_error_handler(e)
    }
    req1.onsuccess = () => {
      console.log(`[${tag}] stored reaction to post: ${event_reacted_to}`)

      const req = os.index('id').get(event_reacted_to)
      req.onerror = database_error_handler
      req.onsuccess = () => {
        if (req.result) { // the event reacted to is in our database
          if (!req.result.data._reactions) { req.result.data._reactions = []}
          if (!req.result.data._reactions[e.content]) { req.result.data._reactions[e.content] = 0 }
          req.result.data._reactions[e.content] += 1
          const req2 = os.put({ hpub: req.result.hpub, firstSeen: req.result.firstSeen, data: req.result.data })
          req2.onerror = database_error_handler
          req2.onsuccess = () => {
            console.log(`[${tag}] reaction on ${event_reacted_to}`)
            setTimeout(() => { reactionTrigger.map(f => f(event_reacted_to, e.content)) })
            resolve()
          }
        } else {
          const req2 = reaction_os.put({ data: e, target: event_reacted_to })
          req2.onerror = database_error_handler
          req2.onsuccess = () => {
            console.log(`[${tag}] queued reaction to unknown post: ${event_reacted_to}`)
            resolve()
          }
        }
      }
  
    }
  } else {
    console.warn(`[${tag}] invalid reaction:`, e)
    reject()
  }
}

export function savePendingReactions(reactions) {
  const tr = db.transaction(['outgoing-reactions-signed'], 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('outgoing-reactions-signed')
  reactions.map(reaction => {
    const req = os.put({ id: reaction.tags.filter(t => t[0] == 'e')[0][1], data: reaction })
    req.onerror = e => {
      console.error(`database error`)
    }
    req.onsuccess = e => {
      console.log(`saved pending reaction`)
    }
  })
}

export function sendPendingReaction(id) {
  const TAG = 'sendPendingReaction'
  const tr = db.transaction(['outgoing-reactions-signed'], 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('outgoing-reactions-signed')
  const req = os.get(id)
  req.onerror = e => {
    console.error(`database error`)
  }
  req.onsuccess = e => {
    console.log(`[${TAG}] got reaction`)
    const reaction = e.target.result
    if (reaction) {
      console.log(`[${TAG}]`, reaction)
      homeRelay().then(relay => {
        relay.sendEvent(reaction.data)
      })
    } else {
      console.warn(`pending reaction not found`)
    }
  }
}

export function deleteExpiredEvents() {
  return new Promise((resolve, reject) => {
    const TAG = 'deleteExpiredEvents'
    const now = Date.now()
    const tr = db.transaction(['expirations', 'events'], 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('expirations')
    // const req = os.index('expiry').openCursor(IDBKeyRange.bound(2000000000, 2000000000000))
    const req = os.index('expiry').openCursor(IDBKeyRange.bound(0, Math.floor(now/1000)))
    const todo = []
    req.onerror = () => {
      reject()
    }
    req.onsuccess = e => {
      let cursor = e.target.result
      if (cursor) {
        todo.push({ key: cursor.key, value: { id: cursor.value.id }})
        cursor.continue()
      } else {
        const slash = () => {
          if (todo.length == 0) {
            eventTrigger.map(f => f())
            resolve()
            return
          }
          cursor = todo.pop()
          // console.log(`event expired: ${cursor.value.id}`)
          const os2 = tr.objectStore('events')
          const req = os2.delete(cursor.value.id)
          req.onerror = () => {
            reject()
          }
          req.onsuccess = () => {
            const req = os.delete(cursor.value.id)
            req.onerror = () => {
              reject()
            }
            req.onsuccess = () => {
              slash()
            }
          }
        }
        if (todo.length) slash()
      }
    }
  })
}

export function setUpdatesFlag(hpub, newUpdates) {
  console.log(hpub, newUpdates)
  const tr = db.transaction(['updates-new'], 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('updates-new')
  os.put({ hpub: hpub, new: newUpdates })
  reloadContactUpdates()
}
eventTrigger.push(e => {
  if (e) {
    setUpdatesFlag(e.pubkey, true)
  }
})

let reqNotes_requestTime
export function reqNotes(hpub) {
  const TAG = 'reqNotes'
  reqNotes_requestTime = Date.now()
  let thisRequestTime = reqNotes_requestTime
  console.log(`[${TAG}] query relay`)
  homeRelay().then(relay => {
    if (thisRequestTime !== reqNotes_requestTime) return
    relay.send([
      'REQ',
      'notes',
      {
        'authors': [hpub],
        'limit': 5,
      }
    ])
  })
}

let reqProfile_requestTime
export function reqProfile(hpub) {
  const TAG = 'reqProfile'
  reqProfile_requestTime = Date.now()
  let thisRequestTime = reqProfile_requestTime
  console.log(`[${TAG}] query relay`)
  homeRelay().then(relay => {
    if (thisRequestTime !== reqProfile_requestTime) return
    relay.send([
      'REQ',
      'profile',
      {
        'kinds': [0],
        'authors': [hpub],
        'limit': 5,
      }
    ])
  })
}

let reqFeed_requestTime
export function reqFeed() {
  const TAG = 'reqFeed'
  if (contacts.length == 0) return
  reqFeed_requestTime = Date.now()
  let thisRequestTime = reqFeed_requestTime
  console.log(`[${TAG}] query relay`)
  homeRelay().then(relay => {
    if (thisRequestTime !== reqFeed_requestTime) return
    let interests = [...keys.map(k=>k.hpub), ...contacts.map(c=>c.hpub)]
    if (channels.length) interests.push(...channels.map(c=>c.hpub))
    console.log(interests)
  console.log(keys, contacts, channels)
    relay.send([
      'REQ',
      'feed',
      {
        'authors': [...new Set(interests)],
        'since': Math.floor(Date.now()/1000) - 2 * DAY_IN_SECONDS, // double long enough to retrieve current updates from contacts to display
      }
    ])
    relay.send([
      'REQ',
      'aux',
      {
        '#p': [...new Set(interests)],
        'since': Math.floor(Date.now()/1000) - 2 * DAY_IN_SECONDS, // double long enough to retrieve current updates from contacts to display
      }
    ])
  })
}

export function getProfile(hpub) {
  return new Promise((resolve, reject) => {
    const tr = db.transaction('profiles', 'readonly', { durability: 'strict' })
    const os = tr.objectStore('profiles')
    const req = os.openCursor(window.IDBKeyRange.bound(hpub, hpub))
    req.onerror = function(e) {
      reject(e)
    }
    req.onsuccess = function(e) {
      let cursor = e.target.result
      if (cursor) {
        resolve(cursor.value)
      } else {
        resolve()
      }
    }
  })
}

export function getFeed(hpub) {
  return new Promise((resolve, reject) => {
    const tr = db.transaction('events', 'readonly', { durability: 'strict' })
    const os = tr.objectStore('events')
    const req = os.index('hpub_firstSeen').openCursor(window.IDBKeyRange.bound([hpub, 0], [hpub, 91729187740298]), 'prev')
    req.onerror = function(e) {
      console.error(e)
    }
    const posts = []
    const c = contacts.map(c => c.hpub)
    req.onsuccess = function(e) {
      let cursor = e.target.result
      if (cursor && cursor.value) {
        if (cursor.value.constructor === Array) {
          console.log('array:', cursor.value)
          posts.push(...cursor.value.filter(p => c.includes(p.data.pubkey)))
        } else {
          posts.push(...[cursor.value].filter(p => c.includes(p.data.pubkey)))
        }
        cursor.continue()
      } else {
        resolve(posts)
      }
    }
  })
}

export function getUpdates() {
  return new Promise((resolve, reject) => {
    const tr = db.transaction(['events', 'updates-viewed'], 'readonly', { durability: 'strict' })
    const os = tr.objectStore('events')
    const DISTANT_FUTURE = 91729187740298
    const ONE_DAY_AGO_IN_MILLISECONDS = Date.now() - DAY_IN_SECONDS * 1000
    const ONE_DAY_AGO_IN_SECONDS = Math.floor(ONE_DAY_AGO_IN_MILLISECONDS / 1000)
    // console.log (`from ${ONE_DAY_AGO_IN_SECONDS} to ${DISTANT_FUTURE}`)
    const req = os.index('createdAt').getAll(IDBKeyRange.bound(ONE_DAY_AGO_IN_SECONDS, DISTANT_FUTURE))
    req.onerror = function(e) {
      console.error(e)
    }
    req.onsuccess = function(e) {
      const c = [...contacts.map(c => c.hpub), ...keys.map(k => k.hpub)]
      const updates = e.target.result.filter(r => c.includes(r.data.pubkey))
      const now = Date.now()
      resolve(Promise.all(updates.filter(r => ![
        5, // Event Deletion Request
        7, // Reaction
        31234, // Generic Draft Event
      ].includes(r.data.kind)).map(r => {
        return new Promise((resolve, reject) => {
          const req = tr.objectStore('updates-viewed').get(r.data.id)
          req.onerror = function(e) {
            console.error(e)
          }
          req.onsuccess = function(e) {
            resolve({ ...r, viewed: e.target.result !== undefined })
          }
        })
      })))
    }
  })
}

export function markUpdateAsViewed(id, hpub, eventCreatedAtTime) {
  // console.log(`[mark] ${id} ${eventCreatedAtTime}`)
  return new Promise((resolve, reject) => {
    const tr = db.transaction(['updates-viewed'], 'readwrite', { durability: 'strict' })
    const os = tr.objectStore('updates-viewed')
    const req = os.add({ id, eventTimeStamp: eventCreatedAtTime })
    req.onerror = function(e) {
      if (e?.target?.error?.name === 'ConstraintError') return
      console.error(e)
    }
    req.onsuccess = function(e) {
      sendPendingReaction(id)
      getUpdates().then(updates => {
        const tr = db.transaction(['updates-new'], 'readwrite', { durability: 'strict' })
        const os = tr.objectStore('updates-new')
        const req = os.put({ hpub, new: updates.filter(u => u.hpub == hpub && !u.viewed).length > 0 })
        req.onerror = function(e) {
          console.error(e)
        }
        req.onsuccess = function(e) {
          resolve()
          reloadContactUpdates()
        }
      })
    }
  })
}

