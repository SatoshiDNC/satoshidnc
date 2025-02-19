import { contacts, addNewContact } from '../../../../../../contacts.js'
import { getPersonalData, setPersonalData } from '../../../../../../personal.js'
import { detectRelay } from '../../../../../../relays.js'
import { addRelayContactRelation, R_KNOWS_C } from '../../../../../../graph.js'
import { drawPill } from '../../../../../../draw.js'
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
    const hpub = g.formView.hpub
    const name = g.formView.nameGad.text
    const relay = g.formView.relayGad.text
    if (name || relay) {
      if (name) {
        setPersonalData(hpub, 'name', name)
      }
      if (relay) {
        setPersonalData(hpub, 'relay', relay)
      }
      g.root.easeOut(g.target)
      g.formView.clear()
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
