import { db } from './db.js'
import * as nip19 from 'nostr-tools/nip19'

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
  os.put({ hpub, name })
  reloadContacts()
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
      let key = cursor.primaryKey
      let value = cursor.value
      console.log(key, value)
      newList.push({ name: 'name', hpub: key, xmitDate: new Date(), xmitText: 'tbd' })
      cursor.continue()
    } else {
      contacts.length = 0
      contacts.push(...newList)
    }
  }
}
