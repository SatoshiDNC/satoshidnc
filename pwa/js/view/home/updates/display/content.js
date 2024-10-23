import { contacts, contactViewDependencies } from '../../../../contacts.js'
import { keys, keyViewDependencies } from '../../../../keys.js'
import { getPersonalData as getAttr, personalData, personalDataViewDependencies } from '../../../../personal.js'
import { drawPill, drawEllipse, alpha } from '../../../../draw.js'
import { kindInfo } from '../../../../nostor.js'
import { overlayView } from './overlay.js'
import { markUpdateAsViewed } from '../../../../content.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.bgColor = [0,0,0, 1]
v.textColor = [1,1,1,1]
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
v.setContext = function(updates) {
  const v = this
  v.updates = updates
  v.startTime = 0
  v.currentUpdate = 0
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
  const data = v.updates[overlayView.currentUpdate].data
  if (data.kind == 1) {
    v.renderKind1(data)
  } else {
    gl.clearColor(...v.bgColor)
    gl.clear(gl.COLOR_BUFFER_BIT)  
  }
  if (data.id != v.lastRenderedId) {
    v.lastRenderedId = data.id
    console.log(data)
  }

  markUpdateAsViewed(data.id, data.created_at * 1000)

}
v.renderKind1 = function(data) {
  const v = this
  gl.clearColor(...[parseInt(data.id[10],16)/64, parseInt(data.id[11],16)/64, parseInt(data.id[12],16)/64, 1])
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  let t,tw,th,ts
  ts = 50/14
  const words = data.content.split(' ')
  const lines = []
  while (words.length > 0) {
    lines.push(words.shift())
    while (words.length > 0 && defaultFont.calcWidth(lines[lines.length] + ' ' + words[0]) * ts <= v.sw) {
      lines.push(lines.pop() + ' ' + words.shift())
    }
  }
  // tw = lines.reduce((a,c) => Math.max(a, defaultFont.calcWidth(c) * ts, 0))
  th = lines.length * defaultFont.glyphHeights[65]
  let i = 1
  for (let line of lines) {
    i++
    tw = defaultFont.calcWidth(line) * ts
    mat4.identity(m)
    mat4.translate(m, m, [(v.sw - tw)/2, (v.sh - th)/2 + i*defaultFont.glyphHeights[65], 0])
    mat4.scale(m, m, [ts, ts, 1])
    defaultFont.draw(0,0, line, v.textColor, v.mat, m)
  }
}