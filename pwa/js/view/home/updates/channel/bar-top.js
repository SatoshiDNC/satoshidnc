import { drawAvatar, blend } from '../../../../draw.js'
import { getPersonalData } from '../../../../personal.js'

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
v.VPOS0 = 90
v.VPOS1 = 68
v.lastSubtitle = ''
v.subtitleOpacity = 0
v.shirtColor = [v.white, v.yellow, v.red, v.blue]
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = ':'
  g.font = iconFont
  g.fontSize = 11
  g.handler = function(item) {
    cas
    console.log(`id ${JSON.stringify(item)}`)
  }
  g.items = [
    { id: 1, label: 'Copy id', handler: () => { navigator.clipboard.writeText(v.hpub).catch(e => console.error(e)) } },
    { id: 2, handler: g.handler, label: 'View contact' },
    { id: 3, handler: g.handler, label: 'Media, links, and docs' },
    { id: 4, handler: g.handler, label: 'Search' },
    { id: 5, handler: g.handler, label: 'Mute notifications' },
    { id: 6, handler: g.handler, label: 'Disappearing messages' },
    { id: 7, handler: g.handler, label: 'Wallpaper' },
    { id: 8, handler: g.handler, label: 'More' },
  ]
  g.clickFunc = function() {
    const g = this, v = this.viewport
    if (fg.getRoot() !== g.target || g.target.easingState() == -1) {
      g.target?.easeIn?.(g.items)
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
v.setContext = function(hpub) {
  const v = this
  v.hpub = hpub
  v.profile = { name: getPersonalData(v.hpub, 'name') }
  v.bgColor = v.bgColorDefault
  const hexColor = v.hpub[61] + v.hpub[61] + v.hpub[62] + v.hpub[62] + v.hpub[63] + v.hpub[63]
  const rgbColor = parseInt(hexColor,16)
  const bgColor = [((~~(rgbColor/0x10000))&0xff)/0xff, ((~~(rgbColor/0x100))&0xff)/0xff, ((~~(rgbColor/0x1))&0xff)/0xff, 1]
  v.bgColor = blend([0,0,0,1], bgColor, 0.15)
}
v.layoutFunc = function() {
  const v = this
  let g
  g = v.menuGad
  g.x = v.sw - 64
  g.y = 51
  g.w = 12
  g.h = 45
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()  

  // subtle divider line
  mainShapes.useProg2()
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(colors.inactiveDark))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [0, v.sh-2, 0])
  mat4.scale(m,m, [v.sw, 2, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  drawAvatar(v, v.hpub, 75, 27, 92, 92)

  const subtitle = 'Public channel'
  v.lastSubtitle ||= subtitle
  let goal = subtitle? 1: 0
  if (goal != v.subtitleOpacity) {
    v.subtitleOpacity = v.subtitleOpacity * 0.7 + goal * 0.3
    if (Math.abs(goal - v.subtitleOpacity) < 0.005) {
      v.subtitleOpacity = goal
    }
    v.setRenderFlag(true)
  }
  const f1 = v.subtitleOpacity
  const f0 = 1 - f1

  const mat = mat4.create()  
  mat4.identity(mat)
  mat4.translate(mat, mat, [190, v.VPOS0 * f0 + v.VPOS1 * f1, 0])
  mat4.scale(mat, mat, [35/14, 35/14, 1])
  let x = 0, y = 0
  defaultFont.draw(x,y, v.profile.name, v.textColor, v.mat, mat)
  
  mat4.identity(mat)
  mat4.translate(mat, mat, [190, 116, 0])
  mat4.scale(mat, mat, [23/14, 23/14, 1])
  x = 0, y = 0
  // online
  // last seen today at 12:50 PM
  // Business Account
  const c = v.textColor
  defaultFont.draw(x,y, subtitle, [c[0], c[1], c[2], f1], v.mat, mat)

  for (g of v.gadgets) {
    mat4.identity(mat)
    mat4.translate(mat, mat, [g.x, g.y+g.h, 0])
    mat4.scale(mat, mat, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, v.textColor, v.mat, mat)
  }
}
