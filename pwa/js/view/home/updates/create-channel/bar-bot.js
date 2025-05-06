import { contacts, addNewContact } from '../../../../contacts.js'
import { getName, getPersonalData, setPersonalData } from '../../../../personal.js'
import { detectRelay } from '../../../../relays.js'
import { addRelayContactRelation, R_KNOWS_C } from '../../../../graph.js'
import { drawPill } from '../../../../draw.js'
import * as nip19 from 'nostr-tools/nip19'

let v, g
export const barBot = v = new fg.View()
v.name = Object.keys({barBot}).pop()
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.saveGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 79, g.h = 104
  g.label = 'Save'
  g.clickFunc = function() {
    const g = this, v = g.viewport
    const name = g.formView.nameGad.text
    const pubkey = g.formView.pubkeyGad.text
    const relay = g.formView.relayGad.text
    if (name && pubkey) {
      let hpub, relays

      // If it's a hex key, use it verbatim
      if (pubkey.length == 64 && Array.from(pubkey.toLowerCase()).reduce((pre, cur) => pre && '01234566789abcdef'.includes(cur), true)) {
        hpub = pubkey.toLowerCase()
      }

      // Otherwise...
      if (!hpub) {

        // Strip the nostr: URL scheme, if present
        let bech32 = pubkey
        if (pubkey.startsWith('nostr:')) {
          bech32 = pubkey.substring(6)
        }

        // Handle Bech32-encoded formats
        try {
          const decoded = nip19.decode(bech32)
          if (decoded?.type == 'nprofile') {
            hpub = decoded.data.pubkey
            relays = decoded.data.relays
          } else if (decoded?.type == 'npub') {
            hpub = decoded.data
          }
        } catch(e) {
          if (bech32.startsWith('nprofile') || bech32.startsWith('npub')) {
            alert(`${e}`)
            return
          }
        }
      }

      // If we couldn't recognize the key, error and return early
      if (!hpub) {
        alert(`Unrecognized public key format. Supported formats include: nprofile, npub, hex`)
        return
      }

      // We have the hex public key; import the contact
      let cancel = false
      const existing = contacts.filter(c => c.hpub == hpub)?.[0]
      if (existing) {
        const existingName = getName(existing.hpub)
        if (name != existingName) {
          if (confirm(`Contact exists as '${existingName}'.\nUpdate name?`)) {
            setPersonalData(hpub, 'name', name)
          } else {
            cancel = true
          }
        }
        const existingRelay = getPersonalData(existing.hpub, 'relay')
        if (relay != existingRelay) {
          if (confirm(`Contact exists with relay '${existingRelay}'.\nUpdate relay?`)) {
            setPersonalData(hpub, 'relay', relay)
          } else {
            cancel = true
          }
        }
      } else {
        addNewContact(hpub, name)
        //setPersonalData(hpub, 'relay', relay) // FIX needed
        relays?.map(r => detectRelay(r))
        relays?.map(r => addRelayContactRelation(r, hpub, R_KNOWS_C))
      }
      if (!cancel) {
        g.root.easeOut(g.target)
        g.formView.clear()
      }
    }
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.saveGad
  g.y = v.sh - 53 - 104
  g.w = v.sw - 79 - 79
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()

  drawPill(v, v.buttonFaceColor, g.x, g.y, g.w, g.h)
  mat4.identity(m)
  const s = 28/14
  mat4.translate(m,m, [g.x + (g.w - defaultFont.calcWidth(g.label) * s) / 2, g.y + 66, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, g.label, v.buttonTextColor, v.mat, m)
}
