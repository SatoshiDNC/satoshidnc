import { drawPill, drawRect } from '../../draw.js'
import { getKeyboardInput } from '../util.js'
import { contacts } from '../../contacts.js'

let v, g
export const barBot = v = new fg.View()
v.name = Object.keys({barBot}).pop()
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.gadgets.push(g = v.msgGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.x = 127, g.y = 12, g.h = 123
  g.hint = 'Message'
  g.text = '', g.defaultValue = 'Type something'
  g.animValue = 0
  g.focusValue = 0
  g.focused = false
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.focused = true
    v.setRenderFlag(true)
    g.timerId = setInterval(() => {
      if (g.focusValue != 1) return
      getKeyboardInput(g.label, g.text || g.defaultValue, value => {
        if (value !== undefined) g.text = value
        g.focused = false
        v.setRenderFlag(true)
      })
      clearInterval(g.timerId), delete g.timerId
    }, 10)
  }
v.gadgets.push(g = v.sendGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.y = 12, g.w = 123, g.h = 123
  g.label = 'Send'
  g.handler = function(item) {
    console.log(`send as ${JSON.stringify(item)}`)
  }
  g.items = []
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.items = contacts.map(c => { return { name: c.name, handler: g.handler } })
    if (fg.getRoot() !== g.target || g.target.easingState() == -1) {
      g.target?.easeIn?.(g.items)
    } else {
      g.target?.easeOut?.()
    }
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.msgGad
  g.w = v.sw - 400 - g.x
  g.autoHull()
  g = v.sendGad
  g.x = v.sw - 135
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)
  const m = mat4.create()

  let g = v.msgGad
  let goal = g.focused? 1: 0
  if (goal != g.focusValue) {
    g.focusValue = g.focusValue * 0.0 + goal * 1.0
    if (Math.abs(goal - g.focusValue) < 0.005) {
      g.focusValue = goal
    }
    v.setRenderFlag(true)
  }
  const f1 = g.focusValue
  const f0 = 1 - f1

  let s = 37/14
  drawPill(v, colors.chatTextBox, 13, 11, v.sw - 13 - 148, 123)
  mat4.identity(m)
  mat4.translate(m,m, [131, 92, 0])
  mat4.scale(m,m, [s, s, 1])
  let str
  const max = g.w - 3
  if (defaultFont.calcWidth(g.text) * s > max) {
    let l = g.text.length
    while (defaultFont.calcWidth(g.text.substring(0,l)+'...') * s > max) {
      l--
    }
    str = g.text.substring(0,l)+'...'
  } else {
    str = g.text
  }
  defaultFont.draw(0,0, str||g.hint, g.text?[1,1,1,1]:colors.chatInfoText, v.mat, m)
  drawRect(v, colors.accent.map((v,i)=>i==3?f1:v), g.x, g.y+26, 5, 70)

  g = v.sendGad
  drawPill(v, colors.accent, g.x, g.y, g.w, g.h)
  mat4.identity(m)
  mat4.translate(m,m, [g.x + 42, g.y + 83, 0])
  s = 42/7
  mat4.scale(m,m, [s, s, 1])
  iconFont.draw(0,0, '>', v.bgColor, v.mat, m)
}
