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
  const contacts = tr.objectStore('contacts')
  contacts.put({ hpub, name })
}
