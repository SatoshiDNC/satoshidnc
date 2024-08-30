import { hpub, npub } from '../../../../key.js'
import { getKeyboardInput } from '../../../util.js'

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
v.gadgets.push(g = v.nameGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 183, g.y = 100, g.h = 70
  g.label = 'Name on this device'
  g.text = ''
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.text = getKeyboardInput(g.label, g.text || 'Satoshi, D.N.C.')
  }
v.gadgets.push(g = v.npubGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 183, g.y = 100 + 212, g.h = 70
  g.label = 'Nostr public key'
  g.text = ''
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.text = getKeyboardInput(g.label, g.text || 'npub128rrvpkys0wfk3ph8682yszffwqsre9j8kjhnutlasv4q2fq06vsez5dlf')
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.nameGad
  g.w = v.sw - 183 - 73
  g.autoHull()
  g = v.npubGad
  g.w = v.sw - 183 - 73
  g.autoHull()
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

  const drawTextInput = (g) => {
    mat4.identity(m)
    mat4.translate(m,m, [g.x + 3, g.y + 47, 0])
    const s = 33/14
    mat4.scale(m,m, [s, s, 1])
    defaultFont.draw(0,0, g.text || g.label, g.text? v.textColor: v.hintColor, v.mat, m)
  }

  drawTextInput(v.nameGad)
  
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.iconColor))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [183, 167, 0])
  mat4.scale(m,m, [v.sw - 183 - 73, 3, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  mat4.identity(m)
  mat4.translate(m,m, [73, 158 + 212, 0])
  s = 43/iconFont.calcWidth('\x06')
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, '\x06', v.iconColor, v.mat, m)

  drawTextInput(v.npubGad)
  
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.iconColor))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [183, 167 + 212, 0])
  mat4.scale(m,m, [v.sw - 183 - 73, 3, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

}
