import { db } from './db.js'
import { relays } from './relays.js'
import { contacts } from './contacts.js'

export const R_KNOWS_C = 'R_KNOWS_C'

export const relayContactGraphDependencies = []

export function addRelayContactRelation(relayUrl, contactHpub, R_KNOWS_C) {
  const tr = db.transaction('relay-contact-relations', 'readwrite', { durability: 'strict' })
  const os = tr.objectStore('relay-contact-relations')
  const req = os.get([relayUrl, contactHpub, R_KNOWS_C])
  req.onsuccess = (e) => {
    const relation = req.result
    console.log(relation)
    if (!relation) {
      os.put({ relayUrl, contactHpub, relation: R_KNOWS_C })
    }
  }
  reloadRelayContactGraph()
}

export function reloadRelayContactGraph() {
  const tr = db.transaction('relay-contact-relations', 'readonly')
  const os = tr.objectStore('relay-contact-relations')
  const req = os.openCursor()
  req.onerror = function(e) {
     console.err(e)
  }
  req.onsuccess = function(e) {
    relays.map(r => r.contacts = [])
    contacts.map(c => c.relays = [])
    let cursor = e.target.result
    if (cursor) {
      let v = cursor.value
      contact = contacts.filter(c => c.hpub == v.contactHpub)[0]
      if (!contact.relays.includes(v.relayUrl)) {
        contact.relays.push(v.relayUrl)
      }
      relay = relays.filter(r => r.url == v.relayUrl)[0]
      if (!relay.contacts.includes(v.contactHpub)) {
        relay.contacts.push(v.contactHpub)
      }
      cursor.continue()
    } else {
      relayContactGraphDependencies.map(v => v.setRenderFlag(true))
    }
  }
}
