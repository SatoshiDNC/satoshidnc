// import { hpub } from '../../keys.js'

let v, g
export const barTop = v = new fg.View()
v.name = Object.keys({barTop}).pop()
v.designHeight = 147
v.bgColor = [0.043,0.078,0.106,1]
v.textColor = [1,1,1,1]
v.white = [1,1,1,1]
v.yellow = [1,0.8,0,1]
v.red = [1,0,0,1]
v.blue = [0,0,1,1]
v.shirtColor = [v.white, v.yellow, v.red, v.blue]
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = ':'
  g.font = iconFont
  g.fontSize = 11
  g.clickFunc = function() {
    const g = this, v = this.viewport
    if (fg.getRoot() !== g.target || g.target.easingState() == -1) {
      g.target?.easeIn?.()
    } else {
      g.target?.easeOut?.()
    }
  }
v.gadgets.push(g = v.backGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '\x08'
  g.x = 23, g.y = 52
  g.w = 42, g.h = 42
  g.font = iconFont
  g.fontSize = 13
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
v.layoutFunc = function() {
  const v = this
  g = v.menuGad
  g.x = v.sw - 64
  g.y = 51
  g.w = 12
  g.h = 45
  g.autoHull()
}
v.renderFunc = function() {
  const v = this, contact = v.contact
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)

  // subtle divider line
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(colors.inactiveDark))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [0, v.sh-2, 0])
  mat4.scale(m,m, [v.sw, 2, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  const mat = mat4.create()  
  mat4.identity(mat)
  mat4.translate(mat, mat, [75, 27, 0])
  mat4.scale(mat, mat, [1/32*92, 1/32*92, 1])
  const m = mat4.create()
  let x = -0.5, y = 8.5
  contact.hpub.toUpperCase().match(/.{1,16}/g).map((str, i) => {
    mat4.copy(m, mat)
    nybbleFont.draw(x,y + i*8, str, v.textColor, v.mat, m)
  })
  mat4.identity(mat)
  mat4.translate(mat, mat, [190, 68, 0])
  mat4.scale(mat, mat, [35/14, 35/14, 1])
  x = 0, y = 0
  defaultFont.draw(x,y, contact.name, v.textColor, v.mat, mat)
  
  mat4.identity(mat)
  mat4.translate(mat, mat, [190, 116, 0])
  mat4.scale(mat, mat, [23/14, 23/14, 1])
  x = 0, y = 0
  // online
  // last seen today at 12:50 PM
  // Business Account
  defaultFont.draw(x,y, 'online', v.textColor, v.mat, mat)

  for (g of v.gadgets) {
    mat4.identity(mat)
    mat4.translate(mat, mat, [g.x, g.y+g.h, 0])
    mat4.scale(mat, mat, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, v.textColor, v.mat, mat)
  }
}
