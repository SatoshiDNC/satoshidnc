import { hpub, npub } from '../../../../key.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.hintColor = [0xb5/0xff, 0xb9/0xff, 0xbc/0xff, 1]
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()

  mat4.identity(m)
  mat4.translate(m,m, [73, 158, 0])
  const s1 = 43/iconFont.calcWidth('\x00')
  mat4.scale(m,m, [s1, s1, 1])
  iconFont.draw(0,0, '\x00', v.hintColor, v.mat, m)

  mat4.identity(m)
  mat4.translate(m,m, [186, 147, 0])
  const s2 = 33/14
  mat4.scale(m,m, [s2, s2, 1])
  defaultFont.draw(0,0, 'Name on this device', v.hintColor, v.mat, m)
    
}
