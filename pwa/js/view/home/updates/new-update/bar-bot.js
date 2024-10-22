import { drawPill, alpha } from '../../../../draw.js'

let v, g
export const barBot = v = new fg.View()
v.name = Object.keys({barBot}).pop()
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.textColor = [1,1,1,1]
v.panes = [{ label: 'Audio' }, { label: 'Video' }, { label: 'Photo' }]
v.paneGads = []
for (const pane of v.panes) {
  v.gadgets.push(g = new fg.Gadget(v))
  v.paneGads.push(g)
  g.actionFlags = fg.GAF_CLICKABLE
  g.textScale = 28/14
  g.w = defaultFont.calcWidth(pane.label) * g.textScale, g.h = 28
  g.label = pane.label
  g.icon = pane.icon
  g.animValue = 0
  g.clickFunc = function() {
    const g = this, v = g.viewport
    v.activeLabel = g.label
    const pane = v.panes.filter(p => p.label == v.activeLabel)[0]
    console.log(pane)
    pane.view.c = barBot; barBot.parent = pane.view
    pane.view.easingValue = 1
    pane.view.setRenderFlag(true)
    fg.setRoot(pane.view)
  }
}
v.activeLabel = v.paneGads[0].label
v.layoutFunc = function() {
  const v = this
  let x = v.sw / 2
  for (const g of v.paneGads) {
    g.x = x - g.w / 2, g.y = 90-28
    g.autoHull()
    x += g.w + 96
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
    drawPill(v, alpha(colors.bubbleDark, f1), g.x + g.w/2 * f0 - 48 * f1, 26, (g.w + 96) * f1, 96)
    mat4.identity(m)
    const s = g.textScale
    mat4.translate(m,m, [g.x + (g.w - defaultFont.calcWidth(g.label) * s) / 2, g.y + g.h, 0])
    mat4.scale(m,m, [s, s, 1])
    defaultFont.draw(0,0, g.label, v.textColor, v.mat, m)
  }
}
