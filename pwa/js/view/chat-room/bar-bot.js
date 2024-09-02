import { drawPill } from '../../draw.js'

let v, g
export const barBot = v = new fg.View()
v.name = Object.keys({barBot}).pop()
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.gadgets.push(g = v.sendGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.y = 12, g.w = 123, g.h = 123
  g.label = 'Send'
  g.clickFunc = function() {
    const g = this, v = g.viewport
    console.log('send')
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.sendGad
  g.x = v.sw - 135
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)

  let s = 37/14
  drawPill(v, colors.chatTextBox, 13, 11, v.sw - 13 - 148, 123)
  mat4.identity(m)
  mat4.translate(m,m, [131, 92, 0])
  mat4.scale(m,m, [s, s, 1])
  defaultFont.draw(0,0, 'Message', colors.chatInfoText, v.mat, m)

  let g = v.sendGad
  drawPill(v, colors.accent, g.x, g.y, g.w, g.h)
}
