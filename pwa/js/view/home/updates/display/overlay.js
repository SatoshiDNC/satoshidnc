import { drawPill } from '../../../../draw.js'

let v, g
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
v.setContext = function(updates) {
  const v = this
  v.updates = updates
  v.startTime = 0
  v.currentUpdate = 1
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
      drawPill(v, [1,1,1,1], 9+(w+6)*i,9, w*(Math.max(6,Math.min(1,elapsedTime / 4000))),6)
      v.setRenderFlag(true)
      if (elapsedTime > 4000) {
        pageTurn = true
      }
    }
  }
  if (pageTurn) {
    v.currentUpdate += 1
    v.startTime = Date.now()
    if (v.currentUpdate >= v.updates.length) {
      setTimeout(() => {
        fg.setRoot(v.returnView)
        v.setRenderFlag(true)
  
      }, 100)
    }
  }

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
