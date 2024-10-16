import { setEasingParameters } from '../../../util.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.hintColor = [0xb5/0xff, 0xb9/0xff, 0xbc/0xff, 1]
v.textColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.iconColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.setContact = function(hpub) {
  const v = this
  v.hpub = hpub
}
v.layoutFunc = function() {
  const v = this
  let g
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  let s

  mat4.identity(m)
  mat4.translate(m,m, [73, 158, 0])
  s = 43/iconFont.calcWidth('\x00')
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, '\x00', v.iconColor, v.mat, m)

  mat4.identity(m)
  mat4.translate(m,m, [73, 158 + 212, 0])
  s = 43/iconFont.calcWidth('\x06')
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, '\x06', v.iconColor, v.mat, m)

  for (g of v.gadgets) {
  }
}
setEasingParameters(v)