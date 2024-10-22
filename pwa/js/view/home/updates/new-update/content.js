import { contacts, contactViewDependencies } from '../../../../contacts.js'
import { keys, keyViewDependencies } from '../../../../keys.js'
import { getPersonalData as getAttr, personalData, personalDataViewDependencies } from '../../../../personal.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.newGroupGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = 'New group'
  g.x = 0, g.y = 16 + 179 * 0, g.h = 179
  g.clickFunc = function() {
    const g = this, v = this.viewport
    //g.root.easeOut(g.target)
    console.log('newGroupGad click')
  }
v.gadgets.push(g = v.newContactGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = 'New contact'
  g.x = 0, g.y = 16 + 179 * 1, g.h = 179
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
v.gadgets.push(g = v.newCommunityGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = 'New community'
  g.x = 0, g.y = 16 + 179 * 2, g.h = 179
  g.clickFunc = function() {
    const g = this, v = this.viewport
    //g.root.easeOut(g.target)
    console.log('newCommunityGad click')
  }
v.gadgets.push(g = v.scanGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '\x04'
  g.z = 1
  g.clickFunc = function() {
    const g = this, v = this.viewport
    //g.root.easeOut(g.target)
    console.log('scanGad click')
  }
v.gadgets.push(g = v.listGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const x = (e.x - v.x) / v.viewScale - v.x, y = (e.y - v.y) / v.viewScale
    const index = Math.floor((y - 649) / 179)
    const hpub = g.itemList?.[index]
    if (hpub) {
      /// chatRoomView.setContact(hpub)
      g.root.easeOut(g.target)
    }
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.newGroupGad, g.w = v.sw, g.autoHull()
  g = v.newContactGad, g.w = v.sw, g.autoHull()
  g = v.newCommunityGad, g.w = v.sw, g.autoHull()
  g = v.scanGad
  g.x = v.sw - 220, g.y = 261
  g.w = 47, g.h = 47
  g.autoHull()
  g = v.listGad
  g.x = 0, g.y = 0
  g.w = v.sw, g.h = v.sh
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()

  
}
