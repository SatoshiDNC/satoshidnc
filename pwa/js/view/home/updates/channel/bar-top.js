import { drawAvatar, blend, hue, color_from_rgb_integer } from '../../../../draw.js'
import { getName, getHue, personalDataTrigger } from '../../../../personal.js'
import { unfollowChannel } from '../../../../channels.js'
import { balances } from '../../../../deals.js'
import { keys } from '../../../../keys.js'

let v, g
export const barTop = v = new fg.View()
v.name = Object.keys({barTop}).pop()
v.designHeight = 147
v.bgColor = v.bgColorDefault = [0.043,0.078,0.106,1]
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
personalDataTrigger.push(() => { v.setRenderFlag(true) })
v.gadgets.push(g = v.menuGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = ':'
  g.font = iconFont
  g.fontSize = 11
  g.handler = function(item) {
    console.log(`id ${JSON.stringify(item)}`)
  }
  g.items = [
    { id: 1, label: 'Copy id', handler: () => {
      navigator.clipboard.writeText(v.hpub).catch(e => console.error(e))
    }},
    { id: 2, label: 'Channel info', handler: g.handler },
    { id: 3, label: 'Unfollow', handler: () => {
      if (confirm(`Are you sure you want to unfollow "${getName(v.hpub)}"?`)) {
        unfollowChannel(v.hpub)
      }
    }},
    { id: 4, label: 'Share', handler: g.handler },
    { id: 5, label: 'Report', handler: g.handler },
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
  v.selfs = keys.map(k => k.hpub)
  v.hue = getHue(v.hpub)
  v.bgColor = blend([0,0,0,1], v.hue, 0.15)
  v.dividerColor = blend([0,0,0,1], v.hue, 0.25)
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
  gl.uniform4fv(gl.getUniformLocation(prog2, 'overallColor'), new Float32Array(v.dividerColor))
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uProjectionMatrix'), false, v.mat)
  mat4.identity(m)
  mat4.translate(m,m, [0, v.sh-2, 0])
  mat4.scale(m,m, [v.sw, 2, 1])
  gl.uniformMatrix4fv(gl.getUniformLocation(prog2, 'uModelViewMatrix'), false, m)
  mainShapes.drawArrays2('rect')

  drawAvatar(v, v.hpub, 75, 27, 92, 92, v.selfs.includes(v.hpub)?0:balances[v.hpub]?.['sat']||0)

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
  defaultFont.draw(x,y, getName(v.hpub), v.textColor, v.mat, mat)
  
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
