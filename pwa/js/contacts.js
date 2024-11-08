import { db } from './db.js'
import * as nip19 from 'nostr-tools/nip19'
import { setPersonalData, getPersonalData } from './personal.js'

export const contactDependencies = []

export const device = { hpub: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', name: 'Device', statusText: 'Come into Nostor!' }

export const contacts = []

// function newContact(hpub, name) {
//   return {
//     name: name,
//     hpub: hpub,
//     xmitDate: new Date(),
//     xmitText: 'You reacted "&" to "Ok, thanks for the help!"',
//   }
// }

export function addNewContact(hpub, name) {
  const tr = db.transaction('contacts', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('contacts')
  const req = os.put({ hpub, added: Date.now() })
  req.onsuccess = (e) => {
    reloadContacts()
    if (name) {
      setPersonalData(hpub, 'name', name)
    }
  }
}

export function reloadContacts() {
  const tr = db.transaction('contacts', 'readonly')
  const os = tr.objectStore('contacts')
  const req = os.openCursor()
  req.onerror = function(e) {
     console.err(e)
  }
  const newList = []
  req.onsuccess = function(e) {
    let cursor = e.target.result
    if (cursor) {
      let v = cursor.value
      newList.push({ hpub: v.hpub, added: v.added })
      cursor.continue()
    } else {
      contacts.length = 0
      contacts.push(...newList)
      contactDependencies.map(f => f())
      reloadContactUpdates
    }
  }
}

let reloadContactUpdates_timer
export function reloadContactUpdates() {
  if (reloadContactUpdates_timer) clearTimeout(reloadContactUpdates_timer)
    reloadContactUpdates_timer = setTimeout(() => {
    const tr = db.transaction(['updates-new'], 'readonly')
    const os = tr.objectStore('updates-new')
    const req = os.getAll()
    req.onerror = function(e) {
       console.err(e)
    }
    req.onsuccess = function(e) {
      for (e of e.target.result) {
        contacts.map(c => c.hasNewUpdates = false)
        contacts.filter(c => c.hpub == e.hpub).map(c => c.hasNewUpdates = true)
      }
      contactDependencies.map(f => f())
    }
  }, 100)
}
