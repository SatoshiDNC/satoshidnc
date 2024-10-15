import { db } from './db.js'
import * as nip19 from 'nostr-tools/nip19'
import { setPersonalData, getPersonalData } from './personal.js'

export const contactViewDependencies = []

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
    setPersonalData(hpub, 'name', name)
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
      newList.push({ hpub: v.hpub, name: getPersonalData(v.hpub, 'name'), relays: [], xmitDate: new Date(), xmitText: 'tbd' })
      cursor.continue()
    } else {
      contacts.length = 0
      contacts.push(...newList)
      console.log(`${JSON.stringify(contacts)}`)
      contactViewDependencies.map(v => v.setRenderFlag(true))
    }
  }
}
