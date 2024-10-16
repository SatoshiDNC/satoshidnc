import { setEasingParameters } from '../../../util.js'
import { drawAvatar } from '../../../../draw.js'
import { getPersonalData as get } from '../../../../personal.js'

let v, g
export const contentView = v = new fg.View(null)
v.name = Object.keys({contentView}).pop()
v.designSize = 1080 * 2183
v.splashMode = 0
v.frameTimes = []
v.bgColor = [0x0b/0xff, 0x14/0xff, 0x1b/0xff, 1]
v.titleColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.hintColor = [0xb5/0xff, 0xb9/0xff, 0xbc/0xff, 1]
v.textColor = [0xe9/0xff, 0xed/0xff, 0xee/0xff, 1]
v.iconColor = [0x8d/0xff, 0x95/0xff, 0x98/0xff, 1]
v.gadgets.push(g = v.backGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '\x08'
  g.x = 43, g.y = 52
  g.w = 42, g.h = 42
  g.font = iconFont
  g.fontSize = 13
  g.autoHull()
  g.clickFunc = function() {
    const g = this, v = this.viewport
    g.root.easeOut(g.target)
  }
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
    { id: 1, label: 'Copy id', handler: () => { navigator.clipboard.writeText(v.contact.hpub).catch(e => console.error(e)) } },
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
v.gadgets.push(g = v.lawGad = new fg.Gadget(v))
  g.actionFlags = fg.GAF_CLICKABLE
  g.label = '='
  g.font = iconFont
  g.fontSize = 11
  g.clickFunc = function() {
    const g = this, v = this.viewport
    console.log(`click '${g.label}'`)
  }
v.gadgets.push(g = v.scrollGad = new fg.SwipeGadget(v))
  g.actionFlags = fg.GAF_SCROLLABLE_UPDOWN
v.setContact = function(hpub) {
  const v = this
  v.hpub = hpub
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
  g = v.lawGad
  g.x = v.menuGad.x - 64
  g.y = 51
  g.w = 12
  g.h = 45
  g.autoHull()
}
v.renderFunc = function() {
  const v = this
  gl.clearColor(...v.bgColor)
  gl.clear(gl.COLOR_BUFFER_BIT)

  const hpub = v.hpub
  drawAvatar(v, hpub, (v.sw-316)/2, 30, 316, 316)

  let t,tw,ts

  const mat = mat4.create()
  t = get(hpub, 'name') || 'Unnamed'
  tw = defaultFont.calcWidth(t)
  ts = 49/14
  mat4.identity(mat)
  mat4.translate(mat, mat, [(v.sw - tw * ts) / 2, 430, 0])
  mat4.scale(mat, mat, [ts, ts, 1])
  defaultFont.draw(0,0, t, v.textColor, v.mat, mat)

  for (g of v.gadgets) {
    mat4.identity(mat)
    mat4.translate(mat, mat, [g.x, g.y+g.h, 0])
    mat4.scale(mat, mat, [g.h/g.fontSize, g.h/g.fontSize, 1])
    g.font.draw(0,0, g.label, v.textColor, v.mat, mat)
  }
  v.renderFinish() // kludge
}
setEasingParameters(v)