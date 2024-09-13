import { device, contacts, contactViewDependencies } from '../../../contacts.js'
import { drawPill } from '../../../draw.js'
import { contentView as chatRoomView } from '../../chat-room/content.js'
import { defaultKey } from '../../../keys.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.subtitleColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.gadgets.push(g = v.cameraGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.w = 127, g.h = 127
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click 'camera'`)
  }
v.gadgets.push(g = v.picGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.y = 65
  g.w = 416, g.h = 416
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click 'photo'`)
  }
v.layoutFunc = function() {
  const v = this
  let g
  g = v.picGad
  g.x = (v.sw - g.w) / 2
  g.autoHull()
  g = v.cameraGad
  g.x = v.picGad.x + 291, g.y = v.picGad.y + 297
  g.autoHull()
}
contactViewDependencies.push(v)
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)  
  const m = mat4.create()
  const mat = mat4.create()
  let c = { hpub: defaultKey, name: 'Unnamed' }
  let str
  let g

  g = v.picGad
  mat4.identity(mat)
  mat4.translate(mat, mat, [g.x, g.y, 0])
  mat4.scale(mat, mat, [g.w/32, g.h/32, 1])
  let x = -0.5, y = 8.5
  c.hpub.toUpperCase().match(/.{1,16}/g).map((str, i) => {
    mat4.copy(m, mat)
    nybbleFont.draw(x,y + i*8, str, v.titleColor, v.mat, m)
  })

  g = v.cameraGad
  drawPill(v, colors.accent, g.x, g.y, g.w, g.h)

  mat4.identity(m)
  mat4.translate(m,m, [192, 610, 0])
  const s1 = 33/14
  mat4.scale(m,m, [s1, s1, 1])
  const w1 = v.sw - 192 - 192
  if (defaultFont.calcWidth(c.name) * s1 > w1) {
    let l = c.name.length
    while (defaultFont.calcWidth(c.name.substring(0,l)+'...') * s1 > w1) {
      l--
    }
    str = c.name.substring(0,l)+'...'
  } else {
    str = c.name
  }
  defaultFont.draw(0,0, str, v.titleColor, v.mat, m)

  let rawText = c.statusText || 'I’m using Nostor!'
  mat4.identity(m)
  mat4.translate(m,m, [192, 993, 0])
  mat4.scale(m,m, [s1, s1, 1])
  if (defaultFont.calcWidth(rawText) * s1 > w1) {
    let l = rawText.length
    while (defaultFont.calcWidth(rawText.substring(0,l)+'...') * s1 > w1) {
      l--
    }
    str = rawText.substring(0,l)+'...'
  } else {
    str = rawText
  }
  defaultFont.draw(0,0, str, v.titleColor, v.mat, m)

  for (g of v.gadgets) if (g.label) {
    mat4.identity(m)
    mat4.translate(m, m, [g.x, g.y+g.h, 0])
    mat4.scale(m, m, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, g.color, v.mat, m)
  }
}
