// import { hpub, npub } from '../../keys.js'
import { contacts, contactViewDependencies } from '../../../contacts.js'
import { drawPill, drawAvatar } from '../../../draw.js'
import { contentView as chatRoomView } from '../../chat-room/content.js'
import { getPersonalData as getAttr } from '../../../personal.js'
import { addedOn, updatePostedAsOf } from '../../util.js'
import { getUpdates } from '../../../content.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.textColor = [1,1,1,1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.gadgets.push(g = v.listGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.clickFunc = function(e) {
    const g = this, v = this.viewport
    const x = (e.x - v.x) / v.viewScale - v.x, y = (e.y - v.y) / v.viewScale
    const index = Math.floor((y - 167.5) / 200)
    const c = contacts?.[index]
    if (c) {
      chatRoomView.setContact(c.hpub)
      g.root.easeOut(g.target)
    }
  }
v.query = { inProgress: false, lastCompleted: 0, results: [] }
v.queryFunc = function() {
  const v = this
  const ONE_MINUTE_IN_MILLISECONDS = 1 * 60 * 1000
  if (!v.query.inProgress && v.query.lastCompleted < Date.now() - ONE_MINUTE_IN_MILLISECONDS) {
    v.query.inProgress = true
    getUpdates().then(updates => {
      v.query.inProgress = false
      v.query.lastCompleted = Date.now()
      v.query.results = updates
      v.relayout()
    })
  }
}
v.layoutFunc = function() {
  const v = this

  const contacts = []
  for (const update of v.query.results) {
    if (!contacts.includes(update.hpub)) {
      contacts.push(update.hpub)
    }
  }

  let x = 42
  let g
  g = v.listGad
  g.x = 0, g.y = 0
  g.w = v.sw, g.h = v.sh
  g.autoHull()

  v.queryFunc()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()

  mat4.identity(m)
  mat4.translate(m, m, [45, 125, 0])
  mat4.scale(m, m, [41/14, 41/14, 1])
  let x = 0, y = 0
  defaultFont.draw(x,y, 'Status', v.textColor, v.mat, m)

  mat4.identity(m)
  mat4.translate(m, m, [45, 434, 0])
  mat4.scale(m, m, [28/14, 28/14, 1])
  defaultFont.draw(x,y, 'Recent updates', v.subtitleColor, v.mat, m)

  const contacts = []
  for (const update of v.query.results) {
    let y = contacts.length * 200
    if (!contacts.includes(update.hpub)) {
      contacts.push(update.hpub)

      drawAvatar(v, update.hpub, 43,503 + y, 125,125)

      mat4.identity(m)
      mat4.translate(m, m, [211, 553 + y, 0])
      mat4.scale(m, m, [35/14, 35/14, 1])
      defaultFont.draw(x,y, getAttr(update.hpub, 'name'), v.titleColor, v.mat, m)
    
      mat4.identity(m)
      mat4.translate(m, m, [211, 618 + y, 0])
      mat4.scale(m, m, [30/14, 30/14, 1])
      defaultFont.draw(x,y, updatePostedAsOf(update.firstSeen), v.subtitleColor, v.mat, m)
    }
  }

}

export const overlayView = v = new fg.View(null)
v.name = Object.keys({overlayView}).pop()
v.designSize = 1080*1825
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.addGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '+'
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.addGad
  g.x = v.sw-189
  g.y = v.sh-189
  g.w = 147
  g.h = 147
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  const m = mat4.create()
  const g = v.addGad
  mat4.identity(m)
  mat4.translate(m,m, [g.x, g.y + g.h, 0])
  mat4.scale(m,m, [g.w/6, g.h/6, 1])
  iconFont.draw(0,0, `\x0a`, v.buttonFaceColor, v.mat, m)
  mat4.identity(m)
  mat4.translate(m,m, [g.x + 49, g.y + 95, 0])
  mat4.scale(m,m, [51/11, 51/11, 1])
  iconFont.draw(-2,0, g.label, v.buttonTextColor, v.mat, m)
}
