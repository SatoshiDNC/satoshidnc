import { overlayView } from './overlay.js'
import { alpha } from '../../../../draw.js'
import { getKeyboardInput } from '../../../util.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.randomColor = function() {
  const v = this
  v.bgColor = [
    Math.floor(Math.random()*16)/32,
    Math.floor(Math.random()*16)/32,
    Math.floor(Math.random()*16)/32, 1]
  v.setRenderFlag(true)
}
v.randomColor()
v.font = defaultFont
v.textColor = [1,1,1,1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.buttonFaceColor = colors.accentButtonFace
v.buttonTextColor = colors.accentButtonText
v.gadgets.push(g = v.textGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = 'Type a status'
  g.defaultValue = ''
  g.clickFunc = function() {
    const g = this, v = g.viewport
    getKeyboardInput(g.label, g.text || g.defaultValue, value => {
      if (value !== undefined) {
        if (value.trim() == '') {
          g.text = undefined
        } else {
          g.text = value
        }
      }
      overlayView.micSendGad.icon = g.text? '>': overlayView.micSendGad.iconMic
      v.setRenderFlag(true)
    })
  }
v.setContext = function() {
  const v = this
}
v.layoutFunc = function() {
  const v = this
  let g
  g = v.textGad
  g.x = 0, g.y = v.sh/2 - 33
  g.w = v.sw, g.h = 66
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()

  const textColor = g.text? v.textColor : alpha(v.textColor, 0.1)
  const t = g.text || g.label
  let tw,th,ts
  ts = (g.text?50:66)/14
  const words = t.split(' ')
  const lines = []
  while (words.length > 0) {
    lines.push(words.shift())
    while (words.length > 0 && v.font.calcWidth(lines[lines.length-1] + ' ' + words[0]) * ts <= v.sw-100) {
      lines.push(lines.pop() + ' ' + words.shift())
    }
  }
  // tw = lines.reduce((a,c) => Math.max(a, defaultFont.calcWidth(c) * ts, 0))
  th = (lines.length * 2 - 1) * v.font.glyphHeights[65] * ts
  let i = 0
  for (let line of lines) {
    tw = v.font.calcWidth(line) * ts
    mat4.identity(m)
    mat4.translate(m, m, [(v.sw - tw)/2, v.sh/2 - th/2 + i*v.font.glyphHeights[65]*ts*2, 0])
    mat4.scale(m, m, [ts, ts, 1])
    v.font.draw(0,14, line, textColor, v.mat, m)
    i++
  }

}
