import { drawPill, drawEllipse, alpha } from '../../draw.js'
import { contentView } from './updates/content.js'
import { eventTrigger } from '../../content.js'
import { sfx } from '../../sound.js'

let v, g
export const barBot = v = new fg.View()
v.name = Object.keys({barBot}).pop()
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.textColor = [1,1,1,1]
v.panes = [
  { label: 'Chats',       icon: '\x0e', scale: 50/14 },
  { label: 'Updates',     icon: '\x0c', scale: 25/14 },
  { label: 'Communities', icon: '\x09', scale: 25/14 },
  { label: 'Calls',       icon: '\x0b', scale: 25/14 },
]
v.paneGads = []
for (const pane of v.panes) {
  v.gadgets.push(g = new fg.Gadget(v))
  v.paneGads.push(g)
  g.actionFlags = fg.GAF_CLICKABLE
  g.w = 168, g.h = 136
  g.label = pane.label
  g.icon = pane.icon
  g.iconScale = pane.scale
  g.animValue = 0
  g.new = pane.new || false // boolean or integer
  g.clickFunc = function() {
    const g = this, v = g.viewport
    v.activeLabel = g.label
    const pane = v.panes.filter(p => p.label == v.activeLabel)[0]
    pane.view.c = barBot; barBot.parent = pane.view
    pane.view.easingValue = 1
    pane.view.setRenderFlag(true)
    fg.setRoot(pane.view)
    // fg.start(pane.view, true)
    if (v.activeLabel == 'Updates') {
      contentView.queryFunc()
    }
  }
}
eventTrigger.push(() => {
  const updatePane = v.paneGads.filter(g => g.label == 'Updates')[0]
  if (updatePane.label != v.activeLabel) {
    updatePane.new = true
    sfx('new update', false)
  } else {
    sfx('new update', true)
  }
  v.setRenderFlag(true)
})
v.activeLabel = v.paneGads[0].label
v.layoutFunc = function() {
  const v = this
  let x = 0
  for (const g of v.paneGads) {
    g.x = x + (v.sw / 4 - g.w) / 2, g.y = 33
    g.autoHull()
    x += v.sw /4
  }
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()

  // subtle divider
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(colors.inactiveDark))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [0, 0, 0])
  mat4.scale(m,m, [v.sw, 2, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  for (const g of v.paneGads) {
    const goal = g.label == v.activeLabel? 1: 0
    if (g.animValue != goal) {
      g.animValue = g.animValue * 0.7 + goal * 0.3
      if (Math.abs(goal - g.animValue) < 0.005) {
        g.animValue = goal
      }
      setTimeout(() => { v.setRenderFlag(true) })
    }
    const f1 = g.animValue
    const f0 = 1 - f1
    drawPill(v, alpha(colors.accentDark, f1), g.x + g.w/2 * f0, g.y, g.w * f1, 84)
    let s = 26/14
    mat4.identity(m)
    mat4.translate(m,m, [g.x + (g.w - defaultFont.calcWidth(g.label) * s) / 2, g.y + g.h, 0])
    mat4.scale(m,m, [s, s, 1])
    defaultFont.draw(0,0, g.label, v.textColor, v.mat, m)
    s = 50/iconFont.glyphHeights[g.icon.codePointAt(0)]
    mat4.identity(m)
    mat4.translate(m,m, [g.x + (g.w - iconFont.calcWidth(g.icon) * s) / 2, g.y + (50 + 84)/2, 0])
    mat4.scale(m,m, [s, s, 1])
    iconFont.draw(0,0, g.icon, v.textColor, v.mat, m)
    if (g.new) {
      const t = `${g.new}`
      const w = 32 + (!Number.isInteger(g.new)? 0: Math.max(0, defaultFont.calcWidth(t) - defaultFont.calcWidth('0')))
      drawPill(v, colors.accent, g.x + g.w/2 + 23 + 16 - w/2, g.y + 2, w, 32)
      if (Number.isInteger(g.new)) {
        s = 21/14
        mat4.identity(m)
        mat4.translate(m,m, [g.x + g.w/2 + 23 + 16, g.y + 2 + 16, 0])
        mat4.scale(m,m, [s, s, 1])
        defaultFont.draw(-defaultFont.calcWidth(t)/2,7, t, colors.inactiveDark, v.mat, m)
      }
    }
  }
}
