import { drawPill, drawEllipse, alpha } from '../../../../draw.js'
import { getPersonalData as getAttr } from '../../../../personal.js'
import { updatePostedAsOf } from '../../../util.js'
import { kindInfo } from '../../../../nostor.js'

let v, g
export const overlayView = v = new fg.View(null)
v.name = Object.keys({overlayView}).pop()
v.designSize = 1080*1825
v.bgColor = [0x12/0xff, 0x1b/0xff, 0x22/0xff, 1]
v.textColor = [1,1,1,1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.backGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 39, g.y = 63, g.w = 48, g.h = 48
  g.label = '\x08'
  g.font = iconFont
  g.fontSize = 13
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    //g.root.easeOut(g.target)
    v.returnView.easingState = 1
    v.returnView.easingValue = 0
    fg.setRoot(v.returnView)
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
  // g = v.addGad
  // g.x = v.sw-189
  // g.y = v.sh-189
  // g.w = 147
  // g.h = 147
  // g.autoHull()
}
v.renderFunc = function() {
  const v = this
  const m = mat4.create()

  const numUpdates = v.updates.length
  if (!v.startTime) {
    v.startTime = Date.now()
  }
  const now = Date.now()
  const elapsedTime = now - v.startTime
  const w = (v.sw-9-3-6*numUpdates)/numUpdates
  let pageTurn = false
  for (let i = 0; i < numUpdates; i++) {
    if (i < v.currentUpdate) {
      drawPill(v, [1,1,1,1], 9+(w+6)*i,9, w,6)
    } else if (i > v.currentUpdate) {
      drawPill(v, colors.inactive, 9+(w+6)*i,9, w,6)
    } else {
      drawPill(v, colors.inactive, 9+(w+6)*i,9, w,6)
      drawPill(v, [1,1,1,1], 9+(w+6)*i,9, 6+(w-6)*(Math.max(0,Math.min(1,elapsedTime / 4000))),6)
      v.setRenderFlag(true)
      if (elapsedTime > 4000) {
        pageTurn = true
      }
    }
  }

  for (g of v.gadgets) if (g.label) {
    mat4.identity(m)
    mat4.translate(m, m, [g.x, g.y+g.h, 0])
    mat4.scale(m, m, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, v.textColor, v.mat, m)
  }

  drawEllipse(v, [1,1,1,1], 126,34, 105,105)
  drawEllipse(v, colors.inactive, 129,37, 99,99)

  mat4.identity(m)
  mat4.translate(m, m, [263, 82, 0])
  mat4.scale(m, m, [33/14, 33/14, 1])
  defaultFont.draw(0,0, getAttr(v.updates[v.currentUpdate].hpub, 'name'), v.textColor, v.mat, m)

  const data = v.updates[v.currentUpdate].data

  mat4.identity(m)
  mat4.translate(m, m, [263, 131, 0])
  mat4.scale(m, m, [24/14, 24/14, 1])
  defaultFont.draw(0,0, updatePostedAsOf(data.created_at * 1000, true), v.textColor, v.mat, m)

  let t,tw,th,ts

  t = `${data.kind} · ${(''+kindInfo.filter(r=>r.kindMax?r.kind<=data.kind&&data.kind<=r.kindMax:r.kind==data.kind)?.[0]?.desc).toUpperCase()}`
  // tw = defaultFont.calcWidth(t)
  // ts = 20/14
  // mat4.identity(m)
  // mat4.translate(m, m, [15, 200, 0])
  mat4.scale(m, m, [0.5, 0.5, 1])
  defaultFont.draw(0,0, t, alpha(colors.inactive, 0.5), v.mat, m)

  // const g = v.addGad
  // mat4.identity(m)
  // mat4.translate(m,m, [g.x, g.y + g.h, 0])
  // mat4.scale(m,m, [g.w/6, g.h/6, 1])
  // iconFont.draw(0,0, `\x0a`, v.buttonFaceColor, v.mat, m)
  // mat4.identity(m)
  // mat4.translate(m,m, [g.x + 49, g.y + 95, 0])
  // mat4.scale(m,m, [51/11, 51/11, 1])
  // iconFont.draw(-2,0, g.label, v.buttonTextColor, v.mat, m)

  if (pageTurn) {
    v.currentUpdate += 1
    v.startTime = Date.now()
    if (v.currentUpdate >= v.updates.length) {
      setTimeout(() => {
        v.returnView.easingState = 1
        v.returnView.easingValue = 0
        fg.setRoot(v.returnView)
      })
    }
  }

}
